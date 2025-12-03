"""
Search History Router
API endpoints for user search history
"""
import logging
from fastapi import APIRouter, Depends, Query

from schemas.search_history import (
    SearchHistoryListResponse,
    SearchHistoryClearResponse,
    SearchHistoryAnalytics,
)
from services.search_history_service import SearchHistoryService
from core.dependencies import get_search_history_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users/me/search-history",
    tags=["search-history"],
)


@router.get(
    "",
    response_model=SearchHistoryListResponse,
    summary="List search history",
    description="""
Get user's recent search queries with pagination.

**Authentication Required:** JWT Bearer token

**Query Parameters:**
- **limit**: Max results to return (default: 50, min: 1, max: 100)
- **offset**: Number of items to skip (default: 0, min: 0)

**Response:**
Returns list of search history entries ordered by most recent first.
Each entry includes:
- query: Search query string
- filters: Applied filters (state, type, etc.)
- results_count: Number of results returned
- created_at: Search timestamp

**Use Cases:**
- Display recent searches in UI
- Allow users to re-run previous searches
- Track user search behavior
- Populate search suggestions

**Pagination:**
Use limit and offset for pagination:
- Page 1: offset=0, limit=50
- Page 2: offset=50, limit=50
- Page 3: offset=100, limit=50

**Error Responses:**
- 401: Invalid or missing JWT token
- 500: Failed to retrieve history
""",
)
async def list_search_history(
    limit: int = Query(
        50,
        ge=1,
        le=100,
        description="Max results to return"
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of items to skip"
    ),
    service: SearchHistoryService = Depends(get_search_history_service)
):
    """
    List user's search history with pagination

    Returns searches ordered by most recent first.
    Soft-deleted entries are excluded.
    """
    return await service.list_search_history(limit=limit, offset=offset)


@router.delete(
    "",
    response_model=SearchHistoryClearResponse,
    summary="Clear search history",
    description="""
Delete all search history for the authenticated user (soft delete).

**Authentication Required:** JWT Bearer token

**Response:**
Returns success message with count of deleted entries.

**Business Logic:**
- Soft deletes all search history entries
- Sets deleted_at timestamp on all records
- Does NOT delete from database (allows recovery if needed)
- Returns count of deleted entries

**Use Cases:**
- User wants to clear their search history
- Privacy concerns
- Fresh start for analytics

**Note:** This action cannot be undone from the user perspective,
but records remain in database with deleted_at timestamp for analytics/audit.

**Error Responses:**
- 401: Invalid or missing JWT token
- 500: Failed to clear history
""",
)
async def clear_search_history(
    service: SearchHistoryService = Depends(get_search_history_service)
):
    """
    Clear all search history (soft delete)

    Soft deletes all entries for the authenticated user.
    Returns count of deleted entries.
    """
    return await service.clear_search_history()


@router.get(
    "/analytics",
    response_model=SearchHistoryAnalytics,
    summary="Get search analytics",
    description="""
Get analytics about user's search behavior and patterns.

**Authentication Required:** JWT Bearer token

**Response:**
Returns comprehensive analytics including:
- **total_searches**: Total number of searches performed
- **unique_queries**: Number of unique search queries
- **top_queries**: Top 10 most frequent queries with counts
- **top_filters**: Most used filter values (state, degree_type, etc.)
- **date_range**: First and last search timestamps

**Use Cases:**
- Display user search insights
- Personalized recommendations based on search patterns
- Understand user preferences
- Improve search relevance

**Example Analytics:**
```json
{
  "total_searches": 127,
  "unique_queries": 45,
  "top_queries": [
    {"query": "computer science", "count": 12},
    {"query": "engineering", "count": 8}
  ],
  "top_filters": {
    "state": {"Lagos": 67, "Ogun": 23},
    "degree_type": {"undergraduate": 98, "hnd": 15}
  },
  "date_range": {
    "first_search": "2024-12-20T10:00:00Z",
    "last_search": "2025-01-10T14:30:00Z"
  }
}
```

**Privacy Note:**
Analytics are calculated only from user's own search history.
No cross-user data is included.

**Error Responses:**
- 401: Invalid or missing JWT token
- 500: Failed to calculate analytics
""",
)
async def get_search_analytics(
    service: SearchHistoryService = Depends(get_search_history_service)
):
    """
    Get search history analytics

    Returns aggregated statistics about user's search patterns.
    Useful for personalization and insights.
    """
    return await service.get_search_analytics()
