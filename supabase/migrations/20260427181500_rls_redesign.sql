-- Phase 02: RLS Redesign
-- Created: 2026-04-27
-- Objective: Implement robust Row Level Security with Multi-tenancy and RBAC

-- 1. Create User Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default clinic for existing data migration
INSERT INTO clinics (id, name) VALUES (1, 'Phòng khám Mặc định') ON CONFLICT (id) DO NOTHING;

-- 3. Create Profiles table (linking auth.users to clinics and roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE DEFAULT 1,
    role user_role DEFAULT 'staff',
    full_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile name" ON profiles;
CREATE POLICY "Users can update their own profile name" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles in clinic" ON profiles;
CREATE POLICY "Admins can view all profiles in clinic" 
    ON profiles FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.clinic_id = profiles.clinic_id
        )
    );

-- 4. Helper function to get current user's clinic_id
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS BIGINT AS $$
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, clinic_id, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    1, -- Default to clinic 1
    'staff' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Add clinic_id to business tables and migrate data
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) DEFAULT 1;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) DEFAULT 1;
ALTER TABLE prescriptions_header ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) DEFAULT 1;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) DEFAULT 1;

-- Update settings PK to be tenant-aware
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey CASCADE;
ALTER TABLE settings ADD PRIMARY KEY (clinic_id, key);

-- 7. Trigger to automatically set clinic_id on INSERT
CREATE OR REPLACE FUNCTION set_clinic_id_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clinic_id IS NULL OR NEW.clinic_id = 1 THEN
        NEW.clinic_id := get_my_clinic_id();
    END IF;
    -- If it's still null (e.g. during migration or no profile), keep it as 1 for existing records
    IF NEW.clinic_id IS NULL THEN
        NEW.clinic_id := 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS tr_set_clinic_id_patients ON patients;
CREATE TRIGGER tr_set_clinic_id_patients BEFORE INSERT ON patients FOR EACH ROW EXECUTE FUNCTION set_clinic_id_from_profile();

DROP TRIGGER IF EXISTS tr_set_clinic_id_medicines ON medicines;
CREATE TRIGGER tr_set_clinic_id_medicines BEFORE INSERT ON medicines FOR EACH ROW EXECUTE FUNCTION set_clinic_id_from_profile();

DROP TRIGGER IF EXISTS tr_set_clinic_id_prescriptions ON prescriptions_header;
CREATE TRIGGER tr_set_clinic_id_prescriptions BEFORE INSERT ON prescriptions_header FOR EACH ROW EXECUTE FUNCTION set_clinic_id_from_profile();

DROP TRIGGER IF EXISTS tr_set_clinic_id_settings ON settings;
CREATE TRIGGER tr_set_clinic_id_settings BEFORE INSERT ON settings FOR EACH ROW EXECUTE FUNCTION set_clinic_id_from_profile();

-- 8. Redesign RLS Policies (Restrictive)

-- Patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on patients" ON patients;
DROP POLICY IF EXISTS "Users can see patients in their clinic" ON patients;
CREATE POLICY "Users can see patients in their clinic" 
    ON patients FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON patients;
CREATE POLICY "Users can insert patients in their clinic" 
    ON patients FOR INSERT 
    TO authenticated 
    WITH CHECK (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can update patients in their clinic" ON patients;
CREATE POLICY "Users can update patients in their clinic" 
    ON patients FOR UPDATE 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Admins/Doctors can delete patients" ON patients;
CREATE POLICY "Admins/Doctors can delete patients" 
    ON patients FOR DELETE 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
    );

-- Medicines
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on medicines" ON medicines;
DROP POLICY IF EXISTS "Users can see medicines in their clinic" ON medicines;
CREATE POLICY "Users can see medicines in their clinic" 
    ON medicines FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Admins/Doctors can manage medicines" ON medicines;
CREATE POLICY "Admins/Doctors can manage medicines" 
    ON medicines FOR ALL 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
    );

-- Prescriptions Header
ALTER TABLE prescriptions_header ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on prescriptions_header" ON prescriptions_header;
DROP POLICY IF EXISTS "Users can see prescriptions in their clinic" ON prescriptions_header;
CREATE POLICY "Users can see prescriptions in their clinic" 
    ON prescriptions_header FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can manage prescriptions in their clinic" ON prescriptions_header;
CREATE POLICY "Users can manage prescriptions in their clinic" 
    ON prescriptions_header FOR ALL 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

-- Prescription Details (Security via Header join)
ALTER TABLE prescription_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on prescription_details" ON prescription_details;
DROP POLICY IF EXISTS "Users can manage prescription details" ON prescription_details;
CREATE POLICY "Users can manage prescription details" 
    ON prescription_details FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM prescriptions_header h
            WHERE h.id = prescription_header_id
            AND h.clinic_id = get_my_clinic_id()
        )
    );

-- Settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on settings" ON settings;
DROP POLICY IF EXISTS "Users can see settings in their clinic" ON settings;
CREATE POLICY "Users can see settings in their clinic" 
    ON settings FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings" 
    ON settings FOR ALL 
    TO authenticated 
    USING (
        clinic_id = get_my_clinic_id() AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 9. Update Unique Constraints to be Tenant-Aware
ALTER TABLE patients DROP CONSTRAINT IF EXISTS uq_patients_name_dob;
ALTER TABLE patients ADD CONSTRAINT uq_patients_name_dob UNIQUE (name_normalized, dob, clinic_id);

-- 10. Update RPCs to be tenant-aware

-- upsert_patient
CREATE OR REPLACE FUNCTION upsert_patient(
  p_name text,
  p_name_normalized text,
  p_dob text,
  p_gender text,
  p_phone text,
  p_address text,
  p_diagnosis text,
  p_weight text,
  p_medical_history text
)
RETURNS TABLE(patient_data jsonb, is_existing boolean) AS $$
DECLARE
  v_patient patients%ROWTYPE;
  v_existing boolean;
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();
  
  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'User has no associated clinic';
  END IF;

  INSERT INTO patients (name, name_normalized, dob, gender, phone, address, diagnosis, weight, medical_history, clinic_id)
  VALUES (p_name, p_name_normalized, p_dob, p_gender, p_phone, p_address, p_diagnosis, p_weight, p_medical_history, v_clinic_id)
  ON CONFLICT (name_normalized, dob, clinic_id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    diagnosis = EXCLUDED.diagnosis,
    weight = EXCLUDED.weight,
    medical_history = EXCLUDED.medical_history,
    updated_at = NOW()
  RETURNING * INTO v_patient;
  
  v_existing := (v_patient.created_at < v_patient.updated_at);
  
  RETURN QUERY SELECT to_jsonb(v_patient), v_existing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- merge_patients
CREATE OR REPLACE FUNCTION merge_patients(master_id BIGINT, duplicate_ids BIGINT[])
RETURNS VOID AS $$
DECLARE
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  -- Security check: ensure all patients belong to the same clinic
  IF EXISTS (
      SELECT 1 FROM patients 
      WHERE id = ANY(array_append(duplicate_ids, master_id))
      AND clinic_id != v_clinic_id
  ) THEN
      RAISE EXCEPTION 'Permission denied: clinic mismatch';
  END IF;

  -- 1. Update prescriptions
  UPDATE prescriptions_header
  SET patient_id = master_id
  WHERE patient_id = ANY(duplicate_ids)
  AND clinic_id = v_clinic_id;

  -- 2. Delete duplicates
  DELETE FROM patients
  WHERE id = ANY(duplicate_ids)
  AND clinic_id = v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_potential_duplicates (tenant aware)
CREATE OR REPLACE FUNCTION get_potential_duplicates()
RETURNS TABLE (
  name_normalized TEXT,
  dob TEXT,
  phone TEXT,
  patient_ids BIGINT[],
  patient_names TEXT[],
  patient_addresses TEXT[]
) AS $$
DECLARE
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  RETURN QUERY
  SELECT 
    p.name_normalized,
    p.dob,
    p.phone,
    array_agg(p.id ORDER BY p.id ASC) as patient_ids,
    array_agg(p.name ORDER BY p.id ASC) as patient_names,
    array_agg(p.address ORDER BY p.id ASC) as patient_addresses
  FROM patients p
  WHERE p.clinic_id = v_clinic_id
  GROUP BY p.name_normalized, p.dob, p.phone
  HAVING count(*) > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create_prescription (tenant aware)
CREATE OR REPLACE FUNCTION create_prescription(
  p_patient_id BIGINT,
  p_diagnosis TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT '',
  p_consultation_fee REAL DEFAULT 0
) RETURNS BIGINT AS $$
DECLARE
  v_header_id BIGINT;
  v_total_medicines REAL := 0;
  v_item JSONB;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  -- Security check: patient must belong to same clinic
  IF NOT EXISTS (SELECT 1 FROM patients WHERE id = p_patient_id AND clinic_id = v_clinic_id) THEN
    RAISE EXCEPTION 'Patient not found or access denied';
  END IF;

  -- Insert header
  INSERT INTO prescriptions_header (patient_id, diagnosis, notes, consultation_fee, clinic_id)
  VALUES (p_patient_id, p_diagnosis, p_notes, p_consultation_fee, v_clinic_id)
  RETURNING id INTO v_header_id;

  v_history_text := p_diagnosis || E'\n';

  -- Insert details + deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Security check: medicine must belong to same clinic
    IF NOT EXISTS (SELECT 1 FROM medicines WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id) THEN
      RAISE EXCEPTION 'Medicine not found or access denied: %', (v_item->>'medicine_id');
    END IF;

    INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price)
    VALUES (
      v_header_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_medicines := v_total_medicines + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;
    v_history_text := v_history_text || v_index || ') ' || (v_item->>'medicine_name') || ' x ' || (v_item->>'quantity') || ' ' || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Deduct stock
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id;
  END LOOP;

  -- Update header total
  UPDATE prescriptions_header 
  SET total_amount = v_total_medicines + p_consultation_fee 
  WHERE id = v_header_id AND clinic_id = v_clinic_id;

  -- Update patient
  UPDATE patients 
  SET diagnosis = p_diagnosis, medical_history = v_history_text, updated_at = NOW()
  WHERE id = p_patient_id AND clinic_id = v_clinic_id;

  RETURN v_header_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_prescription (tenant aware)
CREATE OR REPLACE FUNCTION update_prescription(
  p_prescription_id BIGINT,
  p_diagnosis TEXT,
  p_notes TEXT,
  p_prescription_date TIMESTAMPTZ,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_consultation_fee REAL;
  v_old_item RECORD;
  v_item JSONB;
  v_total_medicines REAL := 0;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
  v_latest_prescription_id BIGINT;
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  -- Security check: prescription must belong to clinic
  SELECT patient_id, consultation_fee 
  INTO v_patient_id, v_consultation_fee 
  FROM prescriptions_header 
  WHERE id = p_prescription_id AND clinic_id = v_clinic_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Prescription not found or access denied';
  END IF;

  -- 2. Restore stock
  FOR v_old_item IN 
    SELECT medicine_id, quantity 
    FROM prescription_details 
    WHERE prescription_header_id = p_prescription_id
  LOOP
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_old_item.quantity
    WHERE id = v_old_item.medicine_id AND clinic_id = v_clinic_id;
  END LOOP;

  -- 3. Clear details
  DELETE FROM prescription_details 
  WHERE prescription_header_id = p_prescription_id;

  -- 4. Re-insert details
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Security check: medicine must belong to same clinic
    IF NOT EXISTS (SELECT 1 FROM medicines WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id) THEN
      RAISE EXCEPTION 'Medicine not found or access denied: %', (v_item->>'medicine_id');
    END IF;

    INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price) 
    VALUES (p_prescription_id, (v_item->>'medicine_id')::BIGINT, (v_item->>'quantity')::INTEGER, (v_item->>'unit_price')::REAL);

    v_total_medicines := v_total_medicines + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;
    v_history_text := v_history_text || v_index || ') ' || (v_item->>'medicine_name') || ' x ' || (v_item->>'quantity') || ' ' || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    UPDATE medicines SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id;
  END LOOP;

  -- 5. Update header
  UPDATE prescriptions_header 
  SET diagnosis = p_diagnosis, notes = p_notes, prescription_date = p_prescription_date, total_amount = v_total_medicines + v_consultation_fee
  WHERE id = p_prescription_id AND clinic_id = v_clinic_id;

  -- 6. Sync patient
  SELECT id INTO v_latest_prescription_id FROM prescriptions_header WHERE patient_id = v_patient_id AND clinic_id = v_clinic_id ORDER BY prescription_date DESC LIMIT 1;
  IF v_latest_prescription_id = p_prescription_id THEN
    UPDATE patients SET diagnosis = p_diagnosis, medical_history = p_diagnosis || E'\n' || v_history_text, updated_at = NOW() WHERE id = v_patient_id AND clinic_id = v_clinic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- delete_prescription (tenant aware)
CREATE OR REPLACE FUNCTION delete_prescription(p_prescription_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_item RECORD;
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  -- Security check
  SELECT patient_id INTO v_patient_id FROM prescriptions_header WHERE id = p_prescription_id AND clinic_id = v_clinic_id;
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Prescription not found or access denied';
  END IF;

  FOR v_item IN SELECT medicine_id, quantity FROM prescription_details WHERE prescription_header_id = p_prescription_id LOOP
    UPDATE medicines SET stock_quantity = stock_quantity + v_item.quantity WHERE id = v_item.medicine_id AND clinic_id = v_clinic_id;
  END LOOP;

  DELETE FROM prescriptions_header WHERE id = p_prescription_id AND clinic_id = v_clinic_id;

  UPDATE patients SET diagnosis = (SELECT diagnosis FROM prescriptions_header WHERE patient_id = v_patient_id AND clinic_id = v_clinic_id ORDER BY prescription_date DESC LIMIT 1), updated_at = NOW() WHERE id = v_patient_id AND clinic_id = v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant permissions (Authenticated only as per Phase 01)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Explicitly REVOKE from anon just to be sure
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE USAGE ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon; -- But allow usage for auth to work
