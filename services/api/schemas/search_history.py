"""
Search History Schemas
Pydantic models for search history endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class SearchHistoryEntry(BaseModel):
    """Single search history entry"""
    id: str = Field(..., description="Search history entry UUID")
    query: str = Field(..., description="Search query string")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Applied filters")
    results_count: Optional[int] = Field(None, description="Number of results returned")
    created_at: datetime = Field(..., description="Search timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "350e8400-e29b-41d4-a716-446655440030",
                    "query": "computer science",
                    "filters": {
                        "state": ["Lagos"],
                        "degree_type": ["undergraduate"]
                    },
                    "results_count": 15,
                    "created_at": "2025-01-10T14:30:00Z"
                }
            ]
        }
    }


class SearchHistoryListResponse(BaseModel):
    """Paginated search history response"""
    data: List[SearchHistoryEntry] = Field(..., description="List of search history entries")
    total: int = Field(..., description="Total number of entries")
    limit: int = Field(..., description="Max results returned")
    offset: int = Field(..., description="Number of items skipped")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": [
                        {
                            "id": "350e8400-e29b-41d4-a716-446655440030",
                            "query": "computer science",
                            "filters": {"state": ["Lagos"]},
                            "results_count": 15,
                            "created_at": "2025-01-10T14:30:00Z"
                        }
                    ],
                    "total": 127,
                    "limit": 50,
                    "offset": 0
                }
            ]
        }
    }


class SearchHistoryClearResponse(BaseModel):
    """Response for clearing search history"""
    message: str = Field(..., description="Success message")
    deleted_count: int = Field(..., description="Number of entries deleted")


class TopQuery(BaseModel):
    """Top search query statistics"""
    query: str = Field(..., description="Search query")
    count: int = Field(..., description="Number of times searched")


class SearchHistoryAnalytics(BaseModel):
    """Search history analytics and statistics"""
    total_searches: int = Field(..., description="Total number of searches")
    unique_queries: int = Field(..., description="Number of unique queries")
    top_queries: List[TopQuery] = Field(..., description="Most frequent queries")
    top_filters: Dict[str, Dict[str, int]] = Field(
        default_factory=dict,
        description="Most used filter values"
    )
    date_range: Dict[str, datetime] = Field(..., description="First and last search dates")

    model_config = {
        "json_schema_extra": {
            "examples": [
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
            ]
        }
    }
