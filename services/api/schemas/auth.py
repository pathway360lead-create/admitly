"""
Authentication Schemas
Pydantic models for authentication endpoints
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class UserRegister(BaseModel):
    """
    User registration payload

    Password requirements (matching frontend validation):
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    email: EmailStr = Field(..., max_length=255, description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    role: str = Field(default="student", description="User role (student, counselor, institution_admin)")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Validate password meets security requirements
        Matches frontend validation in apps/web/src/lib/validation.ts
        """
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Validate role is one of allowed values"""
        allowed_roles = ['student', 'counselor', 'institution_admin']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "student@example.com",
                    "password": "SecurePass123!",
                    "full_name": "John Doe",
                    "role": "student"
                }
            ]
        }
    }


class UserLogin(BaseModel):
    """User login payload"""
    email: EmailStr = Field(..., max_length=255, description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "student@example.com",
                    "password": "SecurePass123!"
                }
            ]
        }
    }


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                    "expires_in": 3600
                }
            ]
        }
    }


class RefreshTokenRequest(BaseModel):
    """Refresh token request payload"""
    refresh_token: str = Field(..., description="Refresh token to exchange for new access token")


class UserProfile(BaseModel):
    """User profile response"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    full_name: str = Field(..., description="User's full name")
    role: str = Field(..., description="User role")
    subscription_status: str = Field(..., description="Subscription status (free, premium)")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")
    phone: Optional[str] = Field(None, description="User phone number")
    state: Optional[str] = Field(None, description="Nigerian state")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "student@example.com",
                    "full_name": "John Doe",
                    "role": "student",
                    "subscription_status": "free",
                    "created_at": "2025-01-19T10:00:00Z",
                    "updated_at": "2025-01-19T10:00:00Z",
                    "avatar_url": None,
                    "phone": None,
                    "state": "Lagos"
                }
            ]
        }
    }


class LogoutResponse(BaseModel):
    """Logout response"""
    message: str = Field(..., description="Success message")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "Logged out successfully"
                }
            ]
        }
    }
