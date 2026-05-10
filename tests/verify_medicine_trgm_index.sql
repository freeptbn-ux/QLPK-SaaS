-- Test script for Phase 01: Database Indexing
-- Objective: Verify the existence and performance of GIN trigram index on medicines table

-- 1. Check if index exists
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'medicines' AND indexname = 'idx_medicines_name_trgm';

-- 2. Verify query plan uses the index
-- Note: enable_seqscan is turned off to force index use for small datasets in testing
SET enable_seqscan = off;

EXPLAIN ANALYZE 
SELECT * FROM medicines 
WHERE name ILIKE '%paracetamol%';

SET enable_seqscan = on;
