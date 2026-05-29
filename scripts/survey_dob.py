import os
import re
import sys
from collections import Counter
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

    print("Surveying patient DOB formats...")
    
    try:
        # Fetch all DOBs
        response = supabase.table('patients').select('dob').execute()
        dobs = [r['dob'] for r in response.data]
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        sys.exit(1)

    stats = Counter()
    other_samples = []

    for dob in dobs:
        if not dob or dob.strip() == '':
            stats['NULL/EMPTY'] += 1
        elif re.match(r'^\d{4}-\d{2}-\d{2}$', dob):
            stats['YYYY-MM-DD'] += 1
        elif re.match(r'^\d{2}/\d{2}/\d{4}$', dob):
            stats['DD/MM/YYYY'] += 1
        elif re.match(r'^\d{4}$', dob):
            stats['YYYY_ONLY'] += 1
        else:
            stats['OTHER'] += 1
            if len(other_samples) < 10:
                other_samples.append(dob)

    print("\nFormat Type | Count")
    print("------------|------")
    for fmt, count in stats.most_common():
        print(f"{fmt:<11} | {count}")

    if other_samples:
        print("\nSamples of 'OTHER' format:")
        for s in other_samples:
            print(f"  - {s}")

if __name__ == "__main__":
    main()
