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
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Require admin role

    Checks user_profiles table for role = 'admin'
    Raises 403 Forbidden if user is not admin
    """
    try:
        # Debug current_user structure
        print(f"\n[DEBUG] current_user type: {type(current_user)}")
        print(f"[DEBUG] current_user: {current_user}")
        
        # Extract user ID from Supabase auth response
        # Handle both old and new Supabase response formats
        if hasattr(current_user, 'user') and current_user.user:
            user_id = current_user.user.id
        elif hasattr(current_user, 'id'):
            user_id = current_user.id
        else:
            print(f"[DEBUG] Cannot find user.id in current_user!")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user ID from token"
            )
        
        print(f"[DEBUG] Admin check for user_id: {user_id}")

        # Query user_profiles table for role
        print(f"[DEBUG] Querying user_profiles table...")
        response = supabase.table('user_profiles').select('role').eq('id', user_id).maybe_single().execute()
        print(f"[DEBUG] Query response type: {type(response)}")
        print(f"[DEBUG] Query response: {response}")
        
        # Handle response - maybe_single returns APIResponse with .data attribute
        profile_data = response.data if hasattr(response, 'data') else response
        print(f"[DEBUG] Profile data: {profile_data}")

        if not profile_data:
            print(f"[DEBUG] No profile found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: User profile not found"
            )

        # Get role from profile data
        if isinstance(profile_data, dict):
            user_role = profile_data.get('role')
        else:
            user_role = None
        print(f"[DEBUG] User role: {user_role}")

        if user_role != 'internal_admin':
            print(f"[DEBUG] Role mismatch: {user_role} != 'internal_admin'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access denied: Insufficient permissions"
            )

        print(f"[DEBUG] Admin check PASSED for user {user_id}")
        return current_user

    except HTTPException:
        raise
    except Exception as e:
        print(f"\n[DEBUG] !!! EXCEPTION in get_current_admin_user !!!")
        print(f"[DEBUG] Error: {str(e)}")
        print(f"[DEBUG] Type: {type(e).__name__}")
        print(f"[DEBUG] Repr: {repr(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error checking admin permissions for user: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception details: {repr(e)}")
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
