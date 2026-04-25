#!/usr/bin/env python3
"""
Migrate clinic.db (SQLite) → Supabase (PostgreSQL)
Usage: python scripts/migrate_to_supabase.py

Requires:
  pip install supabase python-dotenv
"""
import sqlite3
import json
import sys
import os
import time
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

# === CONFIGURATION ===
SQLITE_PATH = os.path.join(os.path.dirname(__file__), '../clinic.db')
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# IMPORTANT: Need SERVICE_ROLE_KEY to bypass RLS for migration
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

BATCH_SIZE = 100  # Upsert in batches

def main():
    if not SUPABASE_URL:
        print("❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local")
        sys.exit(1)
    
    if not SUPABASE_SERVICE_KEY:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
        print("Please add SUPABASE_SERVICE_ROLE_KEY=your_key to .env.local before running.")
        sys.exit(1)

    # Connect SQLite
    try:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
    except Exception as e:
        print(f"❌ Error connecting to SQLite: {e}")
        sys.exit(1)

    # Connect Supabase
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        sys.exit(1)

    print("=" * 60)
    print("CLINIC.DB -> SUPABASE MIGRATION")
    print(f"Target URL: {SUPABASE_URL}")
    print("=" * 60)

    # 0. Clear existing data (Optional but requested by user)
    clear_supabase_tables(supabase)

    # 1. Migrate Medicines (must be first - FK dependency)
    migrate_medicines(conn, supabase)

    # 2. Migrate Patients
    migrate_patients(conn, supabase)

    # 3. Migrate Prescription Headers
    migrate_prescription_headers(conn, supabase)

    # 4. Migrate Prescription Details
    migrate_prescription_details(conn, supabase)

    # 5. Verify
    verify_migration(conn, supabase)

    conn.close()
    print("\n[OK] MIGRATION COMPLETE!")

def clear_supabase_tables(supabase):
    print("\n[0/4] Clearing existing data in Supabase...")
    # Order matters due to Foreign Key constraints
    tables = ['prescription_details', 'prescriptions_header', 'patients', 'medicines']
    for table in tables:
        try:
            # Delete all rows. In Supabase Python client, we can use delete().neq('id', -1) or similar
            # Since we use Service Role Key, RLS is bypassed.
            supabase.table(table).delete().neq('id', -1).execute()
            print(f"  Cleared table: {table}")
        except Exception as e:
            print(f"  [WARN] Warning: Could not clear {table}: {e}")

def migrate_medicines(conn, supabase):
    print("\n[1/4] Migrating MEDICINES...")
    c = conn.cursor()
    c.execute("SELECT id, name, packing_spec, price, stock_quantity, min_stock_level FROM medicines")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} medicines")

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i+BATCH_SIZE]
        supabase.table('medicines').upsert(batch).execute()
        print(f"  Pushed {min(i+BATCH_SIZE, len(rows))}/{len(rows)}")

def migrate_patients(conn, supabase):
    print("\n[2/4] Migrating PATIENTS...")
    c = conn.cursor()
    c.execute("""SELECT id, name, dob, gender, address, phone, weight,
                        medical_history, diagnosis, created_at, name_normalized
                 FROM patients""")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} patients")

    # Sanitize
    for row in rows:
        if row.get('dob') == '':
            row['dob'] = None
        if row.get('created_at') == '':
            row['created_at'] = None

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i+BATCH_SIZE]
        supabase.table('patients').upsert(batch).execute()
        print(f"  Pushed {min(i+BATCH_SIZE, len(rows))}/{len(rows)}")

def migrate_prescription_headers(conn, supabase):
    print("\n[3/4] Migrating PRESCRIPTION HEADERS...")
    c = conn.cursor()
    # Filter out orphaned prescriptions (where patient doesn't exist)
    c.execute("""SELECT id, patient_id, prescription_date, diagnosis, total_amount, notes
                 FROM prescriptions_header
                 WHERE patient_id IN (SELECT id FROM patients)""")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} valid prescription headers (skipped orphaned)")

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i+BATCH_SIZE]
        supabase.table('prescriptions_header').upsert(batch).execute()
        print(f"  Pushed {min(i+BATCH_SIZE, len(rows))}/{len(rows)}")

def migrate_prescription_details(conn, supabase):
    print("\n[4/4] Migrating PRESCRIPTION DETAILS...")
    c = conn.cursor()
    # Filter out orphaned details (where header doesn't exist or was skipped)
    c.execute("""SELECT id, prescription_header_id, medicine_id, quantity, unit_price
                 FROM prescription_details
                 WHERE prescription_header_id IN (
                     SELECT id FROM prescriptions_header WHERE patient_id IN (SELECT id FROM patients)
                 )""")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} valid prescription details")

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i+BATCH_SIZE]
        supabase.table('prescription_details').upsert(batch).execute()
        print(f"  Pushed {min(i+BATCH_SIZE, len(rows))}/{len(rows)}")

def verify_migration(conn, supabase):
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)

    tables = ['medicines', 'patients', 'prescriptions_header', 'prescription_details']
    c = conn.cursor()
    all_ok = True

    for table in tables:
        if table == 'prescriptions_header':
            c.execute("SELECT COUNT(*) FROM prescriptions_header WHERE patient_id IN (SELECT id FROM patients)")
        elif table == 'prescription_details':
            c.execute("""SELECT COUNT(*) FROM prescription_details 
                         WHERE prescription_header_id IN (
                             SELECT id FROM prescriptions_header WHERE patient_id IN (SELECT id FROM patients)
                         )""")
        else:
            c.execute(f"SELECT COUNT(*) FROM {table}")
        
        local_count = c.fetchone()[0]

        try:
            response = supabase.table(table).select('id', count='exact').execute()
            cloud_count = response.count
        except Exception as e:
            print(f"  ❌ Error fetching count for {table}: {e}")
            all_ok = False
            continue

        status = "[OK]" if local_count == cloud_count else "[FAIL]"
        if local_count != cloud_count:
            all_ok = False

        print(f"  {status} {table}: Local={local_count}, Cloud={cloud_count}")

    if all_ok:
        print("\n[SUCCESS] All tables verified! Migration successful.")
    else:
        print("\n[WARN] MISMATCH DETECTED! Check logs above.")

if __name__ == "__main__":
    main()
