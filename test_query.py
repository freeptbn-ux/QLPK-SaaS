import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('d:/Hoc_C/QLPK-SaaS-main/clinic.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("SELECT id, name, name_normalized FROM patients WHERE name LIKE '%Nhật'")
print("--- PATIENTS ---")
print(json.dumps([dict(r) for r in c.fetchall()], ensure_ascii=False, indent=2))

c.execute("SELECT id, patient_id, prescription_date, diagnosis FROM prescriptions_header WHERE patient_id IN (SELECT id FROM patients WHERE name LIKE '%Nhật')")
print("--- PRESCRIPTIONS ---")
print(json.dumps([dict(r) for r in c.fetchall()], ensure_ascii=False, indent=2))
