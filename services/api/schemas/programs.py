"""
Program Schemas
Pydantic models for programs endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProgramBase(BaseModel):
    """Base program model for list view"""

    id: str = Field(..., description="Program UUID")
    slug: str = Field(..., description="URL-friendly identifier")
    name: str = Field(..., description="Program name")
    institution_id: str = Field(..., description="Institution UUID")
    institution_name: str = Field(..., description="Institution name")
    institution_slug: str = Field(..., description="Institution slug")
    institution_state: str = Field(..., description="Institution state")
    degree_type: str = Field(..., description="Degree type (undergraduate, nd, hnd, etc.)")
    qualification: Optional[str] = Field(None, description="Qualification (BSc, BA, ND, HND, etc.)")
    field_of_study: Optional[str] = Field(None, description="Field of study (Engineering, Medicine, etc.)")
    specialization: Optional[str] = Field(None, description="Specialization")
    duration_years: Optional[float] = Field(None, description="Duration in years")
    mode: Optional[str] = Field(None, description="Mode (full_time, part_time, online, hybrid)")
    accreditation_status: Optional[str] = Field(None, description="Accreditation status")
    is_active: bool = Field(..., description="Program is accepting students")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "650e8400-e29b-41d4-a716-446655440001",
                    "slug": "computer-engineering",
                    "name": "Computer Engineering",
                    "institution_id": "550e8400-e29b-41d4-a716-446655440000",
                    "institution_name": "University of Lagos",
                    "institution_slug": "university-of-lagos",
                    "institution_state": "Lagos",
                    "degree_type": "undergraduate",
                    "qualification": "BEng",
                    "field_of_study": "Engineering",
                    "specialization": "Computer Engineering",
                    "duration_years": 5.0,
                    "mode": "full_time",
                    "accreditation_status": "fully_accredited",
                    "is_active": True
                }
            ]
        }
    }


class ProgramResponse(ProgramBase):
    """Detailed program model with all fields"""

    curriculum_summary: Optional[str] = Field(None, description="Curriculum overview")
    annual_intake: Optional[int] = Field(None, description="Annual student intake")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "650e8400-e29b-41d4-a716-446655440001",
                    "slug": "computer-engineering",
                    "name": "Computer Engineering",
                    "institution_id": "550e8400-e29b-41d4-a716-446655440000",
                    "institution_name": "University of Lagos",
                    "institution_slug": "university-of-lagos",
                    "institution_state": "Lagos",
                    "degree_type": "undergraduate",
                    "qualification": "BEng",
                    "field_of_study": "Engineering",
                    "specialization": "Computer Engineering",
                    "duration_years": 5.0,
                    "mode": "full_time",
                    "accreditation_status": "fully_accredited",
                    "is_active": True,
                    "curriculum_summary": "Comprehensive engineering program covering hardware and software",
                    "annual_intake": 100,
                    "created_at": "2025-01-01T00:00:00Z",
                    "updated_at": "2025-01-19T00:00:00Z"
                }
            ]
        }
    }


class ProgramFilters(BaseModel):
    """Program filter parameters"""

    search: Optional[str] = Field(None, description="Search by program name or field of study")
    state: Optional[List[str]] = Field(None, description="Filter by institution state(s)")
    degree_type: Optional[List[str]] = Field(None, description="Filter by degree type(s)")
    field_of_study: Optional[List[str]] = Field(None, description="Filter by field of study")
    mode: Optional[List[str]] = Field(None, description="Filter by mode (full_time, part_time, etc.)")
    min_tuition: Optional[int] = Field(None, description="Minimum tuition (in kobo)")
    max_tuition: Optional[int] = Field(None, description="Maximum tuition (in kobo)")
    min_cutoff: Optional[float] = Field(None, description="Minimum cutoff score")
    max_cutoff: Optional[float] = Field(None, description="Maximum cutoff score")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "search": "computer",
                    "state": ["Lagos", "Ogun"],
                    "degree_type": ["undergraduate"],
                    "field_of_study": ["Engineering"],
                    "mode": ["full_time"],
                    "min_tuition": 10000000,
                    "max_tuition": 100000000,
                    "min_cutoff": 200.0,
                    "max_cutoff": 300.0,
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


class ProgramListResponse(BaseModel):
    """Program list response with pagination"""

    data: List[ProgramBase] = Field(..., description="List of programs")
    pagination: PaginationMetadata = Field(..., description="Pagination metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": [
                        {
                            "id": "650e8400-e29b-41d4-a716-446655440001",
                            "slug": "computer-engineering",
                            "name": "Computer Engineering",
                            "institution_id": "550e8400-e29b-41d4-a716-446655440000",
                            "institution_name": "University of Lagos",
                            "institution_slug": "university-of-lagos",
                            "institution_state": "Lagos",
                            "degree_type": "undergraduate",
                            "qualification": "BEng",
                            "field_of_study": "Engineering",
                            "specialization": "Computer Engineering",
                            "duration_years": 5.0,
                            "mode": "full_time",
                            "accreditation_status": "fully_accredited",
                            "is_active": True
                        }
                    ],
                    "pagination": {
                        "page": 1,
                        "page_size": 20,
                        "total": 50,
                        "total_pages": 3,
                        "has_prev": False,
                        "has_next": True
                    }
                }
            ]
        }
    }
