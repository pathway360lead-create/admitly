"""
Search Router
API endpoints for search operations
"""
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status

from schemas.search import (
    SearchParams,
    SearchResponse,
    SearchResults,
    SearchFilters,
    InstitutionSearchResult,
    ProgramSearchResult,
    AutocompleteParams,
    AutocompleteResponse,
    PaginationMetadata,
)
from services.search_service import SearchService
from core.dependencies import get_search_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    type: str = Query(
        default="all",
        description="Search type: all, institutions, or programs"
    ),
    # Institution filters
    institution_type: Optional[str] = Query(
        default=None,
        description="Comma-separated institution types"
    ),
    state: Optional[str] = Query(
        default=None,
        description="Comma-separated Nigerian states"
    ),
    verified: Optional[bool] = Query(
        default=None,
        description="Filter by verification status"
    ),
    # Program filters
    degree_type: Optional[str] = Query(
        default=None,
        description="Comma-separated degree types"
    ),
    field_of_study: Optional[str] = Query(
        default=None,
        description="Comma-separated fields of study"
    ),
    mode: Optional[str] = Query(
        default=None,
        description="Comma-separated program modes"
    ),
    min_tuition: Optional[int] = Query(
        default=None,
        description="Minimum tuition (Naira)"
    ),
    max_tuition: Optional[int] = Query(
        default=None,
        description="Maximum tuition (Naira)"
    ),
    min_cutoff: Optional[int] = Query(
        default=None,
        description="Minimum cutoff score"
    ),
    max_cutoff: Optional[int] = Query(
        default=None,
        description="Maximum cutoff score"
    ),
    # Pagination
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=50, description="Items per page (max 50)"),
    service: SearchService = Depends(get_search_service)
) -> SearchResponse:
    """
    Global search across institutions and programs

    Supports:
    - Typo-tolerant search (e.g., "Unilag" matches "UNILAG")
    - Multi-field search (name, description, state, etc.)
    - Advanced filtering (type, state, tuition, cutoff, etc.)
    - Pagination
    - Highlighted results

    **Examples:**
    - Search all: `/api/v1/search?q=computer`
    - Search institutions only: `/api/v1/search?q=lagos&type=institutions`
    - Search programs with filters: `/api/v1/search?q=engineering&type=programs&state=Lagos&min_tuition=100000`
    """
    try:
        # Validate type parameter
        if type not in ("all", "institutions", "programs"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid type. Must be 'all', 'institutions', or 'programs'"
            )

        # Parse comma-separated filters
        filters = SearchFilters(
            institution_type=institution_type.split(",") if institution_type else None,
            state=state.split(",") if state else None,
            verified=verified,
            degree_type=degree_type.split(",") if degree_type else None,
            field_of_study=field_of_study.split(",") if field_of_study else None,
            mode=mode.split(",") if mode else None,
            min_tuition=min_tuition,
            max_tuition=max_tuition,
            min_cutoff=min_cutoff,
            max_cutoff=max_cutoff,
        )

        # Build search params
        search_params = SearchParams(
            q=q,
            type=type,  # type: ignore
            filters=filters,
            page=page,
            page_size=page_size,
        )

        # Execute search
        results = await service.search_all(search_params)

        # Parse results
        institutions = [
            InstitutionSearchResult(**hit) for hit in results["institutions"]
        ]
        programs = [
            ProgramSearchResult(**hit) for hit in results["programs"]
        ]

        # Calculate pagination
        if type == "institutions":
            total = results["institutions_total"]
        elif type == "programs":
            total = results["programs_total"]
        else:  # all
            total = results["total_results"]

        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        pagination = PaginationMetadata(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
            has_prev=page > 1,
            has_next=page < total_pages
        )

        return SearchResponse(
            success=True,
            data=SearchResults(
                institutions=institutions,
                programs=programs,
                total_results=results["total_results"]
            ),
            pagination=pagination,
            query=q,
            search_time_ms=results["search_time_ms"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum results (max 50)"),
    service: SearchService = Depends(get_search_service)
) -> AutocompleteResponse:
    """
    Autocomplete search suggestions

    Returns quick suggestions for both institutions and programs
    to power search-as-you-type functionality.

    **Features:**
    - Fast response (< 50ms)
    - Typo-tolerant
    - Returns essential fields only
    - Split between institutions and programs

    **Example:**
    - `/api/v1/search/autocomplete?q=comp&limit=5`
    """
    try:
        # Execute autocomplete
        suggestions = await service.autocomplete(query=q, limit=limit)

        return AutocompleteResponse(
            success=True,
            data=suggestions,
            query=q
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in autocomplete endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Autocomplete failed: {str(e)}"
        )
