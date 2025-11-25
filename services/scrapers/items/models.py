"""
Pydantic models for scraped data validation.

These models define the schema for data scraped from institution websites.
All models include validation rules and match the database schema in
specs/database-schema.md.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from enum import Enum


# ============================================================================
# Enums for validation
# ============================================================================

class InstitutionType(str, Enum):
    """Valid institution types"""
    FEDERAL_UNIVERSITY = "federal_university"
    STATE_UNIVERSITY = "state_university"
    PRIVATE_UNIVERSITY = "private_university"
    POLYTECHNIC = "polytechnic"
    COLLEGE_OF_EDUCATION = "college_of_education"
    SPECIALIZED = "specialized"
    JUPEB_CENTER = "jupeb_center"


class DegreeType(str, Enum):
    """Valid degree types"""
    UNDERGRADUATE = "undergraduate"
    ND = "nd"
    HND = "hnd"
    PRE_DEGREE = "pre_degree"
    JUPEB = "jupeb"
    DIPLOMA = "diploma"
    CERTIFICATE = "certificate"


class AccreditationStatus(str, Enum):
    """Valid accreditation statuses"""
    FULLY_ACCREDITED = "fully_accredited"
    PROVISIONALLY_ACCREDITED = "provisionally_accredited"
    NOT_ACCREDITED = "not_accredited"
    PENDING = "pending"


class ProgramMode(str, Enum):
    """Valid program delivery modes"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    ONLINE = "online"
    HYBRID = "hybrid"


# ============================================================================
# Nigerian States (for validation)
# ============================================================================

NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
]


# ============================================================================
# Institution Item
# ============================================================================

class InstitutionItem(BaseModel):
    """
    Data model for scraped institution profile.

    Matches public.institutions table schema in database-schema.md.
    """
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "name": "University of Lagos",
                "short_name": "UNILAG",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Akoka",
                "website": "https://unilag.edu.ng",
                "email": "info@unilag.edu.ng",
                "phone": "+234-1-4932396",
                "description": "Premier university in Nigeria...",
                "founded_year": 1962,
                "source_url": "https://unilag.edu.ng/about",
                "scrape_timestamp": "2025-01-11T10:00:00Z"
            }
        }
    )

    # Core fields
    name: str = Field(..., min_length=3, max_length=200, description="Official institution name")
    short_name: Optional[str] = Field(None, max_length=20, description="Acronym (e.g., UNILAG)")
    type: InstitutionType = Field(..., description="Type of institution")

    # Location (required)
    state: str = Field(..., description="Nigerian state")
    city: Optional[str] = Field(None, max_length=100, description="City/Town")
    address: Optional[str] = Field(None, description="Full address")
    lga: Optional[str] = Field(None, max_length=100, description="Local Government Area")

    # Contact
    website: Optional[str] = Field(None, description="Official website URL")
    email: Optional[str] = Field(None, description="Primary email address")
    phone: Optional[str] = Field(None, description="Primary phone number")
    social_media: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Social media links (facebook, twitter, instagram, linkedin)"
    )

    # Details
    description: Optional[str] = Field(None, description="Institution overview/about text")
    founded_year: Optional[int] = Field(None, ge=1800, le=2030, description="Year founded")
    logo_url: Optional[str] = Field(None, description="URL to institution logo")

    # Accreditation
    accreditation_status: Optional[AccreditationStatus] = Field(None, description="Accreditation status")
    accreditation_body: Optional[str] = Field(None, description="Accrediting body (e.g., NUC, NBTE)")

    # Scraping metadata (required)
    source_url: str = Field(..., description="URL where data was scraped from")
    scrape_timestamp: datetime = Field(default_factory=datetime.now, description="When data was scraped")
    content_hash: Optional[str] = Field(None, description="Hash for deduplication (auto-generated)")

    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        """Ensure state is a valid Nigerian state"""
        if v not in NIGERIAN_STATES:
            raise ValueError(f"Invalid Nigerian state: {v}. Must be one of {NIGERIAN_STATES}")
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Basic email validation"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v

    @field_validator('website')
    @classmethod
    def validate_website(cls, v: Optional[str]) -> Optional[str]:
        """Ensure website is a valid URL"""
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('Website must be a valid URL starting with http:// or https://')
        return v


# ============================================================================
# Program Item
# ============================================================================

class ProgramItem(BaseModel):
    """
    Data model for scraped program information.

    Matches public.programs table schema in database-schema.md.
    """
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "institution_name": "University of Lagos",
                "name": "Computer Science",
                "degree_type": "undergraduate",
                "qualification": "BSc",
                "field_of_study": "Science",
                "specialization": "Computer Science",
                "duration_years": 4.0,
                "mode": "full_time",
                "source_url": "https://unilag.edu.ng/programmes/computer-science"
            }
        }
    )

    # Institution reference
    institution_name: str = Field(..., description="Name of institution offering program")
    institution_id: Optional[str] = Field(None, description="UUID of institution if known")

    # Core fields
    name: str = Field(..., min_length=3, max_length=200, description="Program name")
    degree_type: DegreeType = Field(..., description="Type of degree/qualification")
    qualification: Optional[str] = Field(None, max_length=50, description="Qualification awarded (e.g., BSc, BA, ND)")

    # Classification
    field_of_study: Optional[str] = Field(None, max_length=100, description="Broad field (e.g., Engineering, Medicine)")
    specialization: Optional[str] = Field(None, max_length=100, description="Specific specialization")

    # Program details
    duration_years: Optional[float] = Field(None, ge=0.5, le=10.0, description="Duration in years")
    duration_text: Optional[str] = Field(None, description="Duration as text (e.g., '4 years')")
    mode: Optional[ProgramMode] = Field(None, description="Delivery mode")
    curriculum_summary: Optional[str] = Field(None, description="Program overview/curriculum")

    # Accreditation
    accreditation_status: Optional[AccreditationStatus] = Field(None, description="Program accreditation status")
    accreditation_body: Optional[str] = Field(None, description="Accrediting body")

    # Requirements (optional, can be scraped separately)
    min_utme_score: Optional[int] = Field(None, ge=0, le=400, description="Minimum UTME score")
    utme_subjects: Optional[List[str]] = Field(default_factory=list, description="Required UTME subjects")
    required_olevel_subjects: Optional[List[str]] = Field(default_factory=list, description="Required O'Level subjects")

    # Capacity
    annual_intake: Optional[int] = Field(None, ge=0, description="Number of students admitted per year")

    # Scraping metadata (required)
    source_url: str = Field(..., description="URL where data was scraped from")
    scrape_timestamp: datetime = Field(default_factory=datetime.now, description="When data was scraped")
    content_hash: Optional[str] = Field(None, description="Hash for deduplication")


# ============================================================================
# Application Window Item
# ============================================================================

class ApplicationWindowItem(BaseModel):
    """
    Data model for scraped application deadline information.

    Matches public.application_windows table schema.
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    # Institution/Program reference
    institution_name: str = Field(..., description="Name of institution")
    institution_id: Optional[str] = Field(None, description="UUID of institution if known")
    program_name: Optional[str] = Field(None, description="Specific program (if program-level)")
    program_id: Optional[str] = Field(None, description="UUID of program if known")
    level: str = Field(..., pattern="^(institution|program)$", description="institution or program level")

    # Window details
    academic_year: str = Field(..., description="Academic year (e.g., 2024/2025)")
    intake_type: Optional[str] = Field(None, description="main, supplementary, or direct_entry")

    # Dates (at least start and end required)
    application_start_date: Optional[datetime] = Field(None, description="When applications open")
    application_end_date: Optional[datetime] = Field(None, description="Application deadline")
    screening_date: Optional[datetime] = Field(None, description="Post-UTME/screening date")
    admission_list_date: Optional[datetime] = Field(None, description="When admission list is released")

    # Links
    application_portal_url: Optional[str] = Field(None, description="Link to application portal")
    information_url: Optional[str] = Field(None, description="Link to more information")

    # Scraping metadata
    source_url: str = Field(..., description="URL where data was scraped from")
    scrape_timestamp: datetime = Field(default_factory=datetime.now, description="When data was scraped")


# ============================================================================
# Cost/Fees Item
# ============================================================================

class CostItem(BaseModel):
    """
    Data model for scraped tuition and fees information.

    Matches public.costs table schema.
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    # Institution/Program reference
    institution_name: str = Field(..., description="Name of institution")
    institution_id: Optional[str] = Field(None, description="UUID of institution if known")
    program_name: Optional[str] = Field(None, description="Specific program (if program-level)")
    program_id: Optional[str] = Field(None, description="UUID of program if known")
    level: str = Field(..., pattern="^(institution|program)$", description="institution or program level")

    # Fee details
    fee_type: str = Field(
        ...,
        description="Type of fee (tuition, acceptance, registration, etc.)"
    )
    fee_name: str = Field(..., description="Name of fee")
    amount_text: str = Field(..., description="Raw amount text scraped (e.g., 'N50,000', '₦50000')")
    amount_kobo: Optional[int] = Field(None, description="Amount in kobo (auto-calculated by pipeline)")
    currency: str = Field(default="NGN", description="Currency code")

    # Applicability
    academic_year: Optional[str] = Field(None, description="Academic year (e.g., 2024/2025)")
    student_category: Optional[str] = Field(None, description="e.g., new_student, returning_student")
    payment_frequency: Optional[str] = Field(None, description="one_time, per_semester, per_year")
    is_mandatory: bool = Field(default=True, description="Whether fee is mandatory")

    # Dates
    effective_date: Optional[datetime] = Field(None, description="When fee becomes effective")

    # Description
    description: Optional[str] = Field(None, description="Additional notes about the fee")

    # Scraping metadata
    source_url: str = Field(..., description="URL where data was scraped from")
    scrape_timestamp: datetime = Field(default_factory=datetime.now, description="When data was scraped")

    @field_validator('amount_text')
    @classmethod
    def validate_amount_text(cls, v: str) -> str:
        """Ensure amount text contains numeric data"""
        import re
        if not re.search(r'\d', v):
            raise ValueError('amount_text must contain at least one digit')
        return v


# ============================================================================
# Contact Item (Institution Contacts)
# ============================================================================

class ContactItem(BaseModel):
    """
    Data model for scraped institution contact information.

    Matches public.institution_contacts table schema.
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    # Institution reference
    institution_name: str = Field(..., description="Name of institution")
    institution_id: Optional[str] = Field(None, description="UUID of institution if known")

    # Contact details
    name: str = Field(..., min_length=2, description="Contact person name")
    role: Optional[str] = Field(None, description="Role/title (e.g., Admissions Officer)")
    department: Optional[str] = Field(None, description="Department")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    office_hours: Optional[str] = Field(None, description="Office hours")
    is_primary: bool = Field(default=False, description="Whether this is the primary contact")

    # Scraping metadata
    source_url: str = Field(..., description="URL where data was scraped from")
    scrape_timestamp: datetime = Field(default_factory=datetime.now, description="When data was scraped")

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Basic email validation"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v
