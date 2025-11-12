"""
Database Connection (Supabase)
"""
from supabase import create_client, Client
from core.config import settings


def get_supabase() -> Client:
    """Get Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_supabase_admin() -> Client:
    """Get Supabase admin client with service role key"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
