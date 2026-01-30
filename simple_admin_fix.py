from supabase import create_client

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg1ODEzNiwiZXhwIjoyMDc4NDM0MTM2fQ.nJLqG7MXjd-Yb9Aa-EVo0s8aEHUAtPB4pN8AtVePaD0"

sb = create_client("https://jvmmexjbnolzukhdhwds.supabase.co", SERVICE_KEY)

user_id = "52018a51-b6c2-4047-a2e1-e0b93f2b69e2"

# Use upsert with all possible default values
data = {
    'id': user_id,
    'role': 'internal_admin',
    'full_name': 'Admin User'
}

print(f"Upserting profile for {user_id}...")
result = sb.table('user_profiles').upsert(data, on_conflict='id').execute()
print(f"Result: {result.data}")

# Verify
check = sb.table('user_profiles').select('*').eq('id', user_id).execute()
if check.data:
    print(f"\n✅ SUCCESS! Profile exists:")
    print(f"Role: {check.data[0]['role']}")
else:
    print("\n❌ Profile not found!")
