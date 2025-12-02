"""
FastAPI Dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
import meilisearch
from core.database import get_supabase, get_supabase_admin
from core.config import settings

security = HTTPBearer()


def get_meilisearch_client() -> meilisearch.Client:
    """Get Meilisearch client instance"""
    return meilisearch.Client(
        settings.MEILISEARCH_HOST,
        settings.MEILISEARCH_API_KEY
    )


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


def get_institution_service(
    supabase: Client = Depends(get_supabase),
):
    """Get institution service instance"""
    from services.institution_service import InstitutionService
    return InstitutionService(supabase)


def get_program_service(
    supabase: Client = Depends(get_supabase),
):
    """Get program service instance"""
    from services.program_service import ProgramService
    return ProgramService(supabase)


def get_search_service(
    meilisearch_client: meilisearch.Client = Depends(get_meilisearch_client),
):
    """Get search service instance"""
    from services.search_service import SearchService
    return SearchService(meilisearch_client)


def get_bookmark_service(
    supabase: Client = Depends(get_supabase),
    current_user = Depends(get_current_user),
):
    """Get bookmark service instance"""
    from services.bookmark_service import BookmarkService
    # Extract user ID from Supabase auth user object
    user_id = current_user.user.id
    return BookmarkService(supabase, user_id)
