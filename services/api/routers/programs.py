"""
Programs Router
API endpoints for programs
"""
import logging
from fastapi import APIRouter, Depends, Query, Path
from typing import List, Optional

from schemas.programs import (
    ProgramResponse,
    ProgramListResponse,
    ProgramFilters,
)
from services.program_service import ProgramService
from core.dependencies import get_program_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get(
    "",
    response_model=ProgramListResponse,
    summary="List programs",
    description="""
List all published programs with optional filters.

**Filters:**
- **search**: Search by program name, field of study, or specialization (case-insensitive)
- **state**: Filter by institution state(s)
- **degree_type**: Filter by degree type (undergraduate, nd, hnd, pre_degree, jupeb, diploma, certificate)
- **field_of_study**: Filter by field of study (Engineering, Medicine, Arts, etc.)
- **mode**: Filter by mode (full_time, part_time, online, hybrid)
- **min_tuition**: Minimum tuition in kobo (optional - not implemented yet)
- **max_tuition**: Maximum tuition in kobo (optional - not implemented yet)
- **min_cutoff**: Minimum cutoff score (optional - not implemented yet)
- **max_cutoff**: Maximum cutoff score (optional - not implemented yet)
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)

**Response:**
Returns a paginated list of programs with metadata and institution information.
""",
)
async def list_programs(
    search: Optional[str] = Query(
        None,
        description="Search by program name, field of study, or specialization",
        example="Computer Science"
    ),
    state: Optional[List[str]] = Query(
        None,
        description="Filter by institution state(s)",
        example=["Lagos", "Ogun"]
    ),
    degree_type: Optional[List[str]] = Query(
        None,
        description="Filter by degree type(s)",
        example=["undergraduate", "hnd"]
    ),
    field_of_study: Optional[List[str]] = Query(
        None,
        description="Filter by field of study",
        example=["Engineering", "Medicine"]
    ),
    mode: Optional[List[str]] = Query(
        None,
        description="Filter by mode",
        example=["full_time", "part_time"]
    ),
    min_tuition: Optional[int] = Query(
        None,
        description="Minimum tuition in kobo (not implemented yet)"
    ),
    max_tuition: Optional[int] = Query(
        None,
        description="Maximum tuition in kobo (not implemented yet)"
    ),
    min_cutoff: Optional[float] = Query(
        None,
        description="Minimum cutoff score (not implemented yet)"
    ),
    max_cutoff: Optional[float] = Query(
        None,
        description="Maximum cutoff score (not implemented yet)"
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
    service: ProgramService = Depends(get_program_service)
):
    """
    List programs with filtering and pagination

    Only returns published, active, non-deleted programs.
    Results are ordered by program name (A-Z).
    Includes institution information (name, slug, state) for each program.
    """
    filters = ProgramFilters(
        search=search,
        state=state,
        degree_type=degree_type,
        field_of_study=field_of_study,
        mode=mode,
        min_tuition=min_tuition,
        max_tuition=max_tuition,
        min_cutoff=min_cutoff,
        max_cutoff=max_cutoff,
        page=page,
        page_size=page_size
    )

    return await service.list_programs(filters)


@router.get(
    "/{id}",
    response_model=ProgramResponse,
    summary="Get program by ID",
    description="""
Get detailed information about a specific program by its ID.

**Path Parameter:**
- **id**: Program UUID

**Response:**
Returns full program details including:
- Basic information (name, degree type, field of study)
- Institution information (name, slug, state)
- Duration and mode
- Accreditation information
- Curriculum summary
- Annual intake capacity

**Errors:**
- 404: Program not found or not published
- 500: Database error
""",
)
async def get_program(
    id: str = Path(
        ...,
        description="Program UUID",
        example="650e8400-e29b-41d4-a716-446655440001"
    ),
    service: ProgramService = Depends(get_program_service)
):
    """
    Get program details by ID

    Returns full program information including institution details,
    accreditation status, and curriculum information.
    """
    return await service.get_by_id(id)
