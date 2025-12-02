"""
Saved Searches Schemas
Pydantic models for saved searches endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SavedSearchFilters(BaseModel):
    """Valid filter keys for saved searches"""
    state: Optional[List[str]] = Field(None, description="Filter by state(s)")
    type: Optional[List[str]] = Field(None, description="Filter by institution type(s)")
    degree_type: Optional[List[str]] = Field(None, description="Filter by degree type(s)")
    field_of_study: Optional[List[str]] = Field(None, description="Filter by field of study")
    mode: Optional[List[str]] = Field(None, description="Filter by mode (full_time, part_time, etc.)")
    min_tuition: Optional[int] = Field(None, description="Minimum tuition in kobo")
    max_tuition: Optional[int] = Field(None, description="Maximum tuition in kobo")
    min_cutoff: Optional[float] = Field(None, description="Minimum cutoff score")
    max_cutoff: Optional[float] = Field(None, description="Maximum cutoff score")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "state": ["Lagos", "Ogun"],
                    "degree_type": ["undergraduate"],
                    "field_of_study": ["Computer Science"],
                    "min_tuition": 5000000,
                    "max_tuition": 100000000
                }
            ]
        }
    }


class SavedSearchCreate(BaseModel):
    """Schema for creating a new saved search"""
    name: str = Field(..., min_length=3, max_length=100, description="User-defined name")
    query: str = Field(..., min_length=1, max_length=200, description="Search query string")
    filters: Optional[SavedSearchFilters] = Field(None, description="Search filters")
    notify_on_new_results: Optional[bool] = Field(False, description="Enable notifications")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Computer Science in Lagos",
                    "query": "computer science",
                    "filters": {
                        "state": ["Lagos"],
                        "degree_type": ["undergraduate"],
                        "field_of_study": ["Computer Science"]
                    },
                    "notify_on_new_results": True
                }
            ]
        }
    }


class SavedSearchUpdate(BaseModel):
    """Schema for updating a saved search"""
    name: Optional[str] = Field(None, min_length=3, max_length=100, description="Updated name")
    filters: Optional[SavedSearchFilters] = Field(None, description="Updated filters")
    notify_on_new_results: Optional[bool] = Field(None, description="Updated notification setting")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Computer Science Programs in Lagos (Updated)",
                    "filters": {
                        "state": ["Lagos", "Ogun"],
                        "degree_type": ["undergraduate"]
                    },
                    "notify_on_new_results": False
                }
            ]
        }
    }


class SavedSearchResponse(BaseModel):
    """Saved search response"""
    id: str = Field(..., description="Saved search UUID")
    name: str = Field(..., description="Name of the saved search")
    query: str = Field(..., description="Search query")
    filters: Dict[str, Any] = Field(..., description="Search filters")
    notify_on_new_results: bool = Field(..., description="Notification setting")
    last_notified_at: Optional[datetime] = Field(None, description="Last notification timestamp")
    execution_count: int = Field(..., description="Number of times executed")
    last_executed_at: Optional[datetime] = Field(None, description="Last execution timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "450e8400-e29b-41d4-a716-446655440010",
                    "name": "Computer Science in Lagos",
                    "query": "computer science",
                    "filters": {
                        "state": ["Lagos"],
                        "degree_type": ["undergraduate"],
                        "field_of_study": ["Computer Science"]
                    },
                    "notify_on_new_results": True,
                    "last_notified_at": "2025-01-09T08:00:00Z",
                    "execution_count": 15,
                    "last_executed_at": "2025-01-10T14:30:00Z",
                    "created_at": "2025-01-05T10:00:00Z",
                    "updated_at": "2025-01-10T14:30:00Z"
                }
            ]
        }
    }


class SavedSearchListResponse(BaseModel):
    """Paginated list of saved searches"""
    data: List[SavedSearchResponse] = Field(..., description="List of saved searches")
    pagination: Dict[str, Any] = Field(..., description="Pagination metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": [
                        {
                            "id": "450e8400-e29b-41d4-a716-446655440010",
                            "name": "Computer Science in Lagos",
                            "query": "computer science",
                            "filters": {"state": ["Lagos"]},
                            "notify_on_new_results": True,
                            "execution_count": 15,
                            "last_executed_at": "2025-01-10T14:30:00Z",
                            "created_at": "2025-01-05T10:00:00Z",
                            "updated_at": "2025-01-10T14:30:00Z"
                        }
                    ],
                    "pagination": {
                        "page": 1,
                        "page_size": 20,
                        "total": 5,
                        "total_pages": 1,
                        "has_prev": False,
                        "has_next": False
                    }
                }
            ]
        }
    }


class SavedSearchDeleteResponse(BaseModel):
    """Response for saved search deletion"""
    message: str = Field(..., description="Success message")
    deleted_id: str = Field(..., description="ID of deleted saved search")


class SavedSearchExecuteResponse(BaseModel):
    """Response for executing a saved search"""
    saved_search: Dict[str, Any] = Field(..., description="Saved search details")
    results: Dict[str, Any] = Field(..., description="Search results with pagination")
    execution_metadata: Dict[str, Any] = Field(..., description="Execution metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "saved_search": {
                        "id": "450e8400-e29b-41d4-a716-446655440010",
                        "name": "Computer Science in Lagos",
                        "query": "computer science",
                        "filters": {"state": ["Lagos"], "degree_type": ["undergraduate"]}
                    },
                    "results": {
                        "data": [
                            {
                                "id": "650e8400-e29b-41d4-a716-446655440002",
                                "name": "Computer Science",
                                "institution": {
                                    "name": "University of Lagos",
                                    "state": "Lagos"
                                },
                                "degree_type": "undergraduate"
                            }
                        ],
                        "pagination": {
                            "page": 1,
                            "page_size": 20,
                            "total": 15,
                            "total_pages": 1,
                            "has_prev": False,
                            "has_next": False
                        }
                    },
                    "execution_metadata": {
                        "executed_at": "2025-01-10T15:30:00Z",
                        "execution_count": 16
                    }
                }
            ]
        }
    }
