-- Phase 03: Migration script to normalize DOB format to DD/MM/YYYY
-- Target: patients table, dob column

-- 1. Backup current dob values
CREATE TABLE IF NOT EXISTS patients_dob_backup AS
SELECT id, dob FROM patients WHERE dob IS NOT NULL AND dob != '';

-- 2. Convert YYYY-MM-DD → DD/MM/YYYY
-- Example: '1990-06-15' -> '15/06/1990'
UPDATE patients
SET dob = CONCAT(
  SUBSTRING(dob FROM 9 FOR 2), '/',
  SUBSTRING(dob FROM 6 FOR 2), '/',
  SUBSTRING(dob FROM 1 FOR 4)
)
WHERE dob ~ '^\d{4}-\d{2}-\d{2}$';

-- 3. Convert YYYY → 01/01/YYYY (If any exist)
-- Example: '1990' -> '01/01/1990'
UPDATE patients
SET dob = CONCAT('01/01/', dob)
WHERE dob ~ '^\d{4}$';

-- 4. Verify the results (dry-run style query)
SELECT 
  CASE
    WHEN dob IS NULL OR dob = '' THEN 'NULL/EMPTY'
    WHEN dob ~ '^\d{4}-\d{2}-\d{2}$' THEN 'YYYY-MM-DD (STILL EXISTS!)'
    WHEN dob ~ '^\d{2}/\d{2}/\d{4}$' THEN 'DD/MM/YYYY (NORMALIZED)'
    WHEN dob ~ '^\d{4}$' THEN 'YYYY_ONLY (STILL EXISTS!)'
    ELSE 'OTHER (STAYED AS IS)'
  END as format_type,
  COUNT(*) as cnt
FROM patients
GROUP BY format_type
ORDER BY cnt DESC;
