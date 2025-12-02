"""
Bookmark Schemas
Pydantic models for bookmarks endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


class BookmarkCreate(BaseModel):
    """Schema for creating a new bookmark"""
    entity_type: Literal["program", "institution"] = Field(
        ...,
        description="Type of entity to bookmark"
    )
    entity_id: str = Field(
        ...,
        description="UUID of the program or institution"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional notes about the bookmark"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "entity_type": "program",
                    "entity_id": "650e8400-e29b-41d4-a716-446655440002",
                    "notes": "Interested - need to check cutoff scores"
                }
            ]
        }
    }


class BookmarkUpdate(BaseModel):
    """Schema for updating bookmark notes"""
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Updated notes for the bookmark"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "notes": "Updated notes - talked to current students, sounds great!"
                }
            ]
        }
    }


class BookmarkBase(BaseModel):
    """Base bookmark response"""
    id: str = Field(..., description="Bookmark UUID")
    entity_type: str = Field(..., description="Type of bookmarked entity")
    entity_id: str = Field(..., description="ID of bookmarked entity")
    notes: Optional[str] = Field(None, description="User notes")
    created_at: datetime = Field(..., description="When bookmark was created")


class BookmarkResponse(BookmarkBase):
    """Detailed bookmark response without entity details"""
    pass


class BookmarkWithEntity(BookmarkBase):
    """Bookmark response with entity details"""
    entity: Optional[Dict[str, Any]] = Field(
        None,
        description="Details of the bookmarked entity (program or institution)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440001",
                    "entity_type": "program",
                    "entity_id": "650e8400-e29b-41d4-a716-446655440002",
                    "notes": "Interested - need to check cutoff scores",
                    "created_at": "2025-01-10T14:30:00Z",
                    "entity": {
                        "id": "650e8400-e29b-41d4-a716-446655440002",
                        "name": "Computer Engineering",
                        "slug": "computer-engineering",
                        "institution": {
                            "id": "750e8400-e29b-41d4-a716-446655440003",
                            "name": "University of Lagos",
                            "slug": "university-of-lagos",
                            "state": "Lagos"
                        },
                        "degree_type": "undergraduate",
                        "duration_years": 5.0
                    }
                }
            ]
        }
    }


class BookmarkListResponse(BaseModel):
    """Paginated list of bookmarks"""
    data: List[BookmarkWithEntity] = Field(..., description="List of bookmarks")
    pagination: Dict[str, Any] = Field(..., description="Pagination metadata")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "data": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440001",
                            "entity_type": "program",
                            "entity_id": "650e8400-e29b-41d4-a716-446655440002",
                            "notes": "Interested program",
                            "created_at": "2025-01-10T14:30:00Z",
                            "entity": {
                                "id": "650e8400-e29b-41d4-a716-446655440002",
                                "name": "Computer Engineering"
                            }
                        }
                    ],
                    "pagination": {
                        "page": 1,
                        "page_size": 20,
                        "total": 12,
                        "total_pages": 1,
                        "has_prev": False,
                        "has_next": False
                    }
                }
            ]
        }
    }


class BookmarkDeleteResponse(BaseModel):
    """Response for bookmark deletion"""
    message: str = Field(..., description="Success message")
    deleted_id: str = Field(..., description="ID of deleted bookmark")


class BookmarkBulkDelete(BaseModel):
    """Schema for bulk delete request"""
    bookmark_ids: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of bookmark IDs to delete (max 50)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "bookmark_ids": [
                        "550e8400-e29b-41d4-a716-446655440001",
                        "550e8400-e29b-41d4-a716-446655440004"
                    ]
                }
            ]
        }
    }


class BookmarkBulkDeleteResponse(BaseModel):
    """Response for bulk delete operation"""
    message: str = Field(..., description="Success message")
    deleted_count: int = Field(..., description="Number of bookmarks deleted")
    deleted_ids: List[str] = Field(..., description="IDs of deleted bookmarks")


class BookmarkCheckStatus(BaseModel):
    """Status for a single entity"""
    is_bookmarked: bool = Field(..., description="Whether entity is bookmarked")
    bookmark_id: Optional[str] = Field(None, description="Bookmark ID if bookmarked")


class BookmarkCheckResponse(BaseModel):
    """Response for bookmark check"""
    bookmarks: Dict[str, BookmarkCheckStatus] = Field(
        ...,
        description="Mapping of entity_id to bookmark status"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "bookmarks": {
                        "650e8400-e29b-41d4-a716-446655440002": {
                            "is_bookmarked": True,
                            "bookmark_id": "550e8400-e29b-41d4-a716-446655440001"
                        },
                        "750e8400-e29b-41d4-a716-446655440003": {
                            "is_bookmarked": False,
                            "bookmark_id": None
                        }
                    }
                }
            ]
        }
    }
