-- Phase 03: Prescription Trigger Consolidation & Write Optimization (P1)
-- Target Issues: PERF-005

-- 1. Drop row-level detail trigger and function on prescription_details
DROP TRIGGER IF EXISTS trg_update_daily_stats_details ON public.prescription_details;
DROP FUNCTION IF EXISTS public.update_daily_stats_from_details();

-- 2. Modify header triggers so they only fire on UPDATE or DELETE
DROP TRIGGER IF EXISTS trg_sync_clinic_daily_stats ON public.prescriptions_header;
CREATE TRIGGER trg_sync_clinic_daily_stats
AFTER UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_clinic_daily_stats();

DROP TRIGGER IF EXISTS trg_update_patient_last_visit ON public.prescriptions_header;
CREATE TRIGGER trg_update_patient_last_visit
AFTER UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION public.update_patient_last_visit_date();

-- 3. Enhance clinic_daily_stats schema with metrics
ALTER TABLE public.clinic_daily_stats 
  ADD COLUMN IF NOT EXISTS prescription_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS medicine_revenue NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_revenue NUMERIC(15, 2) DEFAULT 0;

UPDATE public.clinic_daily_stats 
SET prescription_count = visit_count 
WHERE prescription_count IS NULL OR prescription_count = 0;

-- 4. Update fn_sync_clinic_daily_stats to keep prescription_count in sync on UPDATE and DELETE
CREATE OR REPLACE FUNCTION public.fn_sync_clinic_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_old_date DATE;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        v_old_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
        v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        IF (v_old_date <> v_date OR OLD.clinic_id <> NEW.clinic_id) THEN
            -- Decrement old date
            UPDATE public.clinic_daily_stats
            SET visit_count = GREATEST(0, visit_count - 1),
                prescription_count = GREATEST(0, COALESCE(prescription_count, visit_count) - 1),
                total_revenue = total_revenue - OLD.total_amount
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date;

            -- Cleanup old date if empty
            DELETE FROM public.clinic_daily_stats
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date AND visit_count <= 0;

            -- Increment new date (UPSERT)
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, prescription_count, total_revenue)
            VALUES (NEW.clinic_id, v_date, 1, 1, NEW.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET visit_count = clinic_daily_stats.visit_count + 1,
                prescription_count = COALESCE(clinic_daily_stats.prescription_count, 0) + 1,
                total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;
        ELSE
            -- Same day, same clinic: only adjust revenue
            UPDATE public.clinic_daily_stats
            SET total_revenue = total_revenue - OLD.total_amount + NEW.total_amount
            WHERE clinic_id = NEW.clinic_id AND date = NEW.prescription_date::DATE;
        END IF;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        v_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        UPDATE public.clinic_daily_stats
        SET visit_count = GREATEST(0, visit_count - 1),
            prescription_count = GREATEST(0, COALESCE(prescription_count, visit_count) - 1),
            total_revenue = total_revenue - OLD.total_amount
        WHERE clinic_id = OLD.clinic_id AND date = v_date;

        -- Cleanup: remove row if no visits left
        DELETE FROM public.clinic_daily_stats
        WHERE clinic_id = OLD.clinic_id AND date = v_date AND visit_count <= 0;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Extend schema for prescription_details, medicines, and patients compatibility
ALTER TABLE public.prescription_details ADD COLUMN IF NOT EXISTS dosage TEXT;
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS name_normalized TEXT;
ALTER TABLE public.patients ALTER COLUMN phone SET DEFAULT '';
ALTER TABLE public.patients ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.patients ALTER COLUMN dob SET DEFAULT '';
ALTER TABLE public.patients ALTER COLUMN dob DROP NOT NULL;

-- 6. Create alias view for prescriptions table
CREATE OR REPLACE VIEW public.prescriptions AS SELECT * FROM public.prescriptions_header;
GRANT ALL ON public.prescriptions TO authenticated, service_role;

-- 7. Ensure set_clinic_id_from_profile preserves explicit clinic_id (service role / background jobs)
CREATE OR REPLACE FUNCTION public.set_clinic_id_from_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    IF NEW.clinic_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    v_clinic_id := get_my_clinic_id();
    
    IF v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User profile or clinic not found. Cannot determine clinic_id.';
    END IF;

    NEW.clinic_id := v_clinic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Drop older overloaded create_prescription functions to prevent ambiguous RPC calls
DROP FUNCTION IF EXISTS public.create_prescription(bigint, text, jsonb, text, real);
DROP FUNCTION IF EXISTS public.create_prescription(bigint, text, jsonb, text, real, text);

-- 9. Atomic, consolidated create_prescription RPC
CREATE OR REPLACE FUNCTION public.create_prescription(
  p_patient_id BIGINT,
  p_diagnosis TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT ''::TEXT,
  p_consultation_fee NUMERIC DEFAULT 0,
  p_weight TEXT DEFAULT NULL::TEXT,
  p_clinic_id BIGINT DEFAULT NULL,
  p_doctor_id TEXT DEFAULT NULL,
  p_total_amount NUMERIC DEFAULT NULL,
  p_payment_status TEXT DEFAULT NULL,
  p_prescription_date TIMESTAMPTZ DEFAULT NULL
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clinic_id BIGINT;
  v_header_id BIGINT;
  v_item JSONB;
  v_medicine_id BIGINT;
  v_quantity INTEGER;
  v_unit_price NUMERIC(15, 2);
  v_item_total NUMERIC(15, 2);
  v_total_medicines NUMERIC(15, 2) := 0;
  v_total_quantity INTEGER := 0;
  v_final_total NUMERIC(15, 2);
  v_history_snapshot TEXT := '';
  v_index INTEGER := 1;
  v_current_stock INTEGER;
  v_medicine_name TEXT;
  v_db_price NUMERIC(15, 2);
  v_stat_date DATE;
  v_presc_date TIMESTAMPTZ;
BEGIN
  -- A. Validation check
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Prescription items must be a non-empty array';
  END IF;

  -- B. Resolve clinic_id and enforce tenant boundary
  IF get_my_clinic_id() IS NOT NULL THEN
    v_clinic_id := get_my_clinic_id();
    IF p_clinic_id IS NOT NULL AND p_clinic_id <> v_clinic_id THEN
      RAISE EXCEPTION 'Access denied: clinic_id mismatch';
    END IF;
  ELSIF p_clinic_id IS NOT NULL THEN
    v_clinic_id := p_clinic_id;
  ELSE
    SELECT clinic_id INTO v_clinic_id FROM public.patients WHERE id = p_patient_id;
  END IF;

  IF v_clinic_id IS NULL THEN
    v_clinic_id := 1;
  END IF;

  -- C. Validate patient exists in clinic
  IF NOT EXISTS (SELECT 1 FROM public.patients WHERE id = p_patient_id AND clinic_id = v_clinic_id) THEN
    RAISE EXCEPTION 'Patient not found or access denied';
  END IF;

  v_presc_date := COALESCE(p_prescription_date, NOW());
  v_stat_date := (v_presc_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
  v_history_snapshot := COALESCE(p_notes, '') || E'\n---\n';

  -- D. Validate each item, lock stock row, calculate subtotals, and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_medicine_id := (v_item->>'medicine_id')::BIGINT;
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % for medicine ID %', v_quantity, v_medicine_id;
    END IF;

    -- Concurrency row lock on target medicine
    SELECT stock_quantity, name, price 
    INTO v_current_stock, v_medicine_name, v_db_price
    FROM public.medicines
    WHERE id = v_medicine_id AND clinic_id = v_clinic_id
    FOR NO KEY UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Medicine with ID % not found or access denied', v_medicine_id;
    END IF;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for medicine %: requested %, available %',
        v_medicine_name, v_quantity, v_current_stock;
    END IF;

    -- Price resolution: payload price takes precedence if provided, fallback to DB price
    IF (v_item->>'unit_price') IS NOT NULL THEN
      v_unit_price := (v_item->>'unit_price')::NUMERIC(15, 2);
    ELSE
      v_unit_price := COALESCE(v_db_price, 0)::NUMERIC(15, 2);
    END IF;

    IF (v_item->>'total_price') IS NOT NULL THEN
      v_item_total := (v_item->>'total_price')::NUMERIC(15, 2);
    ELSE
      v_item_total := (v_quantity * v_unit_price)::NUMERIC(15, 2);
    END IF;

    v_total_medicines := v_total_medicines + v_item_total;
    v_total_quantity := v_total_quantity + v_quantity;

    v_history_snapshot := v_history_snapshot || v_index || ') '
      || COALESCE(v_item->>'medicine_name', v_medicine_name) || ' x '
      || v_quantity || ' '
      || COALESCE(v_item->>'packing_spec', '') || E'\n';
    v_index := v_index + 1;

    -- Deduct stock atomically
    UPDATE public.medicines
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_medicine_id AND clinic_id = v_clinic_id;
  END LOOP;

  -- E. Determine final total
  IF p_total_amount IS NOT NULL THEN
    v_final_total := p_total_amount::NUMERIC(15, 2);
  ELSE
    v_final_total := (v_total_medicines + COALESCE(p_consultation_fee, 0))::NUMERIC(15, 2);
  END IF;

  -- F. Insert prescription header once with full total_amount (no trigger storm)
  INSERT INTO public.prescriptions_header (
    patient_id,
    diagnosis,
    notes,
    consultation_fee,
    clinic_id,
    total_amount,
    prescription_date
  ) VALUES (
    p_patient_id,
    p_diagnosis,
    COALESCE(p_notes, ''),
    COALESCE(p_consultation_fee, 0)::NUMERIC(15, 2),
    v_clinic_id,
    v_final_total,
    v_presc_date
  )
  RETURNING id INTO v_header_id;

  -- G. Insert detail line items (zero cascading triggers)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_medicine_id := (v_item->>'medicine_id')::BIGINT;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := COALESCE(
      (v_item->>'unit_price')::NUMERIC(15, 2),
      (SELECT price FROM public.medicines WHERE id = v_medicine_id)
    );

    INSERT INTO public.prescription_details (
      prescription_header_id,
      medicine_id,
      quantity,
      unit_price,
      dosage
    ) VALUES (
      v_header_id,
      v_medicine_id,
      v_quantity,
      v_unit_price,
      v_item->>'dosage'
    );
  END LOOP;

  -- H. Single atomic upsert into clinic_daily_stats (O(1) write scaling)
  INSERT INTO public.clinic_daily_stats (
    clinic_id,
    date,
    visit_count,
    prescription_count,
    total_revenue,
    medicine_revenue,
    service_revenue,
    medicine_count
  ) VALUES (
    v_clinic_id,
    v_stat_date,
    1,
    1,
    v_final_total,
    v_total_medicines,
    COALESCE(p_consultation_fee, 0)::NUMERIC(15, 2),
    v_total_quantity
  )
  ON CONFLICT (clinic_id, date) DO UPDATE
  SET visit_count = clinic_daily_stats.visit_count + 1,
      prescription_count = COALESCE(clinic_daily_stats.prescription_count, 0) + 1,
      total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue,
      medicine_revenue = COALESCE(clinic_daily_stats.medicine_revenue, 0) + EXCLUDED.medicine_revenue,
      service_revenue = COALESCE(clinic_daily_stats.service_revenue, 0) + EXCLUDED.service_revenue,
      medicine_count = COALESCE(clinic_daily_stats.medicine_count, 0) + EXCLUDED.medicine_count;

  -- I. Atomic update patient diagnosis, weight, and last_visit_date
  UPDATE public.patients
  SET 
    diagnosis = p_diagnosis,
    weight = COALESCE(p_weight, weight),
    last_visit_date = v_presc_date,
    updated_at = NOW()
  WHERE id = p_patient_id AND clinic_id = v_clinic_id;

  -- J. Record history log
  INSERT INTO public.patient_history_logs (
    patient_id,
    clinic_id,
    prescription_id,
    diagnosis,
    medical_history_snapshot,
    weight
  ) VALUES (
    p_patient_id,
    v_clinic_id,
    v_header_id,
    p_diagnosis,
    v_history_snapshot,
    p_weight
  );

  RETURN v_header_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_prescription FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_prescription TO authenticated, service_role;
