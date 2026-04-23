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
    print("PATIENT CONSOLIDATION PROCESS (OPTIMIZED)")
    print("=" * 60)

    # 1. Fetch all patients
    print("Step 1: Fetching all patients...")
    response = supabase.table('patients').select('*').execute()
    patients = response.data
    print(f"  Found {len(patients)} patients.")

    # 2. Group duplicates
    groups = defaultdict(list)
    for p in patients:
        key = (p['name_normalized'].lower(), p['dob'] or '')
        groups[key].append(p)

    duplicate_groups = {k: v for k, v in groups.items() if len(v) > 1}
    print(f"  Found {len(duplicate_groups)} groups with duplicates.")

    if not duplicate_groups:
        print("✅ No duplicates to merge.")
        return

    # 3. Process each group
    total_relinked = 0
    total_deleted = 0
    
    all_dup_ids = []
    
    for (name_norm, dob), members in duplicate_groups.items():
        sorted_members = sorted(members, key=lambda x: x['id'])
        primary = sorted_members[0]
        duplicates = sorted_members[1:]
        dup_ids = [d['id'] for d in duplicates]
        all_dup_ids.extend(dup_ids)
        
        print(f"  Merging group: {primary['name']} ({dob or 'N/A'})")
        
        # A. Re-link prescriptions (Optimized: use .in_)
        res = supabase.table('prescriptions_header').update({'patient_id': primary['id']}).in_('patient_id', dup_ids).execute()
        relinked_count = len(res.data)
        if relinked_count > 0:
            print(f"    - Re-linked {relinked_count} prescriptions")
            total_relinked += relinked_count

        # B. Update primary patient with latest info
        latest = sorted(members, key=lambda x: x['id'], reverse=True)[0]
        update_data = {
            'phone': latest.get('phone') or primary.get('phone'),
            'address': latest.get('address') or primary.get('address'),
            'weight': latest.get('weight') or primary.get('weight'),
            'diagnosis': latest.get('diagnosis') or primary.get('diagnosis')
        }
        supabase.table('patients').update(update_data).eq('id', primary['id']).execute()
        print(f"    - Updated primary patient info")

    # C. Delete duplicates in batches (Optimized)
    print(f"Step 4: Deleting {len(all_dup_ids)} duplicate records in batches...")
    BATCH_SIZE = 50
    for i in range(0, len(all_dup_ids), BATCH_SIZE):
        batch = all_dup_ids[i:i+BATCH_SIZE]
        supabase.table('patients').delete().in_('id', batch).execute()
        total_deleted += len(batch)
        print(f"    - Deleted batch {i//BATCH_SIZE + 1} ({len(batch)} records)")

    print("-" * 60)
    print("CONSOLIDATION COMPLETE")
    print(f"  - Total duplicates deleted: {total_deleted}")
    print(f"  - Total prescriptions re-linked: {total_relinked}")
    
    # 4. Final verification
    res = supabase.table('patients').select('id', count='exact').execute()
    print(f"  - Final patient count: {res.count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
