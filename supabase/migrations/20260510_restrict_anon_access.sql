-- Phase 01: Restrict Public Access to Sensitive RPCs
-- Created: 2026-05-10
-- Requirement: Revoke EXECUTE from anon role for business-critical functions

-- Revoke permissions from anon and PUBLIC for statistics functions
REVOKE EXECUTE ON FUNCTION get_revenue_stats(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION get_stats_by_day_for_month(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION get_stats_by_location(int) FROM anon, PUBLIC;

-- Revoke permissions from anon and PUBLIC for prescription management functions
REVOKE EXECUTE ON FUNCTION create_prescription(bigint, text, jsonb, text, real) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION update_prescription(bigint, text, text, timestamptz, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION delete_prescription(bigint) FROM anon, PUBLIC;

-- Ensure authenticated role still has access (redundant but safe)
GRANT EXECUTE ON FUNCTION get_revenue_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_stats_by_day_for_month(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_stats_by_location(int) TO authenticated;
GRANT EXECUTE ON FUNCTION create_prescription(bigint, text, jsonb, text, real) TO authenticated;
GRANT EXECUTE ON FUNCTION update_prescription(bigint, text, text, timestamptz, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_prescription(bigint) TO authenticated;
