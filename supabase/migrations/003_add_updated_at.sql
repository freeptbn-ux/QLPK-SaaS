-- Migration 003: Add updated_at column to patients table
-- Required by create_prescription and append_to_prescription RPCs

ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing rows
UPDATE patients SET updated_at = created_at WHERE updated_at IS NULL;
