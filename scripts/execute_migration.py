import os
import re
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def convert_dob(dob):
    if not dob:
        return dob
    
    # YYYY-MM-DD -> DD/MM/YYYY
    match_iso = re.match(r'^(\d{4})-(\d{2})-(\d{2})$', dob)
    if match_iso:
        year, month, day = match_iso.groups()
        return f"{day}/{month}/{year}"
    
    # YYYY -> 01/01/YYYY
    match_year = re.match(r'^(\d{4})$', dob)
    if match_year:
        year = match_year.group(1)
        return f"01/01/{year}"
    
    return dob

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: Supabase credentials not found in .env.local")
        sys.exit(1)

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        sys.exit(1)

    print("Starting DOB normalization migration...")
    
    try:
        # Fetch records that need update
        # 1. YYYY-MM-DD format
        response = supabase.table('patients').select('id, dob').execute()
        patients = response.data
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        sys.exit(1)

    to_update = []
    for p in patients:
        old_dob = p.get('dob')
        new_dob = convert_dob(old_dob)
        if new_dob != old_dob:
            to_update.append({'id': p['id'], 'dob': new_dob})

    if not to_update:
        print("✅ No records need normalization.")
        return

    print(f"Found {len(to_update)} records to normalize.")
    
    # Run updates
    count = 0
    for item in to_update:
        try:
            supabase.table('patients').update({'dob': item['dob']}).eq('id', item['id']).execute()
            count += 1
            if count % 10 == 0:
                print(f"  Updated {count}/{len(to_update)}")
        except Exception as e:
            print(f"❌ Error updating patient {item['id']}: {e}")
            # Continue to next record

    print("\n✅ Migration complete!")

if __name__ == "__main__":
    main()
