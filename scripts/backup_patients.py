#!/usr/bin/env python3
import os
import sys
import csv
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: Supabase credentials not found in .env.local")
        sys.exit(1)

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        sys.exit(1)

    print("Exporting patients to CSV for backup...")
    try:
        response = supabase.table('patients').select('*').execute()
        patients = response.data
        
        if not patients:
            print("⚠️ No patients found to export.")
            return

        keys = patients[0].keys()
        backup_file = 'patients_backup_before_merge.csv'
        with open(backup_file, 'w', newline='', encoding='utf-8') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(patients)
            
        print(f"✅ Exported {len(patients)} patients to {backup_file}")
    except Exception as e:
        print(f"❌ Error exporting patients: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
