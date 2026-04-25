import os
import psycopg2
from urllib.parse import urlparse, quote_plus

# Connect to database
password = quote_plus("@Colenao123@")
conn_str = f"postgresql://postgres.rrpbwyiobezgesameexo:{password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT proname, pg_get_function_arguments(oid)
        FROM pg_proc
        WHERE proname = 'create_prescription';
    """)
    rows = cur.fetchall()
    if rows:
        print("Found functions:")
        for r in rows:
            print(f"{r[0]}({r[1]})")
    else:
        print("Function 'create_prescription' not found.")
        
except Exception as e:
    print(f"Error: {e}")
