# Phase 01: Project Setup & Supabase
Status: ✅ Completed
Dependencies: None

## Objective
Khởi tạo Next.js project với đầy đủ dependencies, cấu hình TypeScript, MUI theme, Supabase client. Tạo database schema trên Supabase project mới.

## Requirements

### Functional
- [x] Next.js App Router project chạy được (`npm run dev`)
- [x] MUI theme (light/dark) hoạt động
- [x] Supabase client kết nối được (server + browser)
- [x] Database schema tạo đầy đủ 5 bảng
- [x] RLS policies cấu hình cho authenticated users

### Non-Functional
- [x] TypeScript strict mode
- [x] ESLint + Prettier configured
- [x] Path alias `@/` hoạt động

## Implementation Steps

### A. Tạo Next.js Project
1. [x] Tạo project: `npx -y create-next-app@latest ./ --typescript --eslint --app --src-dir --use-npm --no-tailwind --turbopack --no-import-alias`
2. [x] Cấu hình `tsconfig.json` path alias `@/` → `src/`

### B. Install Dependencies
3. [x] Core UI: `npm install @mui/material @emotion/react @emotion/styled @mui/material-nextjs @emotion/cache @mui/icons-material`
4. [x] Supabase: `npm install @supabase/supabase-js @supabase/ssr`
5. [x] Utils: `npm install recharts zod dayjs`
6. [x] Dev: `npm install -D prettier`

### C. Setup MUI Theme
7. [x] Tạo `src/theme/theme.ts` - MUI createTheme (light + dark palette)
8. [x] Tạo `src/components/ThemeRegistry.tsx` - Client component ThemeProvider
9. [x] Cấu hình `src/app/layout.tsx` - AppRouterCacheProvider + ThemeRegistry
10. [x] Tạo `src/theme/ThemeContext.tsx` - Context cho toggle light/dark

### D. Setup Supabase Client
11. [x] Tạo `src/lib/supabase/server.ts` - createClient cho Server Components (dùng cookies từ `next/headers`)
12. [x] Tạo `src/lib/supabase/client.ts` - createBrowserClient cho Client Components
13. [x] Tạo `.env.local` từ `.env.example` với `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### E. Setup Folder Structure
14. [x] Tạo folder structure chuẩn: `components/ui/`, `components/features/`, `hooks/`, `lib/`, `actions/`, `types/`, `theme/`

### F. Supabase Database Schema (SQL)
15. [x] Tạo `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable RLS
ALTER DATABASE postgres SET timezone TO 'Asia/Ho_Chi_Minh';

-- Table: patients
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  address TEXT,
  phone TEXT,
  weight TEXT,
  medical_history TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name_normalized TEXT
);

CREATE INDEX idx_patients_name_normalized ON patients(name_normalized);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_created_at ON patients(created_at);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything on patients"
  ON patients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table: medicines
CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  packing_spec TEXT,
  price REAL DEFAULT 0.0,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything on medicines"
  ON medicines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table: prescriptions_header
CREATE TABLE IF NOT EXISTS prescriptions_header (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  prescription_date TIMESTAMPTZ DEFAULT NOW(),
  diagnosis TEXT,
  total_amount REAL DEFAULT 0.0,
  notes TEXT
);

CREATE INDEX idx_prescriptions_header_patient_id ON prescriptions_header(patient_id);
CREATE INDEX idx_prescriptions_header_date ON prescriptions_header(prescription_date);

ALTER TABLE prescriptions_header ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything on prescriptions_header"
  ON prescriptions_header FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table: prescription_details
CREATE TABLE IF NOT EXISTS prescription_details (
  id BIGSERIAL PRIMARY KEY,
  prescription_header_id BIGINT NOT NULL REFERENCES prescriptions_header(id) ON DELETE CASCADE,
  medicine_id BIGINT NOT NULL REFERENCES medicines(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price REAL
);

CREATE INDEX idx_prescription_details_header_id ON prescription_details(prescription_header_id);
CREATE INDEX idx_prescription_details_medicine_id ON prescription_details(medicine_id);

ALTER TABLE prescription_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything on prescription_details"
  ON prescription_details FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table: settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can do everything on settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('consultation_fee', '120'),
  ('doctor_name', 'BS. Nguyễn Duy Trường'),
  ('clinic_name', 'Phòng khám Nhi khoa')
ON CONFLICT (key) DO NOTHING;
```

16. [x] Chạy SQL trên Supabase Dashboard SQL Editor

### G. TypeScript Types
17. [x] Tạo `src/types/database.ts` - Types cho tất cả các bảng:

```typescript
export interface Patient {
  id: number;
  name: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
  phone: string | null;
  weight: string | null;
  medical_history: string | null;
  diagnosis: string | null;
  created_at: string;
  name_normalized: string | null;
}

export interface Medicine {
  id: number;
  name: string;
  packing_spec: string | null;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
}

export interface PrescriptionHeader {
  id: number;
  patient_id: number;
  prescription_date: string;
  diagnosis: string | null;
  total_amount: number;
  notes: string | null;
}

export interface PrescriptionDetail {
  id: number;
  prescription_header_id: number;
  medicine_id: number;
  quantity: number;
  unit_price: number | null;
  // Joined fields
  medicine_name?: string;
  packing_spec?: string;
}

export interface Setting {
  key: string;
  value: string;
}
```

## Files to Create/Modify
- `src/app/layout.tsx` - Root layout với MUI + Supabase
- `src/theme/theme.ts` - MUI theme definitions
- `src/theme/ThemeContext.tsx` - Dark/Light toggle context
- `src/components/ThemeRegistry.tsx` - MUI ThemeProvider wrapper
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/client.ts` - Browser-side Supabase client
- `src/types/database.ts` - TypeScript interfaces
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `.env.example` - Environment template
- `.env.local` - Actual env values (gitignored)

## Test Criteria
- [x] `npm run dev` chạy không lỗi
- [x] Truy cập `localhost:3000` hiện được MUI styled page
- [x] Theme toggle light/dark hoạt động
- [x] Supabase connection test pass (log "Connected")
- [x] `npm run build` thành công (no TypeScript errors)

## Notes
- **QUAN TRỌNG**: Anh cần tạo Supabase project mới trước khi chạy phase này
- Sau khi tạo project, lấy `SUPABASE_URL` và `SUPABASE_ANON_KEY` từ Dashboard → Settings → API
- Chạy SQL schema trên Supabase Dashboard → SQL Editor
- MUI dùng `@mui/material-nextjs/v16-appRouter` (match Next.js major version)

---
Next Phase: → [phase-02-auth-layout.md](./phase-02-auth-layout.md)
