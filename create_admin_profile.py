from supabase import create_client

# Service role key for admin operations
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1ODEzNiwiZXhwIjoyMDc4NDM0MTM2fQ.nJLqG7MXjd-Yb9Aa-EVo0s8aEHUAtPB4pN8AtVePaD0"

sb = create_client(
    "https://jvmmexjbnolzukhdhwds.supabase.co",
    SERVICE_KEY
)

user_id = "52018a51-b6c2-4047-a2e1-e0b93f2b69e2"

print(f"Creating/updating user profile for: {user_id}")

try:
    # Try insert first
    result = sb.table('user_profiles').insert({
        'id': user_id,
        'role': 'internal_admin'
    }).execute()
    print("✅ Profile created successfully!")
    print(f"Data: {result.data}")
except Exception as e:
    print(f"Insert failed: {e}")
    print("\nTrying update instead...")
    try:
        # If insert fails, try update
        result = sb.table('user_profiles').update({
            'role': 'internal_admin'
        }).eq('id', user_id).execute()
        print("✅ Profile updated successfully!")
        print(f"Data: {result.data}")
    except Exception as e2:
        print(f"❌ Update also failed: {e2}")
        
# Verify
print("\nVerifying profile...")
result = sb.table('user_profiles').select('*').eq('id', user_id).execute()
print(f"Profile data: {result.data}")
