#!/usr/bin/env python3
"""
Cleanup duplicate prescriptions in Supabase.
Duplicates are defined as:
- Same patient_id
- Same prescription_date (YYYY-MM-DD)
- Same diagnosis
- Exact same medicine_id, quantity, and unit_price in prescription_details

Usage:
    python scripts/cleanup_duplicates.py           # Dry run (default)
    python scripts/cleanup_duplicates.py --execute # Actually delete duplicates
"""

import os
import sys
import argparse
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def main():
    parser = argparse.ArgumentParser(description="Cleanup duplicate prescriptions in Supabase.")
    parser.add_argument("--execute", action="store_true", help="Actually execute the deletion.")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
        sys.exit(1)

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        sys.exit(1)

    print("=" * 60)
    print("PRESCRIPTION DUPLICATE CLEANUP")
    print(f"Target URL: {SUPABASE_URL}")
    print(f"Mode: {'EXECUTE' if args.execute else 'DRY RUN'}")
    print("=" * 60)

    # 1. Fetch all prescription headers
    print("\n[1/4] Fetching prescription headers...")
    try:
        headers_resp = supabase.table('prescriptions_header').select("*").execute()
        headers = headers_resp.data
        print(f"  Found {len(headers)} total prescriptions.")
    except Exception as e:
        print(f"  ❌ Error fetching headers: {e}")
        sys.exit(1)

    if not headers:
        print("  No prescriptions found. Nothing to do.")
        return

    # 2. Group by patient_id, date, diagnosis
    print("\n[2/4] Identifying potential duplicates...")
    groups = {}
    for h in headers:
        # Normalize date to YYYY-MM-DD
        dt_str = h['prescription_date']
        try:
            # Handle both ISO format and simple date format
            dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        except:
            dt = dt_str[:10]
        
        key = (h['patient_id'], dt, h['diagnosis'] or "")
        if key not in groups:
            groups[key] = []
        groups[key].append(h)

    potential_duplicate_groups = {k: v for k, v in groups.items() if len(v) > 1}
    print(f"  Found {len(potential_duplicate_groups)} groups with potential duplicates.")

    if not potential_duplicate_groups:
        print("  No potential duplicates found.")
        return

    # 3. Compare details for each potential duplicate group
    print("\n[3/4] Comparing prescription details...")
    to_delete_ids = []
    total_scanned = 0
    total_matched = 0

    for key, group in potential_duplicate_groups.items():
        patient_id, dt, diagnosis = key
        header_ids = [h['id'] for h in group]
        
        # Fetch details for all headers in this group
        try:
            details_resp = supabase.table('prescription_details').select("*").in_('prescription_header_id', header_ids).execute()
            details_list = details_resp.data
        except Exception as e:
            print(f"  ❌ Error fetching details for group {header_ids}: {e}")
            continue

        # Map header_id -> normalized details set
        header_details_map = {}
        for h_id in header_ids:
            # Extract details for this specific header
            h_details = [d for d in details_list if d['prescription_header_id'] == h_id]
            # Normalize: set of (medicine_id, quantity, unit_price)
            # Sort by medicine_id to ensure consistent comparison if it was a list, 
            # but using a set of tuples is better for "exact same medicines"
            norm_details = frozenset([
                (d['medicine_id'], d['quantity'], d['unit_price'])
                for d in h_details
            ])
            header_details_map[h_id] = norm_details

        # Find exact matches
        # We'll group headers by their normalized details
        content_groups = {}
        for h_id, norm_details in header_details_map.items():
            if norm_details not in content_groups:
                content_groups[norm_details] = []
            content_groups[norm_details].append(h_id)

        for norm_details, ids in content_groups.items():
            if len(ids) > 1:
                # We have duplicates!
                ids.sort() # Keep the smallest ID
                keep_id = ids[0]
                duplicate_ids = ids[1:]
                
                print(f"  [MATCH] Patient {patient_id} on {dt}: Found {len(ids)} identical prescriptions.")
                print(f"    Keeping: {keep_id}")
                print(f"    Duplicates: {duplicate_ids}")
                
                to_delete_ids.extend(duplicate_ids)
                total_matched += len(duplicate_ids)
        
        total_scanned += 1

    print(f"\nSummary:")
    print(f"  Groups scanned: {total_scanned}")
    print(f"  Duplicate prescriptions identified: {total_matched}")

    # 4. Execute deletion if requested
    if total_matched > 0:
        if args.execute:
            print(f"\n[4/4] Executing deletion of {len(to_delete_ids)} prescriptions...")
            
            try:
                # 1. Delete details first for safety (if no cascade)
                print(f"  Deleting prescription_details...")
                for i in range(0, len(to_delete_ids), 100):
                    batch = to_delete_ids[i:i+100]
                    supabase.table('prescription_details').delete().in_('prescription_header_id', batch).execute()
                
                # 2. Delete headers
                print(f"  Deleting prescriptions_header...")
                for i in range(0, len(to_delete_ids), 100):
                    batch = to_delete_ids[i:i+100]
                    supabase.table('prescriptions_header').delete().in_('id', batch).execute()
                
                print(f"  Successfully deleted {len(to_delete_ids)} duplicates and their details.")
            except Exception as e:
                print(f"  ❌ Error during deletion: {e}")
        else:
            print(f"\n[4/4] DRY RUN: No data was modified.")
            print(f"  Run with --execute to perform the deletion.")
    else:
        print("\n[4/4] No duplicates to delete.")

if __name__ == "__main__":
    main()
