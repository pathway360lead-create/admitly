"""
Saved Searches Router
API endpoints for user saved searches
"""
import logging
from fastapi import APIRouter, Depends, Query, Path, Body

from schemas.saved_searches import (
    SavedSearchCreate,
    SavedSearchUpdate,
    SavedSearchResponse,
    SavedSearchListResponse,
    SavedSearchDeleteResponse,
    SavedSearchExecuteResponse,
)
from services.saved_search_service import SavedSearchService
from core.dependencies import get_saved_search_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users/me/saved-searches",
    tags=["saved-searches"],
)


@router.get(
    "",
    response_model=SavedSearchListResponse,
    summary="List saved searches",
    description="""
List all saved searches for the authenticated user with pagination and sorting.

**Authentication Required:** JWT Bearer token

**Query Parameters:**
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)
- **sort**: Sort field (created_at, updated_at, execution_count, name)
- **order**: Sort order (asc, desc)

**Response:**
Returns a paginated list of saved searches with execution metadata.
""",
)
async def list_saved_searches(
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
    sort: str = Query(
        "updated_at",
        description="Sort field",
        regex="^(created_at|updated_at|execution_count|name)$"
    ),
    order: str = Query(
        "desc",
        description="Sort order",
        regex="^(asc|desc)$"
    ),
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    List user's saved searches with pagination and sorting

    Returns all saved searches belonging to the authenticated user.
    Soft-deleted searches are excluded from results.
    """
    return await service.list_saved_searches(
        page=page,
        page_size=page_size,
        sort=sort,
        order=order
    )


@router.post(
    "",
    response_model=SavedSearchResponse,
    status_code=201,
    summary="Create saved search",
    description="""
Save a search query with filters for later use and optional notifications.

**Authentication Required:** JWT Bearer token

**Request Body:**
- **name**: User-defined name (3-100 chars)
- **query**: Search query string (1-200 chars)
- **filters**: Optional search filters (state, type, degree_type, etc.)
- **notify_on_new_results**: Enable notifications for new results (default: false)

**Valid Filter Keys:**
- state: array of strings
- type: array of strings (institution types)
- degree_type: array of strings
- field_of_study: array of strings
- mode: array of strings (full_time, part_time, etc.)
- min_tuition: integer (kobo)
- max_tuition: integer (kobo)
- min_cutoff: number
- max_cutoff: number

**Response:**
Returns the created saved search with initial execution count of 0.
""",
)
async def create_saved_search(
    search_data: SavedSearchCreate = Body(...),
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    Create a new saved search

    Saves a search query with filters for quick re-execution.
    execution_count starts at 0 and is incremented each time the search is executed.
    """
    return await service.create_saved_search(search_data)


@router.get(
    "/{saved_search_id}",
    response_model=SavedSearchResponse,
    summary="Get saved search details",
    description="""
Get details of a specific saved search.

**Authentication Required:** JWT Bearer token

**Path Parameters:**
- **saved_search_id**: UUID of the saved search

**Response:**
Returns complete details including execution metadata.

**Error Responses:**
- 404: Saved search not found or doesn't belong to user
- 401: Invalid or missing JWT token
""",
)
async def get_saved_search(
    saved_search_id: str = Path(..., description="Saved search ID"),
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    Get details of a specific saved search

    Returns saved search with all metadata including execution count and timestamps.
    """
    return await service.get_saved_search(saved_search_id)


@router.patch(
    "/{saved_search_id}",
    response_model=SavedSearchResponse,
    summary="Update saved search",
    description="""
Update a saved search (name, filters, or notification settings).

**Authentication Required:** JWT Bearer token

**Path Parameters:**
- **saved_search_id**: UUID of the saved search to update

**Request Body:**
All fields are optional. Only provided fields will be updated.
- **name**: Updated name (3-100 chars)
- **filters**: Updated search filters
- **notify_on_new_results**: Updated notification setting

**Note:** The query field cannot be updated. Create a new saved search if you need a different query.

**Response:**
Returns the updated saved search.

**Error Responses:**
- 404: Saved search not found
- 401: Invalid or missing JWT token
""",
)
async def update_saved_search(
    saved_search_id: str = Path(..., description="Saved search ID to update"),
    update_data: SavedSearchUpdate = Body(...),
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    Update saved search settings

    Only the provided fields will be updated. The query field is immutable.
    """
    return await service.update_saved_search(saved_search_id, update_data)


@router.delete(
    "/{saved_search_id}",
    response_model=SavedSearchDeleteResponse,
    summary="Delete saved search",
    description="""
Delete a saved search (soft delete).

**Authentication Required:** JWT Bearer token

**Path Parameters:**
- **saved_search_id**: UUID of the saved search to delete

**Response:**
Returns success message with deleted ID.

**Note:** This is a soft delete - the record is marked as deleted but not removed from database.

**Error Responses:**
- 404: Saved search not found
- 401: Invalid or missing JWT token
""",
)
async def delete_saved_search(
    saved_search_id: str = Path(..., description="Saved search ID to delete"),
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    Delete a saved search (soft delete)

    Marks the saved search as deleted without removing it from the database.
    """
    return await service.delete_saved_search(saved_search_id)


@router.post(
    "/{saved_search_id}/execute",
    response_model=SavedSearchExecuteResponse,
    summary="Execute saved search",
    description="""
Run a saved search and get current results.

**Authentication Required:** JWT Bearer token

**Path Parameters:**
- **saved_search_id**: UUID of the saved search to execute

**Query Parameters:**
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)

**Business Logic:**
- Increments execution_count by 1
- Updates last_executed_at timestamp
- Returns results matching the saved query and filters

**Response:**
Returns:
- saved_search: Details of the executed search
- results: Search results with pagination
- execution_metadata: Execution timestamp and count

**Use Case:**
This endpoint is useful for:
- Quick re-running of frequent searches
- Tracking search usage patterns
- Building search history analytics

**Error Responses:**
- 404: Saved search not found
- 401: Invalid or missing JWT token
- 500: Search execution failed
""",
)
async def execute_saved_search(
    saved_search_id: str = Path(..., description="Saved search ID to execute"),
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
    service: SavedSearchService = Depends(get_saved_search_service)
):
    """
    Execute a saved search and return results

    Runs the saved search query with filters and returns paginated results.
    Automatically increments execution_count and updates last_executed_at.
    """
    return await service.execute_saved_search(
        search_id=saved_search_id,
        page=page,
        page_size=page_size
    )
