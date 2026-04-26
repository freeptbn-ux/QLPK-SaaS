-- Ngăn tạo duplicate patients trong tương lai
-- Unique trên (name_normalized, dob) - case insensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_unique_person 
ON patients (LOWER(name_normalized), COALESCE(dob, ''));
