"""
Bookmark Service
Business logic for user bookmarks
"""
import logging
from typing import List, Dict, Any, Optional, Literal
from supabase import Client
from fastapi import HTTPException, status

from schemas.bookmarks import (
    BookmarkCreate,
    BookmarkUpdate,
    BookmarkResponse,
    BookmarkWithEntity,
    BookmarkListResponse,
    BookmarkDeleteResponse,
    BookmarkBulkDeleteResponse,
    BookmarkCheckStatus,
    BookmarkCheckResponse,
)

logger = logging.getLogger(__name__)


class BookmarkService:
    """Service for managing user bookmarks"""

    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    async def list_bookmarks(
        self,
        entity_type: Optional[Literal["institution", "program", "all"]] = "all",
        page: int = 1,
        page_size: int = 20,
        sort: str = "created_at",
        order: str = "desc",
    ) -> BookmarkListResponse:
        """List user's bookmarks with pagination and filtering"""
        try:
            # Build query
            query = (
                self.supabase.table("user_bookmarks")
                .select(
                    "id, entity_type, entity_id, notes, created_at",
                    count="exact"
                )
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
            )

            # Filter by entity type if specified
            if entity_type and entity_type != "all":
                query = query.eq("entity_type", entity_type)

            # Get total count for pagination
            count_result = query.execute()
            total = count_result.count if count_result.count is not None else 0

            # Apply sorting
            query = query.order(sort, desc=(order == "desc"))

            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)

            # Execute query
            response = query.execute()

            # Fetch entity details for each bookmark
            bookmarks_with_entities = []
            for bookmark in response.data:
                entity_details = await self._get_entity_details(
                    bookmark["entity_type"],
                    bookmark["entity_id"]
                )

                bookmarks_with_entities.append(
                    BookmarkWithEntity(
                        id=bookmark["id"],
                        entity_type=bookmark["entity_type"],
                        entity_id=bookmark["entity_id"],
                        notes=bookmark.get("notes"),
                        created_at=bookmark["created_at"],
                        entity=entity_details,
                    )
                )

            # Build pagination metadata
            total_pages = (total + page_size - 1) // page_size
            pagination = {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
                "has_prev": page > 1,
                "has_next": page < total_pages,
            }

            return BookmarkListResponse(
                data=bookmarks_with_entities,
                pagination=pagination
            )

        except Exception as e:
            logger.error(f"Error listing bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to list bookmarks"
            )

    async def create_bookmark(
        self, bookmark_data: BookmarkCreate
    ) -> BookmarkResponse:
        """Create a new bookmark"""
        try:
            # Verify entity exists
            entity_exists = await self._verify_entity_exists(
                bookmark_data.entity_type,
                bookmark_data.entity_id
            )

            if not entity_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{bookmark_data.entity_type.capitalize()} not found"
                )

            # Check if bookmark already exists
            existing = (
                self.supabase.table("user_bookmarks")
                .select("id")
                .eq("user_id", self.user_id)
                .eq("entity_type", bookmark_data.entity_type)
                .eq("entity_id", bookmark_data.entity_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if existing.data:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bookmark already exists"
                )

            # Create bookmark
            response = (
                self.supabase.table("user_bookmarks")
                .insert({
                    "user_id": self.user_id,
                    "entity_type": bookmark_data.entity_type,
                    "entity_id": bookmark_data.entity_id,
                    "notes": bookmark_data.notes,
                })
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create bookmark"
                )

            bookmark = response.data[0]
            return BookmarkResponse(
                id=bookmark["id"],
                entity_type=bookmark["entity_type"],
                entity_id=bookmark["entity_id"],
                notes=bookmark.get("notes"),
                created_at=bookmark["created_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bookmark"
            )

    async def update_bookmark(
        self, bookmark_id: str, update_data: BookmarkUpdate
    ) -> BookmarkResponse:
        """Update bookmark notes"""
        try:
            # Verify bookmark exists and belongs to user
            existing = (
                self.supabase.table("user_bookmarks")
                .select("*")
                .eq("id", bookmark_id)
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bookmark not found"
                )

            # Update bookmark
            response = (
                self.supabase.table("user_bookmarks")
                .update({"notes": update_data.notes})
                .eq("id", bookmark_id)
                .eq("user_id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update bookmark"
                )

            bookmark = response.data[0]
            return BookmarkResponse(
                id=bookmark["id"],
                entity_type=bookmark["entity_type"],
                entity_id=bookmark["entity_id"],
                notes=bookmark.get("notes"),
                created_at=bookmark["created_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update bookmark"
            )

    async def delete_bookmark(self, bookmark_id: str) -> BookmarkDeleteResponse:
        """Delete a single bookmark (soft delete)"""
        try:
            # Verify bookmark exists and belongs to user
            existing = (
                self.supabase.table("user_bookmarks")
                .select("id")
                .eq("id", bookmark_id)
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bookmark not found"
                )

            # Soft delete bookmark
            from datetime import datetime, timezone
            response = (
                self.supabase.table("user_bookmarks")
                .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", bookmark_id)
                .eq("user_id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete bookmark"
                )

            return BookmarkDeleteResponse(
                message="Bookmark deleted successfully",
                deleted_id=bookmark_id
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete bookmark"
            )

    async def bulk_delete_bookmarks(
        self, bookmark_ids: List[str]
    ) -> BookmarkBulkDeleteResponse:
        """Delete multiple bookmarks at once"""
        try:
            # Verify all bookmarks belong to user
            existing = (
                self.supabase.table("user_bookmarks")
                .select("id")
                .eq("user_id", self.user_id)
                .in_("id", bookmark_ids)
                .is_("deleted_at", "null")
                .execute()
            )

            found_ids = [item["id"] for item in existing.data]

            if not found_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No bookmarks found to delete"
                )

            # Soft delete bookmarks
            from datetime import datetime, timezone
            response = (
                self.supabase.table("user_bookmarks")
                .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
                .eq("user_id", self.user_id)
                .in_("id", found_ids)
                .execute()
            )

            return BookmarkBulkDeleteResponse(
                message="Bookmarks deleted successfully",
                deleted_count=len(found_ids),
                deleted_ids=found_ids
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error bulk deleting bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete bookmarks"
            )

    async def check_bookmarks(
        self, entity_type: str, entity_ids: List[str]
    ) -> BookmarkCheckResponse:
        """Check which entities are bookmarked"""
        try:
            # Query bookmarks for these entities
            response = (
                self.supabase.table("user_bookmarks")
                .select("id, entity_id")
                .eq("user_id", self.user_id)
                .eq("entity_type", entity_type)
                .in_("entity_id", entity_ids)
                .is_("deleted_at", "null")
                .execute()
            )

            # Build bookmark status map
            bookmarked = {
                item["entity_id"]: item["id"] for item in response.data
            }

            bookmarks = {}
            for entity_id in entity_ids:
                if entity_id in bookmarked:
                    bookmarks[entity_id] = BookmarkCheckStatus(
                        is_bookmarked=True,
                        bookmark_id=bookmarked[entity_id]
                    )
                else:
                    bookmarks[entity_id] = BookmarkCheckStatus(
                        is_bookmarked=False,
                        bookmark_id=None
                    )

            return BookmarkCheckResponse(bookmarks=bookmarks)

        except Exception as e:
            logger.error(f"Error checking bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to check bookmarks"
            )

    async def _verify_entity_exists(
        self, entity_type: str, entity_id: str
    ) -> bool:
        """Verify that a program or institution exists"""
        try:
            table = "programs" if entity_type == "program" else "institutions"

            response = (
                self.supabase.table(table)
                .select("id")
                .eq("id", entity_id)
                .eq("status", "published")
                .is_("deleted_at", "null")
                .execute()
            )

            return len(response.data) > 0

        except Exception as e:
            logger.error(f"Error verifying entity exists: {e}")
            return False

    async def _get_entity_details(
        self, entity_type: str, entity_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get details of a bookmarked entity"""
        try:
            if entity_type == "program":
                response = (
                    self.supabase.table("programs")
                    .select(
                        "id, name, slug, degree_type, duration_years, "
                        "tuition_min, tuition_max, "
                        "institution:institution_id(id, name, slug, state)"
                    )
                    .eq("id", entity_id)
                    .eq("status", "published")
                    .is_("deleted_at", "null")
                    .execute()
                )

                if response.data:
                    program = response.data[0]
                    return {
                        "id": program["id"],
                        "name": program["name"],
                        "slug": program["slug"],
                        "degree_type": program.get("degree_type"),
                        "duration_years": program.get("duration_years"),
                        "tuition_range": {
                            "min": program.get("tuition_min"),
                            "max": program.get("tuition_max")
                        },
                        "institution": program.get("institution")
                    }

            else:  # institution
                response = (
                    self.supabase.table("institutions")
                    .select(
                        "id, name, slug, short_name, type, state, "
                        "logo_url, program_count"
                    )
                    .eq("id", entity_id)
                    .eq("status", "published")
                    .is_("deleted_at", "null")
                    .execute()
                )

                if response.data:
                    return response.data[0]

            return None

        except Exception as e:
            logger.error(f"Error getting entity details: {e}")
            return None
