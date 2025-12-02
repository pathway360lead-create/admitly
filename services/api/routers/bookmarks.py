"""
Bookmarks Router
API endpoints for user bookmarks
"""
import logging
from fastapi import APIRouter, Depends, Query, Path, Body
from typing import List, Optional, Literal

from schemas.bookmarks import (
    BookmarkCreate,
    BookmarkUpdate,
    BookmarkResponse,
    BookmarkListResponse,
    BookmarkDeleteResponse,
    BookmarkBulkDelete,
    BookmarkBulkDeleteResponse,
    BookmarkCheckResponse,
)
from services.bookmark_service import BookmarkService
from core.dependencies import get_bookmark_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users/me/bookmarks",
    tags=["bookmarks"],
)


@router.get(
    "",
    response_model=BookmarkListResponse,
    summary="List user bookmarks",
    description="""
List all bookmarks for the authenticated user with optional filtering and pagination.

**Authentication Required:** JWT Bearer token

**Filters:**
- **entity_type**: Filter by entity type (institution, program, or all)
- **page**: Page number (default: 1)
- **page_size**: Items per page (default: 20, max: 100)
- **sort**: Sort field (created_at, name)
- **order**: Sort order (asc, desc)

**Response:**
Returns a paginated list of bookmarks with embedded entity details (program or institution info).
""",
)
async def list_bookmarks(
    entity_type: Optional[Literal["institution", "program", "all"]] = Query(
        "all",
        description="Filter by entity type"
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
    sort: str = Query(
        "created_at",
        description="Sort field",
        regex="^(created_at|name)$"
    ),
    order: str = Query(
        "desc",
        description="Sort order",
        regex="^(asc|desc)$"
    ),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    List user's bookmarks with pagination and filtering

    Returns bookmarks with full entity details (program/institution information).
    Only returns non-deleted bookmarks belonging to the authenticated user.
    """
    return await service.list_bookmarks(
        entity_type=entity_type,
        page=page,
        page_size=page_size,
        sort=sort,
        order=order
    )


@router.post(
    "",
    response_model=BookmarkResponse,
    status_code=201,
    summary="Create bookmark",
    description="""
Add a program or institution to user's bookmarks.

**Authentication Required:** JWT Bearer token

**Request Body:**
- **entity_type**: Type of entity (institution or program)
- **entity_id**: UUID of the entity to bookmark
- **notes**: Optional notes about the bookmark (max 500 chars)

**Validations:**
- Entity must exist in database
- Entity must be published (not deleted)
- Bookmark cannot be duplicate (same entity already bookmarked)

**Response:**
Returns the created bookmark with ID and timestamp.
""",
)
async def create_bookmark(
    bookmark_data: BookmarkCreate = Body(...),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    Create a new bookmark

    Validates that the entity exists before creating the bookmark.
    Returns 409 Conflict if bookmark already exists.
    """
    return await service.create_bookmark(bookmark_data)


@router.patch(
    "/{bookmark_id}",
    response_model=BookmarkResponse,
    summary="Update bookmark",
    description="""
Update notes for an existing bookmark.

**Authentication Required:** JWT Bearer token

**Path Parameter:**
- **bookmark_id**: UUID of the bookmark to update

**Request Body:**
- **notes**: Updated notes (max 500 chars, can be null to clear notes)

**Validations:**
- Bookmark must exist
- Bookmark must belong to authenticated user
- Bookmark must not be deleted

**Response:**
Returns the updated bookmark.
""",
)
async def update_bookmark(
    bookmark_id: str = Path(..., description="Bookmark ID to update"),
    update_data: BookmarkUpdate = Body(...),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    Update bookmark notes

    Only the notes field can be updated.
    Returns 404 if bookmark not found or doesn't belong to user.
    """
    return await service.update_bookmark(bookmark_id, update_data)


@router.delete(
    "/{bookmark_id}",
    response_model=BookmarkDeleteResponse,
    summary="Delete bookmark",
    description="""
Remove a bookmark from user's collection (soft delete).

**Authentication Required:** JWT Bearer token

**Path Parameter:**
- **bookmark_id**: UUID of the bookmark to delete

**Validations:**
- Bookmark must exist
- Bookmark must belong to authenticated user
- Bookmark must not already be deleted

**Response:**
Returns success message with deleted bookmark ID.

**Note:** This is a soft delete - the bookmark is marked as deleted but not removed from database.
""",
)
async def delete_bookmark(
    bookmark_id: str = Path(..., description="Bookmark ID to delete"),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    Delete a single bookmark (soft delete)

    Marks the bookmark as deleted without removing it from the database.
    Returns 404 if bookmark not found or doesn't belong to user.
    """
    return await service.delete_bookmark(bookmark_id)


@router.delete(
    "/bulk",
    response_model=BookmarkBulkDeleteResponse,
    summary="Bulk delete bookmarks",
    description="""
Delete multiple bookmarks at once (soft delete).

**Authentication Required:** JWT Bearer token

**Request Body:**
- **bookmark_ids**: Array of bookmark UUIDs to delete (min: 1, max: 50)

**Validations:**
- At least 1 bookmark ID required
- Maximum 50 bookmark IDs allowed
- Only bookmarks belonging to user will be deleted
- Already deleted bookmarks are ignored

**Response:**
Returns count of deleted bookmarks and list of deleted IDs.

**Note:** This endpoint will delete only the bookmarks that belong to the user.
If some IDs don't exist or don't belong to user, they are silently ignored.
""",
)
async def bulk_delete_bookmarks(
    delete_data: BookmarkBulkDelete = Body(...),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    Delete multiple bookmarks at once

    Soft deletes all specified bookmarks that belong to the user.
    Returns count of deleted items.
    """
    return await service.bulk_delete_bookmarks(delete_data.bookmark_ids)


@router.get(
    "/check",
    response_model=BookmarkCheckResponse,
    summary="Check bookmark status",
    description="""
Check if specific entities are bookmarked by the user.

**Authentication Required:** JWT Bearer token

**Query Parameters:**
- **entity_type**: Type of entities to check (institution or program)
- **entity_ids**: Comma-separated list of entity UUIDs (max 100)

**Use Case:**
This endpoint is useful for UI components that need to show bookmark status
for multiple items (e.g., list of programs showing which ones are bookmarked).

**Response:**
Returns a mapping of entity_id to bookmark status:
- **is_bookmarked**: Boolean indicating if entity is bookmarked
- **bookmark_id**: UUID of bookmark if bookmarked, null otherwise

**Example:**
GET /api/v1/users/me/bookmarks/check?entity_type=program&entity_ids=uuid1,uuid2,uuid3
""",
)
async def check_bookmarks(
    entity_type: Literal["institution", "program"] = Query(
        ...,
        description="Type of entities to check"
    ),
    entity_ids: str = Query(
        ...,
        description="Comma-separated list of entity UUIDs (max 100)",
        max_length=5000
    ),
    service: BookmarkService = Depends(get_bookmark_service)
):
    """
    Check which entities are bookmarked

    Returns bookmark status for multiple entities in a single request.
    Useful for showing bookmark indicators in lists of programs/institutions.
    """
    # Parse comma-separated entity IDs
    ids_list = [id.strip() for id in entity_ids.split(",") if id.strip()]

    # Limit to 100 IDs
    if len(ids_list) > 100:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 100 entity IDs allowed"
        )

    if not ids_list:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one entity_id required"
        )

    return await service.check_bookmarks(entity_type, ids_list)
