-- Bật extension để hỗ trợ tìm kiếm trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tạo GIN index cho cột name (hỗ trợ ILIKE cực nhanh)
CREATE INDEX IF NOT EXISTS idx_medicines_name_trgm 
ON medicines USING gin (name gin_trgm_ops);
