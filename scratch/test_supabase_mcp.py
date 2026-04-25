import os
import requests

# Load from .env.local manually for test
url = "https://rrpbwyiobezgesameexo.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycGJ3eWlvYmV6Z2VzYW1lZXhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg1NzE5MywiZXhwIjoyMDkyNDMzMTkzfQ.T2R0n-EPrydIwqu0Bzze7qXowjsApC5HmzmFYtfsIgE"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

print(f"Testing connection to {url}/rest/v1/patients?select=*&limit=1")
try:
    response = requests.get(f"{url}/rest/v1/patients?select=*&limit=1", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
