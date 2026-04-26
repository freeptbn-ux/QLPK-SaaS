import psycopg2
import urllib.parse

db_password = "@Colenao123@"
project_id = "rrpbwyiobezgesameexo"
encoded_password = urllib.parse.quote_plus(db_password)

regions = ["ap-southeast-1", "us-east-1", "eu-central-1", "ap-northeast-1"]

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    user = f"postgres.{project_id}"
    conn_str = f"postgresql://{user}:{encoded_password}@{host}:5432/postgres"
    
    print(f"Testing {region}...")
    try:
        conn = psycopg2.connect(conn_str, connect_timeout=5)
        print(f"Success! Region is {region}")
        conn.close()
        break
    except Exception as e:
        print(f"Failed {region}: {e}")
