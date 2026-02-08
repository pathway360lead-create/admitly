"""
FastAPI Dependencies
"""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
import meilisearch
from core.database import get_supabase
from core.config import settings

logger = logging.getLogger(__name__)

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
    credentials: HTTPAuthorizationCredentials = Depends(security), # Need token
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Require admin role

    Checks user_profiles table for role = 'internal_admin'
    Raises 403 Forbidden if user is not admin
    """
    try:
        # Authenticate the client so RLS works
        token = credentials.credentials
        supabase.postgrest.auth(token)
        
        # Extract user ID from Supabase auth response
        if hasattr(current_user, 'user') and current_user.user:
            user_id = current_user.user.id
        elif hasattr(current_user, 'id'):
            user_id = current_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user ID from token"
            )
        
        # Query user_profiles table for role
        response = supabase.table('user_profiles').select('role').eq('id', user_id).maybe_single().execute()
        
        # Handle response
        profile_data = response.data if hasattr(response, 'data') else response

        if not profile_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: User profile not found"
            )

        # Get role from profile data
        if isinstance(profile_data, dict):
            user_role = profile_data.get('role')
        else:
            user_role = None

        if user_role != 'internal_admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: Insufficient permissions"
            )

        return current_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking admin permissions for user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking admin permissions: {str(e)}"
        )


async def get_admin_context(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Get authenticated admin user and Supabase client
    
    Returns tuple of (user, authenticated_client)
    This dependency does NOT depend on get_current_user to avoid duplicate credential injection.
    """
    try:
        token = credentials.credentials
        
        # Create authenticated client
        supabase = get_supabase()
        supabase.postgrest.auth(token)
        
        # Validate token and get user (doing what get_current_user does)
        try:
            current_user = supabase.auth.get_user(token)
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        # Extract user ID
        if hasattr(current_user, 'user') and current_user.user:
            user_id = current_user.user.id
        elif hasattr(current_user, 'id'):
            user_id = current_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user ID from token"
            )
        
        # Check admin role
        response = supabase.table('user_profiles').select('role').eq('id', user_id).maybe_single().execute()
        profile_data = response.data if hasattr(response, 'data') else response

        if not profile_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: User profile not found"
            )

        user_role = profile_data.get('role') if isinstance(profile_data, dict) else None

        if user_role != 'internal_admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: Insufficient permissions"
            )

        return (current_user, supabase)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_admin_context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking admin permissions: {str(e)}"
        )


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


def get_saved_search_service(
    supabase: Client = Depends(get_supabase),
    current_user = Depends(get_current_user),
):
    """Get saved search service instance"""
    from services.saved_search_service import SavedSearchService
    # Extract user ID from Supabase auth user object
    user_id = current_user.user.id
    return SavedSearchService(supabase, user_id)


def get_user_profile_service(
    supabase: Client = Depends(get_supabase),
    current_user = Depends(get_current_user),
):
    """Get user profile service instance"""
    from services.user_profile_service import UserProfileService
    # Extract user ID and email from Supabase auth user object
    user_id = current_user.user.id
    user_email = current_user.user.email
    return UserProfileService(supabase, user_id, user_email)


def get_search_history_service(
    supabase: Client = Depends(get_supabase),
    current_user = Depends(get_current_user),
):
    """Get search history service instance"""
    from services.search_history_service import SearchHistoryService
    # Extract user ID from Supabase auth user object
    user_id = current_user.user.id
    return SearchHistoryService(supabase, user_id)


def get_email_service():
    """Get email service instance"""
    from services.email_service import email_service
    return email_service
