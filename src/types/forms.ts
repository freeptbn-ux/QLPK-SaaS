export interface PatientFormData {
  name: string;
  dob?: string;
  gender?: string;
  address?: string;
  phone?: string;
  weight?: string;
  diagnosis?: string;
}

export interface PrescriptionItem {
  medicine_id: number;
  medicine_name: string; // display only
  packing_spec: string; // display only
  quantity: number;
  unit_price: number;
}

export interface CreatePrescriptionData {
  patient_id: number;
  diagnosis: string;
  items: PrescriptionItem[];
  notes?: string;
  consultation_fee: number;
}

export interface UpdatePrescriptionData {
  prescription_id: number;
  patient_id: number;
  diagnosis: string;
  items: PrescriptionItem[];
  notes?: string;
  prescription_date: string;
}
