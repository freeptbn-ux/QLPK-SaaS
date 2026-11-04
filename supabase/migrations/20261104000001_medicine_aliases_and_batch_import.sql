-- Phase 01: Database Alias Storage & Atomic Batch Ingestion
-- Migration: 20261104000001_medicine_aliases_and_batch_import.sql

-- 1. Create medicine_aliases table
CREATE TABLE IF NOT EXISTS public.medicine_aliases (
  id BIGSERIAL PRIMARY KEY,
  clinic_id BIGINT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  medicine_id BIGINT NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_medicine_aliases_clinic_raw UNIQUE (clinic_id, raw_name)
);

-- 2. Foreign Key and Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_medicine_aliases_medicine_id 
  ON public.medicine_aliases(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_aliases_clinic_raw 
  ON public.medicine_aliases(clinic_id, raw_name);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.medicine_aliases ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for medicine_aliases
DROP POLICY IF EXISTS "Users can view medicine aliases in their clinic" ON public.medicine_aliases;
CREATE POLICY "Users can view medicine aliases in their clinic" 
  ON public.medicine_aliases FOR SELECT 
  TO authenticated 
  USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can insert medicine aliases in their clinic" ON public.medicine_aliases;
CREATE POLICY "Users can insert medicine aliases in their clinic" 
  ON public.medicine_aliases FOR INSERT 
  TO authenticated 
  WITH CHECK (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can update medicine aliases in their clinic" ON public.medicine_aliases;
CREATE POLICY "Users can update medicine aliases in their clinic" 
  ON public.medicine_aliases FOR UPDATE 
  TO authenticated 
  USING (clinic_id = get_my_clinic_id()) 
  WITH CHECK (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can delete medicine aliases in their clinic" ON public.medicine_aliases;
CREATE POLICY "Users can delete medicine aliases in their clinic" 
  ON public.medicine_aliases FOR DELETE 
  TO authenticated 
  USING (clinic_id = get_my_clinic_id());

-- 5. Trigger for automatic clinic_id injection
DROP TRIGGER IF EXISTS tr_set_clinic_id_medicine_aliases ON public.medicine_aliases;
CREATE TRIGGER tr_set_clinic_id_medicine_aliases 
  BEFORE INSERT ON public.medicine_aliases 
  FOR EACH ROW EXECUTE FUNCTION public.set_clinic_id_from_profile();

-- 6. Table & Sequence Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicine_aliases TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE medicine_aliases_id_seq TO authenticated, service_role;

-- 7. Atomic Batch Stock Ingestion RPC
CREATE OR REPLACE FUNCTION public.import_medicine_stock_batch(
  p_adjustments JSONB DEFAULT '[]'::jsonb,
  p_new_medicines JSONB DEFAULT '[]'::jsonb,
  p_reason TEXT DEFAULT 'IMPORT_EXCEL',
  p_clinic_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clinic_id BIGINT;
  v_user_id UUID;
  v_new_med JSONB;
  v_adj RECORD;
  v_created_id BIGINT;
  v_name TEXT;
  v_packing_spec TEXT;
  v_unit TEXT;
  v_price NUMERIC;
  v_initial_stock INT;
  v_old_qty INT;
  v_new_qty INT;
  v_updated_count INT := 0;
  v_created_count INT := 0;
  v_created_ids BIGINT[] := '{}';
BEGIN
  -- Determine clinic_id: prioritize active clinic from JWT/session profile
  v_user_id := auth.uid();
  v_clinic_id := get_my_clinic_id();

  -- If called without session context (e.g. service_role / background jobs), fallback to explicit p_clinic_id
  IF v_clinic_id IS NULL THEN
    v_clinic_id := p_clinic_id;
  END IF;

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Clinic context could not be determined';
  END IF;

  -- 7.1 Register approved new medicines (if any)
  IF p_new_medicines IS NOT NULL AND jsonb_array_length(p_new_medicines) > 0 THEN
    FOR v_new_med IN SELECT * FROM jsonb_array_elements(p_new_medicines) LOOP
      v_name := trim(v_new_med->>'name');
      IF v_name IS NULL OR v_name = '' THEN
        RAISE EXCEPTION 'New medicine name cannot be empty';
      END IF;

      v_packing_spec := v_new_med->>'packing_spec';
      v_unit := v_new_med->>'unit';
      v_price := COALESCE((v_new_med->>'price')::NUMERIC, 0);
      v_initial_stock := COALESCE((v_new_med->>'initial_stock')::INT, 0);

      IF v_initial_stock < 0 THEN
        RAISE EXCEPTION 'Initial stock cannot be negative for %', v_name;
      END IF;

      INSERT INTO public.medicines (
        clinic_id,
        name,
        packing_spec,
        unit,
        price,
        stock_quantity,
        is_active
      ) VALUES (
        v_clinic_id,
        v_name,
        v_packing_spec,
        v_unit,
        v_price,
        v_initial_stock,
        true
      ) RETURNING id INTO v_created_id;

      v_created_count := v_created_count + 1;
      v_created_ids := array_append(v_created_ids, v_created_id);

      IF v_initial_stock > 0 THEN
        INSERT INTO public.inventory_transaction_logs (
          clinic_id,
          medicine_id,
          user_id,
          old_quantity,
          new_quantity,
          adjustment,
          reason
        ) VALUES (
          v_clinic_id,
          v_created_id,
          v_user_id,
          0,
          v_initial_stock,
          v_initial_stock,
          p_reason
        );
      END IF;
    END LOOP;
  END IF;

  -- 7.2 Process batch adjustments with deterministic lock order
  IF p_adjustments IS NOT NULL AND jsonb_array_length(p_adjustments) > 0 THEN
    FOR v_adj IN
      SELECT 
        (elem->>'medicine_id')::BIGINT AS medicine_id,
        (elem->>'quantity')::INT AS quantity
      FROM jsonb_array_elements(p_adjustments) elem
      ORDER BY (elem->>'medicine_id')::BIGINT ASC
    LOOP
      IF v_adj.medicine_id IS NULL THEN
        RAISE EXCEPTION 'Invalid adjustment: medicine_id is required';
      END IF;

      IF v_adj.quantity IS NULL OR v_adj.quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid adjustment quantity: % for medicine ID % (must be > 0)', v_adj.quantity, v_adj.medicine_id;
      END IF;

      -- Acquire row-level lock and verify clinic ownership
      SELECT stock_quantity INTO v_old_qty
      FROM public.medicines
      WHERE id = v_adj.medicine_id AND clinic_id = v_clinic_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine ID % not found or access denied for clinic %', v_adj.medicine_id, v_clinic_id;
      END IF;

      v_new_qty := v_old_qty + v_adj.quantity;

      UPDATE public.medicines
      SET stock_quantity = v_new_qty
      WHERE id = v_adj.medicine_id AND clinic_id = v_clinic_id;

      INSERT INTO public.inventory_transaction_logs (
        clinic_id,
        medicine_id,
        user_id,
        old_quantity,
        new_quantity,
        adjustment,
        reason
      ) VALUES (
        v_clinic_id,
        v_adj.medicine_id,
        v_user_id,
        v_old_qty,
        v_new_qty,
        v_adj.quantity,
        p_reason
      );

      v_updated_count := v_updated_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', v_updated_count,
    'created_count', v_created_count,
    'created_ids', to_jsonb(v_created_ids)
  );
END;
$$;

-- 8. Grants for RPC
REVOKE EXECUTE ON FUNCTION public.import_medicine_stock_batch(JSONB, JSONB, TEXT, BIGINT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_medicine_stock_batch(JSONB, JSONB, TEXT, BIGINT) TO authenticated, service_role;

