-- Phase 02: Enforce mandatory fields for patients
-- Added on 2026-04-25
-- Objective: Ensure dob, gender, and phone are NOT NULL

-- 1. Update existing records that have NULL or empty values to avoid migration errors
UPDATE patients SET dob = '01/01/1900' WHERE dob IS NULL OR dob = '';
UPDATE patients SET gender = 'Nam' WHERE gender IS NULL OR gender = '';
UPDATE patients SET phone = 'Chưa cập nhật' WHERE phone IS NULL OR phone = '';

-- 2. Alter table structure to set columns as NOT NULL
ALTER TABLE patients ALTER COLUMN dob SET NOT NULL;
ALTER TABLE patients ALTER COLUMN gender SET NOT NULL;
ALTER TABLE patients ALTER COLUMN phone SET NOT NULL;
