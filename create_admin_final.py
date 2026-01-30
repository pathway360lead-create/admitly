"""
Final attempt to create admin user profile
Using service role key and explicit error handling
"""
from supabase import create_client
import sys

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1ODEzNiwiZXhwIjoyMDc4NDM0MTM2fQ.nJLqG7MXjd-Yb9Aa-EVo0s8aEHUAtPB4pN8AtVePaD0"

print("=" * 60)
print("CREATING ADMIN USER PROFILE")
print("=" * 60)

# Create client with service role
sb = create_client(
    "https://jvmmexjbnolzukhdhwds.supabase.co",
    SERVICE_KEY
)

user_id = "52018a51-b6c2-4047-a2e1-e0b93f2b69e2"

# Step 1: Delete any existing profile
print("\n1. Cleaning up any existing profile...")
try:
    result = sb.table('user_profiles').delete().eq('id', user_id).execute()
    print(f"   Deleted: {len(result.data) if result.data else 0} rows")
except Exception as e:
    print(f"   Delete error (OK if doesn't exist): {e}")

# Step 2: Insert new profile with minimal required fields
print("\n2. Inserting new profile...")
profile_data = {
    'id': user_id,
    'full_name': 'Admin User',
    'role': 'internal_admin'
}

print(f"   Data: {profile_data}")

try:
    result = sb.table('user_profiles').insert(profile_data).execute()
    print(f"   ✅ INSERT SUCCESS!")
    print(f"   Returned data: {result.data}")
except Exception as e:
    print(f"   ❌ INSERT FAILED: {e}")
    print(f"   Error type: {type(e).__name__}")
    sys.exit(1)

# Step 3: Verify it exists
print("\n3. Verifying profile exists...")
try:
    result = sb.table('user_profiles').select('id, full_name, role').eq('id', user_id).execute()
    
    if result.data and len(result.data) > 0:
        profile = result.data[0]
        print(f"   ✅ VERIFIED! Profile found:")
        print(f"      ID: {profile['id']}")
        print(f"      Name: {profile['full_name']}")
        print(f"      Role: {profile['role']}")
    else:
        print(f"   ❌ VERIFICATION FAILED: Profile not found!")
        print(f"   Query returned: {result.data}")
        sys.exit(1)
        
except Exception as e:
    print(f"   ❌ VERIFICATION ERROR: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ SUCCESS! Admin user profile is ready.")
print("=" * 60)
