"""
User Profile Schemas
Pydantic models for user profile endpoints
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any, Literal
from datetime import datetime


class NotificationPreferences(BaseModel):
    """User notification preferences"""
    email: Optional[bool] = Field(None, description="Email notifications enabled")
    push: Optional[bool] = Field(None, description="Push notifications enabled")
    deadline_alerts: Optional[bool] = Field(None, description="Application deadline alerts")
    new_programs: Optional[bool] = Field(None, description="New programs notifications")
    cost_changes: Optional[bool] = Field(None, description="Cost change alerts")


class SearchDefaults(BaseModel):
    """User search default preferences"""
    state: Optional[str] = Field(None, description="Default state filter")
    degree_type: Optional[str] = Field(None, description="Default degree type")
    sort_by: Optional[str] = Field(None, description="Default sort field")


class UserPreferences(BaseModel):
    """Complete user preferences structure"""
    theme: Optional[Literal["light", "dark", "system"]] = Field(None, description="UI theme preference")
    notifications: Optional[NotificationPreferences] = Field(None, description="Notification settings")
    search_defaults: Optional[SearchDefaults] = Field(None, description="Default search filters")


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="User's full name")
    phone_number: Optional[str] = Field(None, max_length=20, description="Phone number")
    state: Optional[str] = Field(None, max_length=50, description="State of residence")
    lga: Optional[str] = Field(None, max_length=100, description="Local Government Area")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "full_name": "John Doe Updated",
                    "phone_number": "+2348098765432",
                    "state": "Ogun",
                    "lga": "Ijebu Ode"
                }
            ]
        }
    }


class UserPreferencesUpdate(UserPreferences):
    """Schema for updating user preferences"""
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "theme": "dark",
                    "notifications": {
                        "email": True,
                        "push": False,
                        "deadline_alerts": True,
                        "new_programs": True,
                        "cost_changes": False
                    },
                    "search_defaults": {
                        "state": "Lagos",
                        "degree_type": "undergraduate",
                        "sort_by": "relevance"
                    }
                }
            ]
        }
    }


class UserProfileResponse(BaseModel):
    """Complete user profile response"""
    id: str = Field(..., description="User UUID")
    email: EmailStr = Field(..., description="User email")
    full_name: str = Field(..., description="Full name")
    phone_number: Optional[str] = Field(None, description="Phone number")
    state: Optional[str] = Field(None, description="State")
    lga: Optional[str] = Field(None, description="LGA")
    role: str = Field(..., description="User role")
    subscription_status: Optional[str] = Field(None, description="Subscription status")
    subscription_tier: Optional[str] = Field(None, description="Subscription tier")
    subscription_start_date: Optional[datetime] = Field(None, description="Subscription start")
    subscription_end_date: Optional[datetime] = Field(None, description="Subscription end")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "850e8400-e29b-41d4-a716-446655440020",
                    "email": "student@example.com",
                    "full_name": "John Doe",
                    "phone_number": "+2348012345678",
                    "state": "Lagos",
                    "lga": "Ikeja",
                    "role": "premium",
                    "subscription_status": "active",
                    "subscription_tier": "monthly",
                    "subscription_start_date": "2025-01-01T00:00:00Z",
                    "subscription_end_date": "2025-02-01T00:00:00Z",
                    "preferences": {
                        "theme": "light",
                        "notifications": {
                            "email": True,
                            "push": True,
                            "deadline_alerts": True
                        }
                    },
                    "metadata": {
                        "onboarding_completed": True,
                        "last_login": "2025-01-10T14:00:00Z"
                    },
                    "created_at": "2024-12-15T10:00:00Z",
                    "updated_at": "2025-01-10T14:00:00Z"
                }
            ]
        }
    }


class UserPreferencesResponse(BaseModel):
    """Response for preferences update"""
    id: str = Field(..., description="User UUID")
    preferences: Dict[str, Any] = Field(..., description="Updated preferences")
    updated_at: datetime = Field(..., description="Update timestamp")


class AccountDeleteRequest(BaseModel):
    """Request body for account deletion"""
    confirmation: str = Field(..., description="Must be 'DELETE' to confirm")
    reason: Optional[str] = Field(None, max_length=500, description="Deletion reason")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "confirmation": "DELETE",
                    "reason": "No longer needed"
                }
            ]
        }
    }


class AccountDeleteResponse(BaseModel):
    """Response for account deletion"""
    message: str = Field(..., description="Success message")
    deleted_at: datetime = Field(..., description="Deletion timestamp")
