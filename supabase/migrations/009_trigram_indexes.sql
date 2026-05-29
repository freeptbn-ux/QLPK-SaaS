-- Phase 01: Database Optimization - Trigram Indexes
-- Objective: Optimize full-text search for patients

-- 10. Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 11. Tạo GIN indexes cho patient search
-- Note: Assuming patients table has name_normalized and phone columns based on existing indexes in other files or common patterns.
-- The spec explicitly mentions these.

CREATE INDEX IF NOT EXISTS idx_patients_name_trgm 
  ON patients USING gin (name_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_patients_phone_trgm 
  ON patients USING gin (phone gin_trgm_ops);
