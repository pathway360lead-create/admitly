import requests
import json
from supabase import create_client

# Get a real session token
sb = create_client(
    "https://jvmmexjbnolzukhdhwds.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTgxMzYsImV4cCI6MjA3ODQzNDEzNn0.dhUaZen1zQ2cAUyzWX8Yw8r45UtzyfMc7hD_zRhzBHM"
)

# Sign in
print("Signing in...")
auth_response = sb.auth.sign_in_with_password({
    "email": "pathway360lead@gmail.com",
    "password": "Pathway360"  # Replace with actual password
})

if auth_response.session:
    token = auth_response.session.access_token
    print(f"✅ Got token: {token[:50]}...")
    
    # Make request to admin API
    print("\nTesting admin API...")
    url = "http://localhost:8000/api/v1/admin/institutions?page=1&page_size=1"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response time: {response.elapsed.total_seconds()}s")
    print(f"\nResponse body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
else:
    print("❌ Failed to sign in")
    print(auth_response)
