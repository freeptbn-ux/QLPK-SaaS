import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

import urllib.parse

def apply_sql(file_path):
    # Extract project ID from Supabase URL
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    db_password = os.getenv("DB_PASSWORD")
    
    if not supabase_url or not db_password:
        print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or DB_PASSWORD in .env.local")
        print("Tip: Add DB_PASSWORD=your_password to .env.local")
        return

    # URL format: https://[PROJECT_ID].supabase.co
    project_id = supabase_url.split("//")[1].split(".")[0]
    
    # URL encode password for special characters like '@'
    encoded_password = urllib.parse.quote_plus(db_password)
    
    # Connection string for Supabase
    conn_str = f"postgresql://postgres:{encoded_password}@db.{project_id}.supabase.co:5432/postgres"

    try:
        print(f"Connecting to database {project_id}...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cursor = conn.cursor()

        print(f"Reading file: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()

        print("Executing SQL...")
        cursor.execute(sql)
        
        print("Success! RPC/Index updated.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error executing SQL: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python scripts/apply_sql.py [đường_dẫn_file_sql]")
    else:
        apply_sql(sys.argv[1])
