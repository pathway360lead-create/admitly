"""
Database Connection (Supabase)
"""
from supabase import create_client, Client
from core.config import settings


def get_supabase() -> Client:
    """Get Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_supabase_with_token(access_token: str) -> Client:
    """
    Get Supabase client with user's JWT token (enforces RLS)
    
    This replaces the old get_supabase_admin() which used service_role key.
    Now all admin operations go through RLS policies that check for 'internal_admin' role.
    
    Security Benefits:
    - RLS policies enforce role-based access control
    - User actions are auditable via auth.uid()
    - No single point of failure (service_role key)
    - Defense in depth: application + database security layers
    
    Args:
        access_token: User's JWT token from Authorization header
        
    Returns:
        Supabase client configured with user's session
        
    Raises:
        Exception: If token is invalid or expired
    """
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    # Set user session - this makes auth.uid() work in RLS policies
    client.postgrest.auth(access_token)
    return client
