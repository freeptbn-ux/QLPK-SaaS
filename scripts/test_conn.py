import os
from supabase import create_client
from dotenv import load_dotenv
load_dotenv('.env.local')
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
print(f"Connecting to {url}")
supabase = create_client(url, key)
res = supabase.table('patients').select('id', count='exact').limit(1).execute()
print(f"Count: {res.count}")
