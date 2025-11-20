"""
Institution Schemas
Pydantic models for institutions endpoints
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum


class InstitutionType(str, Enum):
    """Institution type enum"""
    FEDERAL_UNIVERSITY = "federal_university"
    STATE_UNIVERSITY = "state_university"
    PRIVATE_UNIVERSITY = "private_university"
    POLYTECHNIC = "polytechnic"
    COLLEGE_OF_EDUCATION = "college_of_education"
    SPECIALIZED = "specialized"
    JUPEB_CENTER = "jupeb_center"


class InstitutionBase(BaseModel):
    """Base institution model for list view"""
    id: str = Field(..., description="Institution UUID")
    slug: str = Field(..., description="URL-friendly identifier")
    name: str = Field(..., description="Institution name")
    short_name: Optional[str] = Field(None, description="Short name (e.g., UNILAG)")
    type: str = Field(..., description="Institution type")
    state: str = Field(..., description="Nigerian state")
    city: str = Field(..., description="City location")
    logo_url: Optional[str] = Field(None, description="Logo image URL")
    website: Optional[str] = Field(None, description="Official website")
    verified: bool = Field(..., description="Verification status")
    program_count: int = Field(..., description="Number of programs offered")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "slug": "university-of-lagos",
                    "name": "University of Lagos",
                    "short_name": "UNILAG",
                    "type": "federal_university",
                    "state": "Lagos",
                    "city": "Lagos",
                    "logo_url": "https://storage.supabase.co/logos/unilag.png",
                    "website": "https://unilag.edu.ng",
                    "verified": True,
                    "program_count": 120
                }
            ]
        }
    }


class InstitutionResponse(InstitutionBase):
    """Detailed institution model"""
    description: Optional[str] = Field(None, description="Institution description")
    address: Optional[str] = Field(None, description="Physical address")
    phone: Optional[str] = Field(None, description="Contact phone number")
    email: Optional[str] = Field(None, description="Contact email")
    accreditation_status: Optional[str] = Field(None, description="Accreditation status")
    year_established: Optional[int] = Field(None, description="Year founded")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "slug": "university-of-lagos",
                    "name": "University of Lagos",
                    "short_name": "UNILAG",
                    "type": "federal_university",
                    "state": "Lagos",
                    "city": "Lagos",
                    "logo_url": "https://storage.supabase.co/logos/unilag.png",
                    "website": "https://unilag.edu.ng",
                    "verified": True,
                    "program_count": 120,
                    "description": "Premier federal university established in 1962",
                    "address": "Akoka, Yaba, Lagos",
                    "phone": "+234-1-4932396",
                    "email": "info@unilag.edu.ng",
                    "accreditation_status": "fully_accredited",
                    "year_established": 1962,
                    "created_at": "2025-01-01T00:00:00Z",
                    "updated_at": "2025-01-19T00:00:00Z"
                }
            ]
        }
    }


class InstitutionFilters(BaseModel):
    """Institution filter parameters"""
    search: Optional[str] = Field(None, description="Search by name or short_name")
    state: Optional[List[str]] = Field(None, description="Filter by state(s)")
    type: Optional[List[str]] = Field(None, description="Filter by institution type(s)")
    verified: Optional[bool] = Field(None, description="Filter by verification status")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "search": "computer science",
                    "state": ["Lagos", "Ogun"],
                    "type": ["federal_university", "state_university"],
                    "verified": True,
                    "page": 1,
                    "page_size": 20
                }
            ]
        }
    }


class PaginationMetadata(BaseModel):
    """Pagination metadata for list responses"""
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_prev: bool = Field(..., description="Has previous page")
    has_next: bool = Field(..., description="Has next page")


class InstitutionListResponse(BaseModel):
    """Institution list response with pagination"""
    data: List[InstitutionBase] = Field(..., description="List of institutions")
    pagination: PaginationMetadata = Field(..., description="Pagination metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "slug": "university-of-lagos",
                            "name": "University of Lagos",
                            "short_name": "UNILAG",
                            "type": "federal_university",
                            "state": "Lagos",
                            "city": "Lagos",
                            "logo_url": "https://storage.supabase.co/logos/unilag.png",
                            "website": "https://unilag.edu.ng",
                            "verified": True,
                            "program_count": 120
                        }
                    ],
                    "pagination": {
                        "page": 1,
                        "page_size": 20,
                        "total": 150,
                        "total_pages": 8,
                        "has_prev": False,
                        "has_next": True
                    }
                }
            ]
        }
    }
