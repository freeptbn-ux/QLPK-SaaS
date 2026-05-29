-- Migration: Sync out-of-sync PostgreSQL sequences with table max IDs
-- Created At: 2026-05-21
-- Objective: Fix "duplicate key value violates unique constraint" errors on tables like patient_history_logs and clinics.

-- Sync patient_history_logs_id_seq
SELECT setval('patient_history_logs_id_seq', COALESCE((SELECT max(id) FROM patient_history_logs), 1));

-- Sync clinics_id_seq
SELECT setval('clinics_id_seq', COALESCE((SELECT max(id) FROM clinics), 1));
