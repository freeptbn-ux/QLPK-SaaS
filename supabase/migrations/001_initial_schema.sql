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
