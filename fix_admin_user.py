"""
Create admin user profile using raw SQL through Supabase
"""
from supabase import create_client
import sys

# Use service role key to bypass RLS
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1ODEzNiwiZXhwIjoyMDc4NDM0MTM2fQ.nJLqG7MXjd-Yb9Aa-EVo0s8aEHUAtPB4pN8AtVePaD0"

sb = create_client(
    "https://jvmmexjbnolzukhdhwds.supabase.co",
    SERVICE_KEY,
    options={
        "postgrest": {
            "schema": "public"
        }
    }
)

user_id = "52018a51-b6c2-4047-a2e1-e0b93f2b69e2"

print(f"\n=== Creating Admin User Profile ===")
print(f"User ID: {user_id}\n")

# Delete existing if any
print("1. Deleting any existing profile...")
try:
    sb.table('user_profiles').delete().eq('id', user_id).execute()
    print("   ✅ Deleted existing profile (if any)\n")
except Exception as e:
    print(f"   ⚠️  Delete failed (probably didn't exist): {e}\n")

# Insert new profile
print("2. Inserting new profile with role='internal_admin'...")
try:
    result = sb.table('user_profiles').insert({
        'id': user_id,
        'role': 'internal_admin'
    }, count='exact').execute()
    
    print(f"   ✅ SUCCESS! Profile created")
    print(f"   Count: {result.count}")
    print(f"   Data: {result.data}\n")
    
except Exception as e:
    print(f"   ❌ FAILED: {e}\n")
    print(f"   Error type: {type(e).__name__}")
    if hasattr(e, 'message'):
        print(f"   Message: {e.message}")
    sys.exit(1)

# Verify
print("3. Verifying profile was created...")
try:
    result = sb.table('user_profiles').select('id, role, created_at').eq('id', user_id).execute()
    
    if result.data:
        print(f"   ✅ VERIFIED! Profile exists:")
        print(f"   - ID: {result.data[0]['id']}")
        print(f"   - Role: {result.data[0]['role']}")
        print(f"   - Created: {result.data[0]['created_at']}")
    else:
        print(f"   ❌ Profile not found!")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ Verification failed: {e}")
    sys.exit(1)

print("\n✅ ALL DONE! User can now access admin panel.\n")
