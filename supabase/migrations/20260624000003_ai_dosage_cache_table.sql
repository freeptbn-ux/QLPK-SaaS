-- Create cache table
CREATE TABLE IF NOT EXISTS public.medicine_dosage_cache (
  id BIGSERIAL PRIMARY KEY,
  medicine_name_query TEXT UNIQUE NOT NULL,
  medicine_name TEXT NOT NULL,
  adult_dosage TEXT,
  children_dosage TEXT,
  usage_instructions TEXT,
  description TEXT,
  contraindications TEXT,
  side_effects TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_medicine_dosage_cache_query ON public.medicine_dosage_cache(medicine_name_query);

-- Enable RLS
ALTER TABLE public.medicine_dosage_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations
DROP POLICY IF EXISTS "Allow authenticated read on medicine_dosage_cache" ON public.medicine_dosage_cache;
CREATE POLICY "Allow authenticated read on medicine_dosage_cache"
  ON public.medicine_dosage_cache FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert on medicine_dosage_cache" ON public.medicine_dosage_cache;
CREATE POLICY "Allow authenticated insert on medicine_dosage_cache"
  ON public.medicine_dosage_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update on medicine_dosage_cache" ON public.medicine_dosage_cache;
CREATE POLICY "Allow authenticated update on medicine_dosage_cache"
  ON public.medicine_dosage_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
