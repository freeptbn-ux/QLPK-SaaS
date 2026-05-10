-- Phase 1: Consolidate duplicate patients
-- Strategy: Keep lowest ID per (name_normalized, dob) group
-- Re-link all prescriptions to the primary patient

-- Step 1: Create temp table mapping duplicate IDs → primary IDs
CREATE TEMP TABLE patient_merge_map AS
WITH ranked AS (
  SELECT 
    id,
    name_normalized,
    dob,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(name_normalized), COALESCE(dob, '')
      ORDER BY id ASC
    ) AS rn,
    FIRST_VALUE(id) OVER (
      PARTITION BY LOWER(name_normalized), COALESCE(dob, '')
      ORDER BY id ASC
    ) AS primary_id
  FROM patients
)
SELECT id AS old_id, primary_id AS new_id
FROM ranked
WHERE rn > 1;

-- Step 2: Re-link prescriptions from duplicates to primary patient
UPDATE prescriptions_header ph
SET patient_id = mm.new_id
FROM patient_merge_map mm
WHERE ph.patient_id = mm.old_id;

-- Step 3: Update primary patient with latest info from duplicates
-- (lấy diagnosis, phone, address, weight từ bản ghi mới nhất)
UPDATE patients p
SET 
  diagnosis = sub.latest_diagnosis,
  phone = COALESCE(sub.latest_phone, p.phone),
  address = COALESCE(sub.latest_address, p.address),
  weight = COALESCE(sub.latest_weight, p.weight)
FROM (
  SELECT 
    MIN(id) AS primary_id,
    (ARRAY_AGG(diagnosis ORDER BY id DESC))[1] AS latest_diagnosis,
    (ARRAY_AGG(phone ORDER BY id DESC NULLS LAST))[1] AS latest_phone,
    (ARRAY_AGG(address ORDER BY id DESC NULLS LAST))[1] AS latest_address,
    (ARRAY_AGG(weight ORDER BY id DESC NULLS LAST))[1] AS latest_weight
  FROM patients
  GROUP BY LOWER(name_normalized), COALESCE(dob, '')
  HAVING COUNT(*) > 1
) sub
WHERE p.id = sub.primary_id;

-- Step 4: Delete duplicate patient records (prescriptions already re-linked)
DELETE FROM patients 
WHERE id IN (SELECT old_id FROM patient_merge_map);

-- Step 5: Reset sequence
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- Cleanup
DROP TABLE IF EXISTS patient_merge_map;
