"""
Authentication Router
FastAPI endpoints for user authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    UserProfile,
    LogoutResponse
)
from services.auth_service import AuthService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# HTTP Bearer security scheme for protected endpoints
security = HTTPBearer()

# Initialize auth service
auth_service = AuthService()


@router.post(
    "/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="""
    Register a new user account with email and password.

    **Password Requirements:**
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character

    **Returns:**
    - Access token (expires in 1 hour)
    - Refresh token (expires in 7 days)

    **Errors:**
    - 409: Email already registered
    - 422: Validation error (weak password, invalid email, etc.)
    """
)
async def register(user_data: UserRegister):
    """
    Register a new user account

    Creates user in Supabase Auth and user_profiles table.
    Returns access and refresh tokens for immediate authentication.
    """
    return await auth_service.register(user_data)


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Login user",
    description="""
    Authenticate user with email and password.

    **Returns:**
    - Access token (expires in 1 hour)
    - Refresh token (expires in 7 days)

    **Errors:**
    - 401: Invalid credentials
    """
)
async def login(credentials: UserLogin):
    """
    Login with email and password

    Validates credentials and returns JWT tokens for authentication.
    """
    return await auth_service.login(credentials)


@router.post(
    "/auth/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="""
    Exchange refresh token for new access token.

    Use this endpoint when the access token expires (after 1 hour).
    The refresh token is valid for 7 days.

    **Returns:**
    - New access token (expires in 1 hour)
    - New refresh token (expires in 7 days)

    **Errors:**
    - 401: Invalid or expired refresh token
    """
)
async def refresh_token(token_request: RefreshTokenRequest):
    """
    Refresh access token using refresh token

    Exchanges a valid refresh token for a new access token.
    Both tokens are rotated for security.
    """
    return await auth_service.refresh_token(token_request.refresh_token)


@router.get(
    "/auth/me",
    response_model=UserProfile,
    summary="Get current user",
    description="""
    Get authenticated user's profile information.

    **Requires:** Valid access token in Authorization header

    **Returns:**
    - User profile data (id, email, full_name, role, etc.)

    **Errors:**
    - 401: Invalid or expired token
    - 404: User profile not found
    """,
    dependencies=[Depends(security)]
)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get current authenticated user profile

    Retrieves user profile from database using access token.
    Token must be provided in Authorization header: "Bearer <token>"
    """
    token = credentials.credentials
    return await auth_service.get_current_user(token)


@router.post(
    "/auth/logout",
    response_model=LogoutResponse,
    summary="Logout user",
    description="""
    Logout user and invalidate session.

    **Requires:** Valid access token in Authorization header

    **Note:** Client should also clear tokens from local storage.

    **Returns:**
    - Success message
    """,
    dependencies=[Depends(security)]
)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Logout user (invalidate session)

    Supabase handles session invalidation on the client side.
    This endpoint is provided for consistency and logging purposes.
    """
    token = credentials.credentials
    return await auth_service.logout(token)


# Optional: Password reset endpoint (can be added later)
# @router.post("/auth/reset-password")
# async def reset_password(email: str):
#     """Send password reset email"""
#     pass


# Optional: Email verification endpoint (can be added later)
# @router.post("/auth/verify-email")
# async def verify_email(token: str):
#     """Verify email address"""
#     pass
