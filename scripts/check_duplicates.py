#!/usr/bin/env python3
import os
import sys
from supabase import create_client
from dotenv import load_dotenv
from collections import defaultdict

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

    print("=" * 60)
    print("PATIENT DUPLICATE CHECKER (DRY-RUN)")
    print("=" * 60)

    # Fetch all patients
    print("Fetching patients...")
    try:
        response = supabase.table('patients').select('id, name, name_normalized, dob').execute()
        patients = response.data
    except Exception as e:
        print(f"❌ Error fetching patients: {e}")
        sys.exit(1)

    print(f"Found {len(patients)} total patients.")

    # Group by normalized name and dob
    groups = defaultdict(list)
    for p in patients:
        key = (p['name_normalized'].lower(), p['dob'] or '')
        groups[key].append(p)

    duplicate_groups = {k: v for k, v in groups.items() if len(v) > 1}
    
    if not duplicate_groups:
        print("✅ No duplicates found!")
        return

    print(f"Found {len(duplicate_groups)} groups of duplicates.")
    
    total_duplicates = 0
    total_prescriptions_to_relink = 0
    
    # Fetch prescription counts per patient to estimate impact
    print("Fetching prescription counts...")
    try:
        # We can't easily do a group by in Supabase client, so we'll fetch headers and count locally
        ph_response = supabase.table('prescriptions_header').select('patient_id').execute()
        prescriptions = ph_response.data
        p_counts = defaultdict(int)
        for ph in prescriptions:
            p_counts[ph['patient_id']] += 1
    except Exception as e:
        print(f"⚠️ Could not fetch prescription counts: {e}")
        p_counts = {}

    print("-" * 60)
    print(f"{'Primary ID':<12} | {'Name':<30} | {'DOB':<12} | {'Duplicates'}")
    print("-" * 60)

    for (name_norm, dob), members in sorted(duplicate_groups.items(), key=lambda x: len(x[1]), reverse=True):
        # Keep lowest ID as primary
        sorted_members = sorted(members, key=lambda x: x['id'])
        primary = sorted_members[0]
        duplicates = sorted_members[1:]
        
        total_duplicates += len(duplicates)
        
        dup_ids = [d['id'] for d in duplicates]
        dup_presc_count = sum(p_counts.get(d_id, 0) for d_id in dup_ids)
        total_prescriptions_to_relink += dup_presc_count
        
        print(f"{primary['id']:<12} | {primary['name'][:30]:<30} | {dob:<12} | {len(duplicates)} (re-link {dup_presc_count} px)")

    print("-" * 60)
    print(f"SUMMARY:")
    print(f"  - Total patients: {len(patients)}")
    print(f"  - Duplicate records to delete: {total_duplicates}")
    print(f"  - Unique patients after merge: {len(patients) - total_duplicates}")
    print(f"  - Prescriptions to be re-linked: {total_prescriptions_to_relink}")
    print("=" * 60)

if __name__ == "__main__":
    main()
