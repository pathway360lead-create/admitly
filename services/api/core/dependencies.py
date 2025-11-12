"""
FastAPI Dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from core.database import get_supabase, get_supabase_admin

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials

    try:
        # Verify token with Supabase Auth
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_current_admin_user(
    current_user = Depends(get_current_user),
):
    """Require admin role"""
    # TODO: Check user role from database
    # For now, just return the user
    return current_user
