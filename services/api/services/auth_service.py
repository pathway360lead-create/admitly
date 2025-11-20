"""
Authentication Service
Business logic for user authentication using Supabase Auth
"""
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from supabase import AuthApiError
import logging

from core.database import get_supabase, get_supabase_admin
from core.security import get_token_expiration_seconds
from schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfile

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service using Supabase Auth

    Handles:
    - User registration with profile creation
    - Login with credentials
    - Token refresh
    - User profile retrieval
    - Session management
    """

    def __init__(self):
        self.supabase = get_supabase()
        self.supabase_admin = get_supabase_admin()

    async def register(self, user_data: UserRegister) -> TokenResponse:
        """
        Register new user account

        Steps:
        1. Create user in Supabase Auth
        2. Create user profile in user_profiles table
        3. Return authentication tokens

        Args:
            user_data: Registration payload with email, password, full_name, role

        Returns:
            TokenResponse with access_token and refresh_token

        Raises:
            HTTPException: If registration fails (duplicate email, etc.)
        """
        try:
            # Create user in Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name,
                        "role": user_data.role
                    }
                }
            })

            if not auth_response.user:
                logger.error("User registration failed: No user returned from Supabase")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User registration failed"
                )

            # Create user profile in database
            profile_data = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "role": user_data.role,
                "subscription_status": "free"
            }

            try:
                self.supabase_admin.table('user_profiles').insert(profile_data).execute()
                logger.info(f"User profile created for user {auth_response.user.id}")
            except Exception as profile_error:
                # Log but don't fail - the profile might be created by database trigger
                logger.warning(f"Profile creation warning: {str(profile_error)}")

            # Return tokens
            if not auth_response.session:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create session"
                )

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                token_type="bearer",
                expires_in=get_token_expiration_seconds()
            )

        except AuthApiError as e:
            logger.error(f"Supabase Auth error during registration: {str(e)}")
            # Handle specific Supabase errors
            if "already registered" in str(e).lower() or "duplicate" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during registration: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during registration"
            )

    async def login(self, credentials: UserLogin) -> TokenResponse:
        """
        Authenticate user with email and password

        Args:
            credentials: Login payload with email and password

        Returns:
            TokenResponse with access_token and refresh_token

        Raises:
            HTTPException: If credentials are invalid (401)
        """
        try:
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })

            if not auth_response.session:
                logger.warning(f"Login failed for user: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )

            logger.info(f"User logged in successfully: {credentials.email}")

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                token_type="bearer",
                expires_in=get_token_expiration_seconds()
            )

        except AuthApiError as e:
            logger.error(f"Supabase Auth error during login: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during login"
            )

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        """
        Refresh access token using refresh token

        Args:
            refresh_token: Valid refresh token

        Returns:
            TokenResponse with new access_token and refresh_token

        Raises:
            HTTPException: If refresh token is invalid or expired (401)
        """
        try:
            auth_response = self.supabase.auth.refresh_session(refresh_token)

            if not auth_response.session:
                logger.warning("Token refresh failed: No session returned")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired refresh token"
                )

            logger.info("Token refreshed successfully")

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                token_type="bearer",
                expires_in=get_token_expiration_seconds()
            )

        except AuthApiError as e:
            logger.error(f"Supabase Auth error during token refresh: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during token refresh: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during token refresh"
            )

    async def get_current_user(self, access_token: str) -> UserProfile:
        """
        Get current user profile from access token

        Args:
            access_token: Valid JWT access token

        Returns:
            UserProfile with user data

        Raises:
            HTTPException: If token is invalid or user not found (401)
        """
        try:
            # Verify token and get user from Supabase Auth
            user_response = self.supabase.auth.get_user(access_token)

            if not user_response.user:
                logger.warning("Get current user failed: No user returned")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )

            # Fetch user profile from database
            profile_response = self.supabase.table('user_profiles') \
                .select('*') \
                .eq('id', user_response.user.id) \
                .single() \
                .execute()

            if not profile_response.data:
                logger.error(f"User profile not found for user {user_response.user.id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )

            return UserProfile(**profile_response.data)

        except AuthApiError as e:
            logger.error(f"Supabase Auth error getting current user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting current user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error retrieving user profile"
            )

    async def logout(self, access_token: str) -> Dict[str, str]:
        """
        Logout user (invalidate session)

        Note: Supabase handles session invalidation on the client side.
        This endpoint is provided for consistency with frontend expectations.

        Args:
            access_token: Valid JWT access token

        Returns:
            Success message

        Raises:
            HTTPException: If token is invalid (401)
        """
        try:
            # Sign out from Supabase
            self.supabase.auth.sign_out()
            logger.info("User logged out successfully")

            return {"message": "Logged out successfully"}

        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            # Don't fail logout even if there's an error
            return {"message": "Logged out successfully"}
