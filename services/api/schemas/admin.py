"""
Admin Schemas
Pydantic models for admin endpoints
"""
from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional
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


class InstitutionStatus(str, Enum):
    """Institution status enum"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Nigerian states validation
NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
]


class InstitutionCreateRequest(BaseModel):
    """Schema for creating a new institution"""
    name: str = Field(..., min_length=3, max_length=200, description="Institution name")
    short_name: Optional[str] = Field(None, max_length=50, description="Short name (e.g., UNILAG)")
    slug: Optional[str] = Field(None, max_length=100, description="URL-friendly identifier (auto-generated if not provided)")
    type: InstitutionType = Field(..., description="Institution type")
    state: str = Field(..., description="Nigerian state")
    city: str = Field(..., min_length=2, max_length=100, description="City location")

    # Optional details
    description: Optional[str] = Field(None, max_length=2000, description="Institution description")
    address: Optional[str] = Field(None, max_length=500, description="Physical address")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    email: Optional[str] = Field(None, max_length=100, description="Contact email")
    website: Optional[str] = Field(None, description="Official website")
    logo_url: Optional[str] = Field(None, description="Logo image URL")
    banner_url: Optional[str] = Field(None, description="Banner image URL")

    # Metadata
    year_established: Optional[int] = Field(None, ge=1800, le=2100, description="Year founded")
    accreditation_status: Optional[str] = Field(None, max_length=100, description="Accreditation status")
    verified: bool = Field(False, description="Verification status")
    status: InstitutionStatus = Field(InstitutionStatus.DRAFT, description="Publication status")

    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        """Validate state is a valid Nigerian state"""
        if v not in NIGERIAN_STATES:
            raise ValueError(f"State must be one of: {', '.join(NIGERIAN_STATES)}")
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Basic email validation"""
        if v and '@' not in v:
            raise ValueError("Invalid email format")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "University of Lagos",
                    "short_name": "UNILAG",
                    "type": "federal_university",
                    "state": "Lagos",
                    "city": "Lagos",
                    "description": "Premier university in Nigeria",
                    "address": "Akoka, Lagos",
                    "phone": "+234-1-4932043",
                    "email": "info@unilag.edu.ng",
                    "website": "https://unilag.edu.ng",
                    "year_established": 1962,
                    "accreditation_status": "Fully Accredited",
                    "verified": True,
                    "status": "published"
                }
            ]
        }
    }


class InstitutionUpdateRequest(BaseModel):
    """Schema for updating an existing institution"""
    name: Optional[str] = Field(None, min_length=3, max_length=200, description="Institution name")
    short_name: Optional[str] = Field(None, max_length=50, description="Short name")
    slug: Optional[str] = Field(None, max_length=100, description="URL-friendly identifier")
    type: Optional[InstitutionType] = Field(None, description="Institution type")
    state: Optional[str] = Field(None, description="Nigerian state")
    city: Optional[str] = Field(None, min_length=2, max_length=100, description="City location")

    # Optional details
    description: Optional[str] = Field(None, max_length=2000, description="Institution description")
    address: Optional[str] = Field(None, max_length=500, description="Physical address")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    email: Optional[str] = Field(None, max_length=100, description="Contact email")
    website: Optional[str] = Field(None, description="Official website")
    logo_url: Optional[str] = Field(None, description="Logo image URL")
    banner_url: Optional[str] = Field(None, description="Banner image URL")

    # Metadata
    year_established: Optional[int] = Field(None, ge=1800, le=2100, description="Year founded")
    accreditation_status: Optional[str] = Field(None, max_length=100, description="Accreditation status")
    verified: Optional[bool] = Field(None, description="Verification status")
    status: Optional[InstitutionStatus] = Field(None, description="Publication status")

    @field_validator('state')
    @classmethod
    def validate_state(cls, v: Optional[str]) -> Optional[str]:
        """Validate state is a valid Nigerian state"""
        if v and v not in NIGERIAN_STATES:
            raise ValueError(f"State must be one of: {', '.join(NIGERIAN_STATES)}")
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Basic email validation"""
        if v and '@' not in v:
            raise ValueError("Invalid email format")
        return v


class InstitutionAdminResponse(BaseModel):
    """Schema for admin institution response (includes all fields)"""
    id: str
    slug: str
    name: str
    short_name: Optional[str] = None
    type: str
    state: str
    city: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    year_established: Optional[int] = None
    accreditation_status: Optional[str] = None
    verified: bool
    status: str
    program_count: int = 0
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
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
                    "description": "Premier university in Nigeria",
                    "address": "Akoka, Lagos",
                    "phone": "+234-1-4932043",
                    "email": "info@unilag.edu.ng",
                    "website": "https://unilag.edu.ng",
                    "logo_url": "https://storage.supabase.co/logos/unilag.png",
                    "year_established": 1962,
                    "accreditation_status": "Fully Accredited",
                    "verified": True,
                    "status": "published",
                    "program_count": 120,
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-15T10:30:00Z",
                    "deleted_at": None
                }
            ]
        }
    }


class StatusUpdateRequest(BaseModel):
    """Schema for updating institution status"""
    status: InstitutionStatus = Field(..., description="New status")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"status": "published"},
                {"status": "draft"},
                {"status": "archived"}
            ]
        }
    }


# ==================== PROGRAM SCHEMAS ====================

class DegreeType(str, Enum):
    """Degree type enum"""
    UNDERGRADUATE = "undergraduate"
    ND = "nd"
    HND = "hnd"
    PRE_DEGREE = "pre_degree"
    JUPEB = "jupeb"
    POSTGRADUATE = "postgraduate"


class ProgramMode(str, Enum):
    """Program mode enum"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    ONLINE = "online"
    HYBRID = "hybrid"


class ProgramStatus(str, Enum):
    """Program status enum"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProgramCreateRequest(BaseModel):
    """Schema for creating a new program"""
    institution_id: str = Field(..., description="Institution UUID")
    name: str = Field(..., min_length=3, max_length=200, description="Program name")
    slug: Optional[str] = Field(None, max_length=100, description="URL-friendly identifier (auto-generated if not provided)")
    degree_type: DegreeType = Field(..., description="Degree type")
    duration_years: int = Field(..., ge=1, le=10, description="Program duration in years")
    mode: ProgramMode = Field(ProgramMode.FULL_TIME, description="Study mode")

    # Financial details
    tuition_per_year: int = Field(..., ge=0, description="Annual tuition fee in Naira")
    acceptance_fee: Optional[int] = Field(None, ge=0, description="One-time acceptance fee in Naira")

    # Academic details
    cutoff_score: Optional[int] = Field(None, ge=0, le=400, description="JAMB cutoff score")
    accreditation_status: Optional[str] = Field(None, max_length=100, description="Program accreditation status")
    description: Optional[str] = Field(None, max_length=2000, description="Program description")

    # Status
    status: ProgramStatus = Field(ProgramStatus.DRAFT, description="Publication status")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "institution_id": "550e8400-e29b-41d4-a716-446655440000",
                    "name": "Computer Science",
                    "degree_type": "undergraduate",
                    "duration_years": 4,
                    "mode": "full_time",
                    "tuition_per_year": 250000,
                    "acceptance_fee": 50000,
                    "cutoff_score": 250,
                    "accreditation_status": "Fully Accredited",
                    "description": "BSc in Computer Science with focus on software engineering",
                    "status": "published"
                }
            ]
        }
    }


class ProgramUpdateRequest(BaseModel):
    """Schema for updating an existing program"""
    institution_id: Optional[str] = Field(None, description="Institution UUID")
    name: Optional[str] = Field(None, min_length=3, max_length=200, description="Program name")
    slug: Optional[str] = Field(None, max_length=100, description="URL-friendly identifier")
    degree_type: Optional[DegreeType] = Field(None, description="Degree type")
    duration_years: Optional[int] = Field(None, ge=1, le=10, description="Program duration in years")
    mode: Optional[ProgramMode] = Field(None, description="Study mode")

    # Financial details
    tuition_per_year: Optional[int] = Field(None, ge=0, description="Annual tuition fee in Naira")
    acceptance_fee: Optional[int] = Field(None, ge=0, description="One-time acceptance fee in Naira")

    # Academic details
    cutoff_score: Optional[int] = Field(None, ge=0, le=400, description="JAMB cutoff score")
    accreditation_status: Optional[str] = Field(None, max_length=100, description="Program accreditation status")
    description: Optional[str] = Field(None, max_length=2000, description="Program description")

    # Status
    status: Optional[ProgramStatus] = Field(None, description="Publication status")


class ProgramAdminResponse(BaseModel):
    """Schema for admin program response (includes all fields)"""
    id: str
    institution_id: str
    slug: str
    name: str
    degree_type: str
    duration_years: int
    mode: str
    tuition_per_year: Optional[int] = None
    acceptance_fee: Optional[int] = None
    cutoff_score: Optional[int] = None
    accreditation_status: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    # Joined data
    institution: Optional[dict] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440001",
                    "institution_id": "550e8400-e29b-41d4-a716-446655440000",
                    "slug": "computer-science",
                    "name": "Computer Science",
                    "degree_type": "undergraduate",
                    "duration_years": 4,
                    "mode": "full_time",
                    "tuition_per_year": 250000,
                    "acceptance_fee": 50000,
                    "cutoff_score": 250,
                    "accreditation_status": "Fully Accredited",
                    "description": "BSc in Computer Science",
                    "status": "published",
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-15T10:30:00Z",
                    "deleted_at": None,
                    "institution": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "name": "University of Lagos",
                        "short_name": "UNILAG"
                    }
                }
            ]
        }
    }
