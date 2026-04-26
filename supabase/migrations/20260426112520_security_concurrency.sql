-- Phase 06: Security & Concurrency
-- 1. Cleanup existing duplicates
-- 2. Add updated_at trigger
-- 3. Add UNIQUE constraints
-- 4. Create upsert_patient RPC

-- 1. Cleanup specific duplicates identified in audit
-- Using the merge_patients RPC if it exists, or manual SQL if not.
-- Since we know merge_patients exists from 006_merge_patients_rpc.sql, we use it.

DO $$ 
BEGIN
    -- Duplicate: me cua truong an - vien vien (19, 27)
    IF EXISTS (SELECT 1 FROM patients WHERE id = 19) AND EXISTS (SELECT 1 FROM patients WHERE id = 27) THEN
        PERFORM merge_patients(19, ARRAY[27]::BIGINT[]);
    END IF;

    -- Duplicate: nguyen quang tung lam (86, 146)
    IF EXISTS (SELECT 1 FROM patients WHERE id = 86) AND EXISTS (SELECT 1 FROM patients WHERE id = 146) THEN
        PERFORM merge_patients(86, ARRAY[146]::BIGINT[]);
    END IF;

    -- Duplicate: nguyen quang tam (626, 663)
    IF EXISTS (SELECT 1 FROM patients WHERE id = 626) AND EXISTS (SELECT 1 FROM patients WHERE id = 663) THEN
        PERFORM merge_patients(626, ARRAY[663]::BIGINT[]);
    END IF;

    -- Duplicate: nguyen thi minh khue (251, 401)
    IF EXISTS (SELECT 1 FROM patients WHERE id = 251) AND EXISTS (SELECT 1 FROM patients WHERE id = 401) THEN
        PERFORM merge_patients(251, ARRAY[401]::BIGINT[]);
    END IF;

    -- Duplicate: van anh tu (564, 613)
    IF EXISTS (SELECT 1 FROM patients WHERE id = 564) AND EXISTS (SELECT 1 FROM patients WHERE id = 613) THEN
        PERFORM merge_patients(564, ARRAY[613]::BIGINT[]);
    END IF;
END $$;

-- 2. Add updated_at trigger to patients table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 3. Add UNIQUE constraints
-- First, ensure no more duplicates exist (general cleanup just in case)
-- This query keeps the oldest record (smallest ID) for each (name_normalized, dob)
DELETE FROM patients a USING patients b
WHERE a.id > b.id
  AND a.name_normalized = b.name_normalized
  AND a.dob = b.dob;

ALTER TABLE patients 
DROP CONSTRAINT IF EXISTS uq_patients_name_dob;

ALTER TABLE patients 
ADD CONSTRAINT uq_patients_name_dob 
UNIQUE (name_normalized, dob);

-- Partial unique index for phone
DROP INDEX IF EXISTS uq_patients_phone;
CREATE UNIQUE INDEX uq_patients_phone 
ON patients (phone) 
WHERE phone IS NOT NULL 
  AND phone != '' 
  AND phone != 'Chưa cập nhật'
  AND phone ~ '^[0-9]+$';

-- 4. Create upsert_patient RPC
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
BEGIN
  INSERT INTO patients (name, name_normalized, dob, gender, phone, address, diagnosis, weight, medical_history)
  VALUES (p_name, p_name_normalized, p_dob, p_gender, p_phone, p_address, p_diagnosis, p_weight, p_medical_history)
  ON CONFLICT (name_normalized, dob) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    diagnosis = EXCLUDED.diagnosis,
    weight = EXCLUDED.weight,
    medical_history = EXCLUDED.medical_history,
    updated_at = NOW() -- Explicitly set in case trigger is disabled or for clarity
  RETURNING * INTO v_patient;
  
  -- If created_at is equal to updated_at (within a small margin), it's a new record.
  -- But since we set updated_at = NOW() on update, and it defaults to NOW() on insert, 
  -- it's better to compare them. On insert, created_at == updated_at.
  -- On update, updated_at will be later than created_at.
  v_existing := (v_patient.created_at < v_patient.updated_at);
  
  RETURN QUERY SELECT to_jsonb(v_patient), v_existing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
