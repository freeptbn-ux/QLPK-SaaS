import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env.local')
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

res = supabase.table('prescriptions_header').select('id, prescription_date').eq('patient_id', 774).execute()
print(f"Prescriptions for Patient 774: {res.data}")
