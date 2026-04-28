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
  updated_at?: string;
  name_normalized: string | null;
}

export interface PatientWithPrescriptions extends Patient {
  prescriptions?: PrescriptionWithDetails[];
  totalPrescriptions?: number;
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
  consultation_fee: number;
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

export interface PrescriptionWithDetails extends PrescriptionHeader {
  prescription_details: (PrescriptionDetail & { medicines: Pick<Medicine, 'name' | 'packing_spec'> })[];
}

export interface Setting {
  key: string;
  value: string;
}

export interface InventoryTransactionLog {
  id: number;
  clinic_id: number;
  medicine_id: number;
  user_id: string | null;
  old_quantity: number;
  new_quantity: number;
  adjustment: number;
  reason: string | null;
  created_at: string;
}
