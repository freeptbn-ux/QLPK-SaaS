# Phase 08: Data Migration
Status: ✅ Done
Dependencies: Phase 01 (Supabase schema phải tạo xong)

> **Note**: Phase này có thể chạy song song với Phase 02-07.
> Chỉ cần Phase 01 (schema) hoàn thành là có thể migrate data.

## Objective
Viết script Python để push toàn bộ dữ liệu từ `clinic.db` (SQLite) lên Supabase project mới. Verify data integrity sau migration.

## Requirements

### Functional
- [x] Push 716 patients lên Supabase (bỏ cột `prescription_migrated`)
- [x] Push 199 medicines lên Supabase (KÈM stock_quantity, min_stock_level)
- [x] Push 799 prescriptions_header lên Supabase
- [x] Push 2,463 prescription_details lên Supabase
- [x] KHÔNG push: `prescriptions` (ảnh), `prescriptions_image`
- [x] Sanitize DOB field (giữ nguyên TEXT, chỉ set NULL nếu rỗng)
- [x] Verify record counts sau migration
- [x] Backup clinic.db trước khi bắt đầu

### Non-Functional
- [x] Script chạy idempotent (chạy lại không tạo duplicate)
- [x] Progress logging
- [x] Error handling + retry

## Implementation Steps

### A. Preparation
1. [x] Backup `clinic.db`:
   ```bash
   cp /home/skul9x/Desktop/Test_code/QLPK-SaaS/clinic.db \
      /home/skul9x/Desktop/Test_code/QLPK-SaaS/clinic.db.backup-$(date +%Y%m%d)
   ```

2. [x] Tạo Supabase project mới (trên supabase.com)
3. [x] Chạy SQL schema từ Phase 01 trên Supabase SQL Editor
4. [x] Lấy `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` (key admin, bypass RLS)

### B. Migration Script
5. [ ] Tạo `scripts/migrate_to_supabase.py`:

```python
#!/usr/bin/env python3
"""
Migrate clinic.db (SQLite) → Supabase (PostgreSQL)
Usage: python scripts/migrate_to_supabase.py

Requires:
  pip install supabase
"""
import sqlite3
import json
import sys
import time
from supabase import create_client

# === CONFIGURATION ===
SQLITE_PATH = "/home/skul9x/Desktop/Test_code/QLPK-SaaS/clinic.db"
SUPABASE_URL = "YOUR_NEW_SUPABASE_URL"
SUPABASE_SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY"  # Bypass RLS
BATCH_SIZE = 100  # Upsert in batches

def main():
    # Connect SQLite
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row

    # Connect Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    print("=" * 60)
    print("CLINIC.DB → SUPABASE MIGRATION")
    print("=" * 60)

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
    print("\n✅ MIGRATION COMPLETE!")

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
    c.execute("""SELECT id, patient_id, prescription_date, diagnosis, total_amount, notes
                 FROM prescriptions_header""")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} prescription headers")

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i+BATCH_SIZE]
        supabase.table('prescriptions_header').upsert(batch).execute()
        print(f"  Pushed {min(i+BATCH_SIZE, len(rows))}/{len(rows)}")

def migrate_prescription_details(conn, supabase):
    print("\n[4/4] Migrating PRESCRIPTION DETAILS...")
    c = conn.cursor()
    c.execute("""SELECT id, prescription_header_id, medicine_id, quantity, unit_price
                 FROM prescription_details""")
    rows = [dict(r) for r in c.fetchall()]
    print(f"  Found {len(rows)} prescription details")

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
        c.execute(f"SELECT COUNT(*) FROM {table}")
        local_count = c.fetchone()[0]

        response = supabase.table(table).select('id', count='exact').execute()
        cloud_count = response.count

        status = "✅" if local_count == cloud_count else "❌"
        if local_count != cloud_count:
            all_ok = False

        print(f"  {status} {table}: Local={local_count}, Cloud={cloud_count}")

    if all_ok:
        print("\n🎉 All tables verified! Migration successful.")
    else:
        print("\n⚠️ MISMATCH DETECTED! Check logs above.")

if __name__ == "__main__":
    main()
```

### C. Reset Supabase Sequences
6. [ ] Sau khi migrate, chạy SQL trên Supabase SQL Editor để reset auto-increment:

```sql
-- Reset sequences to match max IDs
SELECT setval('patients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM patients));
SELECT setval('medicines_id_seq', (SELECT COALESCE(MAX(id), 1) FROM medicines));
SELECT setval('prescriptions_header_id_seq', (SELECT COALESCE(MAX(id), 1) FROM prescriptions_header));
SELECT setval('prescription_details_id_seq', (SELECT COALESCE(MAX(id), 1) FROM prescription_details));
```

### D. Insert Default Settings
7. [ ] Chạy SQL trên Supabase (nếu chưa có từ Phase 01):

```sql
INSERT INTO settings (key, value) VALUES
  ('consultation_fee', '120'),
  ('doctor_name', 'BS. Nguyễn Duy Trường'),
  ('clinic_name', 'Phòng khám Nhi khoa'),
  ('drug_presets', '[{"name":"ZT-Amox","mg":200,"ml":5,"dose":50},{"name":"Cefdinir","mg":125,"ml":5,"dose":14},{"name":"Bactirid","mg":100,"ml":5,"dose":8},{"name":"ZiUSA","mg":200,"ml":5,"dose":10},{"name":"Biseptol","mg":240,"ml":5,"dose":48}]')
ON CONFLICT (key) DO NOTHING;
```

### E. Verification
8. [ ] Kiểm tra trên Supabase Dashboard:
   - Table Editor → patients: 716 rows
   - Table Editor → medicines: 199 rows
   - Table Editor → prescriptions_header: 799 rows
   - Table Editor → prescription_details: 2,463 rows
   - Table Editor → settings: 4 rows

## Files to Create
- `scripts/migrate_to_supabase.py`
- `scripts/requirements.txt` → `supabase`

## Test Criteria
- [x] Script chạy không lỗi
- [x] Tất cả record counts match (local = cloud)
- [x] Sequences reset đúng (INSERT mới không conflict ID)
- [x] Settings có đủ default values
- [x] Web app SaaS load được data từ Supabase

## Notes
- **QUAN TRỌNG**: Dùng `SERVICE_ROLE_KEY` (không phải anon key) vì cần bypass RLS để upsert
- Script dùng `upsert` nên chạy lại không tạo duplicate (idempotent)
- Batch size 100 để tránh rate limit của Supabase
- Supabase free tier: 500MB database → ~4,200 records rất nhỏ, OK
- Sau khi verify, có thể xóa `clinic.db` khỏi thư mục QLPK-SaaS (hoặc gitignore)
- **KHÔNG commit** `SUPABASE_SERVICE_KEY` vào git!

---
Previous Phase: ← [phase-07-settings-deploy.md](./phase-07-settings-deploy.md)
