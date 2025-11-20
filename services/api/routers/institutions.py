"""
Institutions Router
API endpoints for institutions
"""
import logging
from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional

from schemas.institutions import (
    InstitutionResponse,
    InstitutionListResponse,
    InstitutionFilters,
)
from schemas.programs import ProgramListResponse
from services.institution_service import InstitutionService
from core.dependencies import get_institution_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/institutions", tags=["institutions"])


@router.get(
    "",
    response_model=InstitutionListResponse,
    summary="List institutions",
    description="""
List all published institutions with optional filters.

**Filters:**
- **search**: Search by institution name or short name (case-insensitive)
- **state**: Filter by one or more Nigerian states
- **type**: Filter by institution type (federal_university, state_university, etc.)
- **verified**: Filter by verification status
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)

**Response:**
Returns a paginated list of institutions with metadata.
""",
)
async def list_institutions(
    search: Optional[str] = Query(
        None,
        description="Search by institution name or short name",
        example="Lagos"
    ),
    state: Optional[List[str]] = Query(
        None,
        description="Filter by Nigerian state(s)",
        example=["Lagos", "Ogun"]
    ),
    type: Optional[List[str]] = Query(
        None,
        description="Filter by institution type(s)",
        example=["federal_university", "state_university"]
    ),
    verified: Optional[bool] = Query(
        None,
        description="Filter by verification status"
    ),
    page: int = Query(
        1,
        ge=1,
        description="Page number"
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=100,
        description="Items per page"
    ),
    service: InstitutionService = Depends(get_institution_service)
):
    """
    List institutions with filtering and pagination

    Only returns published, non-deleted institutions.
    Results are ordered by institution name (A-Z).
    """
    filters = InstitutionFilters(
        search=search,
        state=state,
        type=type,
        verified=verified,
        page=page,
        page_size=page_size
    )

    return await service.list_institutions(filters)


@router.get(
    "/{slug}",
    response_model=InstitutionResponse,
    summary="Get institution by slug",
    description="""
Get detailed information about a specific institution by its slug.

**Path Parameter:**
- **slug**: URL-friendly institution identifier (e.g., 'university-of-lagos')

**Response:**
Returns full institution details including:
- Basic information (name, type, location)
- Contact details (address, phone, email)
- Accreditation information
- Website and social media links
- Verification status

**Errors:**
- 404: Institution not found or not published
- 500: Database error
""",
)
async def get_institution(
    slug: str = Path(
        ...,
        description="Institution slug (URL-friendly identifier)",
        example="university-of-lagos"
    ),
    service: InstitutionService = Depends(get_institution_service)
):
    """
    Get institution details by slug

    Returns full institution information including contact details,
    accreditation status, and verification information.
    """
    return await service.get_by_slug(slug)


@router.get(
    "/{slug}/programs",
    response_model=dict,
    summary="Get institution programs",
    description="""
Get all programs offered by a specific institution.

**Path Parameter:**
- **slug**: Institution slug (URL-friendly identifier)

**Query Parameters:**
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)

**Response:**
Returns a paginated list of programs offered by the institution,
ordered by program name.

**Errors:**
- 404: Institution not found or not published
- 500: Database error
""",
)
async def get_institution_programs(
    slug: str = Path(
        ...,
        description="Institution slug",
        example="university-of-lagos"
    ),
    page: int = Query(
        1,
        ge=1,
        description="Page number"
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=100,
        description="Items per page"
    ),
    service: InstitutionService = Depends(get_institution_service)
):
    """
    Get programs for an institution

    Returns all published programs offered by the specified institution.
    Results are paginated and ordered by program name.
    """
    return await service.get_programs(slug, page, page_size)
