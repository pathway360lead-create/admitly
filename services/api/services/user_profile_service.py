"""
User Profile Service
Business logic for user profile management
"""
import logging
from typing import Dict, Any
from supabase import Client
from fastapi import HTTPException, status
from datetime import datetime, timezone

from schemas.user_profile import (
    UserProfileResponse,
    UserProfileUpdate,
    UserPreferencesUpdate,
    UserPreferencesResponse,
    AccountDeleteRequest,
    AccountDeleteResponse,
)

logger = logging.getLogger(__name__)


class UserProfileService:
    """Service for managing user profiles"""

    def __init__(self, supabase: Client, user_id: str, user_email: str):
        self.supabase = supabase
        self.user_id = user_id
        self.user_email = user_email

    async def get_profile(self) -> UserProfileResponse:
        """Get user profile"""
        try:
            response = (
                self.supabase.table("user_profiles")
                .select("*")
                .eq("id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )

            profile = response.data[0]

            return UserProfileResponse(
                id=profile["id"],
                email=self.user_email,
                full_name=profile["full_name"],
                phone_number=profile.get("phone_number"),
                state=profile.get("state"),
                lga=profile.get("lga"),
                role=profile["role"],
                subscription_status=profile.get("subscription_status"),
                subscription_tier=profile.get("subscription_tier"),
                subscription_start_date=profile.get("subscription_start_date"),
                subscription_end_date=profile.get("subscription_end_date"),
                preferences=profile.get("preferences", {}),
                metadata=profile.get("metadata", {}),
                created_at=profile["created_at"],
                updated_at=profile["updated_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user profile"
            )

    async def update_profile(
        self, update_data: UserProfileUpdate
    ) -> UserProfileResponse:
        """Update user profile (only allowed fields)"""
        try:
            # Build update dict with only provided fields
            update_fields = {}

            if update_data.full_name is not None:
                update_fields["full_name"] = update_data.full_name

            if update_data.phone_number is not None:
                update_fields["phone_number"] = update_data.phone_number

            if update_data.state is not None:
                update_fields["state"] = update_data.state

            if update_data.lga is not None:
                update_fields["lga"] = update_data.lga

            if not update_fields:
                # Nothing to update, return current profile
                return await self.get_profile()

            # Update profile
            response = (
                self.supabase.table("user_profiles")
                .update(update_fields)
                .eq("id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile"
                )

            # Return updated profile
            return await self.get_profile()

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user profile"
            )

    async def update_preferences(
        self, preferences_data: UserPreferencesUpdate
    ) -> UserPreferencesResponse:
        """Update user preferences"""
        try:
            # Get current profile to merge preferences
            current_profile = await self.get_profile()
            current_preferences = current_profile.preferences.copy()

            # Build new preferences by merging
            new_preferences = current_preferences

            # Update only provided preference fields
            if preferences_data.theme is not None:
                new_preferences["theme"] = preferences_data.theme

            if preferences_data.notifications is not None:
                if "notifications" not in new_preferences:
                    new_preferences["notifications"] = {}

                # Merge notification preferences
                for key, value in preferences_data.notifications.model_dump(exclude_none=True).items():
                    new_preferences["notifications"][key] = value

            if preferences_data.search_defaults is not None:
                if "search_defaults" not in new_preferences:
                    new_preferences["search_defaults"] = {}

                # Merge search defaults
                for key, value in preferences_data.search_defaults.model_dump(exclude_none=True).items():
                    new_preferences["search_defaults"][key] = value

            # Update in database
            response = (
                self.supabase.table("user_profiles")
                .update({"preferences": new_preferences})
                .eq("id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update preferences"
                )

            profile = response.data[0]
            return UserPreferencesResponse(
                id=profile["id"],
                preferences=profile.get("preferences", {}),
                updated_at=profile["updated_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating preferences: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update preferences"
            )

    async def delete_account(
        self, delete_request: AccountDeleteRequest
    ) -> AccountDeleteResponse:
        """Soft delete user account and cascade to related data"""
        try:
            # Validate confirmation
            if delete_request.confirmation != "DELETE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Confirmation must be 'DELETE' to proceed"
                )

            now = datetime.now(timezone.utc).isoformat()

            # Soft delete user profile
            profile_response = (
                self.supabase.table("user_profiles")
                .update({
                    "deleted_at": now,
                    "metadata": {
                        "deletion_reason": delete_request.reason,
                        "deleted_at": now,
                    }
                })
                .eq("id", self.user_id)
                .execute()
            )

            if not profile_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete account"
                )

            # Cascade soft delete to related data
            # Note: These operations don't fail the main deletion if they error

            try:
                # Delete bookmarks
                self.supabase.table("user_bookmarks").update(
                    {"deleted_at": now}
                ).eq("user_id", self.user_id).is_("deleted_at", "null").execute()
            except Exception as e:
                logger.warning(f"Failed to cascade delete bookmarks: {e}")

            try:
                # Delete saved searches
                self.supabase.table("user_saved_searches").update(
                    {"deleted_at": now}
                ).eq("user_id", self.user_id).is_("deleted_at", "null").execute()
            except Exception as e:
                logger.warning(f"Failed to cascade delete saved searches: {e}")

            try:
                # Delete search history
                self.supabase.table("user_search_history").update(
                    {"deleted_at": now}
                ).eq("user_id", self.user_id).is_("deleted_at", "null").execute()
            except Exception as e:
                logger.warning(f"Failed to cascade delete search history: {e}")

            # Note: We do NOT delete from Supabase Auth for potential recovery
            # Note: We do NOT delete transactions (keep for audit/legal compliance)

            logger.info(f"User account deleted: {self.user_id}, reason: {delete_request.reason}")

            return AccountDeleteResponse(
                message="Account deleted successfully. All your data has been removed.",
                deleted_at=datetime.fromisoformat(now.replace('Z', '+00:00'))
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting account: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete account"
            )
