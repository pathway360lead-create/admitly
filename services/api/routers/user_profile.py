"""
User Profile Router
API endpoints for user profile management
"""
import logging
from fastapi import APIRouter, Depends, Body

from schemas.user_profile import (
    UserProfileResponse,
    UserProfileUpdate,
    UserPreferencesUpdate,
    UserPreferencesResponse,
    AccountDeleteRequest,
    AccountDeleteResponse,
)
from services.user_profile_service import UserProfileService
from core.dependencies import get_user_profile_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users/me",
    tags=["user-profile"],
)


@router.get(
    "",
    response_model=UserProfileResponse,
    summary="Get user profile",
    description="""
Get the authenticated user's complete profile information.

**Authentication Required:** JWT Bearer token

**Response:**
Returns complete user profile including:
- Personal information (name, phone, location)
- Account details (role, subscription status)
- Preferences (theme, notifications, search defaults)
- Metadata (onboarding status, last login)
- Timestamps

**Use Cases:**
- Display user info in profile page
- Populate forms with current data
- Check subscription status
- Load user preferences

**Error Responses:**
- 401: Invalid or missing JWT token
- 404: User profile not found (shouldn't happen if authenticated)
- 500: Internal server error
""",
)
async def get_profile(
    service: UserProfileService = Depends(get_user_profile_service)
):
    """
    Get authenticated user's profile

    Returns complete profile with all fields including preferences and metadata.
    Only returns non-deleted profiles.
    """
    return await service.get_profile()


@router.patch(
    "",
    response_model=UserProfileResponse,
    summary="Update user profile",
    description="""
Update user profile information (name, phone, location).

**Authentication Required:** JWT Bearer token

**Request Body:**
All fields are optional. Only provided fields will be updated.
- **full_name**: User's full name (2-100 chars)
- **phone_number**: Phone number (max 20 chars)
- **state**: State of residence (max 50 chars)
- **lga**: Local Government Area (max 100 chars)

**Protected Fields:**
Users **CANNOT** update these fields (silently ignored if sent):
- email (managed by auth system)
- role (managed by admins)
- subscription_status (managed by payment system)
- subscription_tier (managed by payment system)
- subscription dates (managed by payment system)

**Response:**
Returns complete updated profile.

**Example Request:**
```json
{
  "full_name": "John Doe Updated",
  "phone_number": "+2348098765432",
  "state": "Ogun",
  "lga": "Ijebu Ode"
}
```

**Error Responses:**
- 401: Invalid or missing JWT token
- 400: Invalid data (validation error)
- 500: Update failed
""",
)
async def update_profile(
    update_data: UserProfileUpdate = Body(...),
    service: UserProfileService = Depends(get_user_profile_service)
):
    """
    Update user profile information

    Only updates the provided fields. Protected fields are ignored.
    Returns the complete updated profile.
    """
    return await service.update_profile(update_data)


@router.patch(
    "/preferences",
    response_model=UserPreferencesResponse,
    summary="Update user preferences",
    description="""
Update user preferences (theme, notifications, search defaults).

**Authentication Required:** JWT Bearer token

**Request Body:**
All fields are optional. Preferences are merged with existing values.
- **theme**: UI theme (`light`, `dark`, `system`)
- **notifications**: Notification settings object
  - email: boolean
  - push: boolean
  - deadline_alerts: boolean
  - new_programs: boolean
  - cost_changes: boolean
- **search_defaults**: Default search filters object
  - state: string
  - degree_type: string
  - sort_by: string

**Merge Behavior:**
- New preferences are merged with existing ones
- Omitted fields keep their current values
- To disable a setting, explicitly set it to false

**Example Request:**
```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false,
    "deadline_alerts": true,
    "new_programs": true,
    "cost_changes": false
  },
  "search_defaults": {
    "state": "Lagos",
    "degree_type": "undergraduate",
    "sort_by": "relevance"
  }
}
```

**Response:**
Returns user ID, updated preferences, and timestamp.

**Error Responses:**
- 401: Invalid or missing JWT token
- 400: Invalid preference values
- 500: Update failed
""",
)
async def update_preferences(
    preferences_data: UserPreferencesUpdate = Body(...),
    service: UserProfileService = Depends(get_user_profile_service)
):
    """
    Update user preferences

    Merges provided preferences with existing ones.
    Returns the complete updated preferences object.
    """
    return await service.update_preferences(preferences_data)


@router.delete(
    "",
    response_model=AccountDeleteResponse,
    summary="Delete account (soft delete)",
    description="""
Permanently delete user account and all associated data (soft delete).

**Authentication Required:** JWT Bearer token

**⚠️ WARNING:** This action cannot be undone. All user data will be deleted:
- User profile
- All bookmarks
- All saved searches
- All search history
- All notifications
- All AI conversations

**What is NOT deleted (kept for legal/audit compliance):**
- Transaction records
- Payment history
- Auth account (for potential recovery)

**Request Body:**
- **confirmation**: Must be exactly "DELETE" (case-sensitive)
- **reason**: Optional deletion reason (max 500 chars)

**Example Request:**
```json
{
  "confirmation": "DELETE",
  "reason": "No longer needed"
}
```

**Response:**
Returns success message and deletion timestamp.

**Business Logic:**
1. Validates confirmation string
2. Soft deletes user profile (sets deleted_at)
3. Cascades soft delete to all related data
4. Logs deletion with reason for audit
5. Does NOT delete from Supabase Auth (allows recovery)

**Error Responses:**
- 401: Invalid or missing JWT token
- 400: Invalid confirmation (must be "DELETE")
- 500: Deletion failed
""",
)
async def delete_account(
    delete_request: AccountDeleteRequest = Body(...),
    service: UserProfileService = Depends(get_user_profile_service)
):
    """
    Delete user account (soft delete)

    Soft deletes profile and cascades to all related data.
    Keeps transaction records for legal compliance.
    """
    return await service.delete_account(delete_request)
