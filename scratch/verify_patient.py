import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env.local')
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

res = supabase.table('patients').select('name').eq('id', 774).execute()
if res.data:
    name = res.data[0]['name']
    print(f"Patient Name: {name.encode('utf-8')}")
    if "Nguyễn Quang Nhật" in name:
        print("MATCH FOUND")
    else:
        print(f"NO MATCH: {name}")
else:
    print("Patient not found")
