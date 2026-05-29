-- Phase 01: RPC for merging patients and finding duplicates
-- Added on 2026-04-25

-- Function to find potential duplicate patients
-- Groups by name_normalized, dob, and phone
DROP FUNCTION IF EXISTS get_potential_duplicates();

CREATE OR REPLACE FUNCTION get_potential_duplicates()
RETURNS TABLE (
  name_normalized TEXT,
  dob TEXT,
  phone TEXT,
  patient_ids BIGINT[],
  patient_names TEXT[],
  patient_addresses TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name_normalized,
    p.dob,
    p.phone,
    array_agg(p.id ORDER BY p.id ASC) as patient_ids,
    array_agg(p.name ORDER BY p.id ASC) as patient_names,
    array_agg(p.address ORDER BY p.id ASC) as patient_addresses
  FROM patients p
  GROUP BY p.name_normalized, p.dob, p.phone
  HAVING count(*) > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge duplicate patients into a master record
-- 1. Updates all prescriptions to point to the master_id
-- 2. Deletes the duplicate patient records
DROP FUNCTION IF EXISTS merge_patients(integer, integer[]);
DROP FUNCTION IF EXISTS merge_patients(bigint, bigint[]);

CREATE OR REPLACE FUNCTION merge_patients(master_id BIGINT, duplicate_ids BIGINT[])
RETURNS VOID AS $$
BEGIN
  -- 1. Update prescriptions to point to the master_id
  UPDATE prescriptions_header
  SET patient_id = master_id
  WHERE patient_id = ANY(duplicate_ids);

  -- 2. Delete the duplicate patients
  DELETE FROM patients
  WHERE id = ANY(duplicate_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

