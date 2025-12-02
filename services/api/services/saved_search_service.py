"""
Saved Search Service
Business logic for user saved searches
"""
import logging
from typing import List, Dict, Any, Optional
from supabase import Client
from fastapi import HTTPException, status
from datetime import datetime, timezone

from schemas.saved_searches import (
    SavedSearchCreate,
    SavedSearchUpdate,
    SavedSearchResponse,
    SavedSearchListResponse,
    SavedSearchDeleteResponse,
    SavedSearchExecuteResponse,
)

logger = logging.getLogger(__name__)


class SavedSearchService:
    """Service for managing user saved searches"""

    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    async def list_saved_searches(
        self,
        page: int = 1,
        page_size: int = 20,
        sort: str = "updated_at",
        order: str = "desc",
    ) -> SavedSearchListResponse:
        """List user's saved searches with pagination"""
        try:
            # Build query
            query = (
                self.supabase.table("user_saved_searches")
                .select("*", count="exact")
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
            )

            # Get total count
            count_result = query.execute()
            total = count_result.count if count_result.count is not None else 0

            # Apply sorting
            query = query.order(sort, desc=(order == "desc"))

            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)

            # Execute query
            response = query.execute()

            # Convert to response models
            saved_searches = [
                SavedSearchResponse(
                    id=item["id"],
                    name=item["name"],
                    query=item["query"],
                    filters=item.get("filters", {}),
                    notify_on_new_results=item.get("notify_on_new_results", False),
                    last_notified_at=item.get("last_notified_at"),
                    execution_count=item.get("execution_count", 0),
                    last_executed_at=item.get("last_executed_at"),
                    created_at=item["created_at"],
                    updated_at=item["updated_at"],
                )
                for item in response.data
            ]

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

            return SavedSearchListResponse(data=saved_searches, pagination=pagination)

        except Exception as e:
            logger.error(f"Error listing saved searches: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to list saved searches"
            )

    async def create_saved_search(
        self, search_data: SavedSearchCreate
    ) -> SavedSearchResponse:
        """Create a new saved search"""
        try:
            # Prepare filters (convert Pydantic model to dict, filter out None values)
            filters = {}
            if search_data.filters:
                filters = {
                    k: v
                    for k, v in search_data.filters.model_dump().items()
                    if v is not None
                }

            # Create saved search
            response = (
                self.supabase.table("user_saved_searches")
                .insert({
                    "user_id": self.user_id,
                    "name": search_data.name,
                    "query": search_data.query,
                    "filters": filters,
                    "notify_on_new_results": search_data.notify_on_new_results or False,
                    "execution_count": 0,
                })
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create saved search"
                )

            item = response.data[0]
            return SavedSearchResponse(
                id=item["id"],
                name=item["name"],
                query=item["query"],
                filters=item.get("filters", {}),
                notify_on_new_results=item.get("notify_on_new_results", False),
                last_notified_at=item.get("last_notified_at"),
                execution_count=item.get("execution_count", 0),
                last_executed_at=item.get("last_executed_at"),
                created_at=item["created_at"],
                updated_at=item["updated_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating saved search: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create saved search"
            )

    async def get_saved_search(self, search_id: str) -> SavedSearchResponse:
        """Get a saved search by ID"""
        try:
            response = (
                self.supabase.table("user_saved_searches")
                .select("*")
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Saved search not found"
                )

            item = response.data[0]
            return SavedSearchResponse(
                id=item["id"],
                name=item["name"],
                query=item["query"],
                filters=item.get("filters", {}),
                notify_on_new_results=item.get("notify_on_new_results", False),
                last_notified_at=item.get("last_notified_at"),
                execution_count=item.get("execution_count", 0),
                last_executed_at=item.get("last_executed_at"),
                created_at=item["created_at"],
                updated_at=item["updated_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting saved search: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get saved search"
            )

    async def update_saved_search(
        self, search_id: str, update_data: SavedSearchUpdate
    ) -> SavedSearchResponse:
        """Update a saved search"""
        try:
            # Verify saved search exists and belongs to user
            existing = (
                self.supabase.table("user_saved_searches")
                .select("*")
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Saved search not found"
                )

            # Build update data (only include provided fields)
            update_fields = {}

            if update_data.name is not None:
                update_fields["name"] = update_data.name

            if update_data.filters is not None:
                filters = {
                    k: v
                    for k, v in update_data.filters.model_dump().items()
                    if v is not None
                }
                update_fields["filters"] = filters

            if update_data.notify_on_new_results is not None:
                update_fields["notify_on_new_results"] = update_data.notify_on_new_results

            if not update_fields:
                # Nothing to update, return existing
                item = existing.data[0]
                return SavedSearchResponse(
                    id=item["id"],
                    name=item["name"],
                    query=item["query"],
                    filters=item.get("filters", {}),
                    notify_on_new_results=item.get("notify_on_new_results", False),
                    last_notified_at=item.get("last_notified_at"),
                    execution_count=item.get("execution_count", 0),
                    last_executed_at=item.get("last_executed_at"),
                    created_at=item["created_at"],
                    updated_at=item["updated_at"],
                )

            # Update saved search
            response = (
                self.supabase.table("user_saved_searches")
                .update(update_fields)
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update saved search"
                )

            item = response.data[0]
            return SavedSearchResponse(
                id=item["id"],
                name=item["name"],
                query=item["query"],
                filters=item.get("filters", {}),
                notify_on_new_results=item.get("notify_on_new_results", False),
                last_notified_at=item.get("last_notified_at"),
                execution_count=item.get("execution_count", 0),
                last_executed_at=item.get("last_executed_at"),
                created_at=item["created_at"],
                updated_at=item["updated_at"],
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating saved search: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update saved search"
            )

    async def delete_saved_search(self, search_id: str) -> SavedSearchDeleteResponse:
        """Delete a saved search (soft delete)"""
        try:
            # Verify saved search exists and belongs to user
            existing = (
                self.supabase.table("user_saved_searches")
                .select("id")
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Saved search not found"
                )

            # Soft delete
            response = (
                self.supabase.table("user_saved_searches")
                .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete saved search"
                )

            return SavedSearchDeleteResponse(
                message="Saved search deleted successfully",
                deleted_id=search_id
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting saved search: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete saved search"
            )

    async def execute_saved_search(
        self,
        search_id: str,
        page: int = 1,
        page_size: int = 20,
    ) -> SavedSearchExecuteResponse:
        """Execute a saved search and return results"""
        try:
            # Get saved search
            saved_search_response = await self.get_saved_search(search_id)

            # Update execution metadata
            now = datetime.now(timezone.utc).isoformat()
            new_execution_count = saved_search_response.execution_count + 1

            update_response = (
                self.supabase.table("user_saved_searches")
                .update({
                    "execution_count": new_execution_count,
                    "last_executed_at": now,
                })
                .eq("id", search_id)
                .eq("user_id", self.user_id)
                .execute()
            )

            # Execute the search using Meilisearch
            # Note: This requires integration with SearchService
            # For now, we'll return a placeholder structure
            # TODO: Integrate with SearchService.search() method

            from services.search_service import SearchService
            from core.dependencies import get_meilisearch_client

            # Get search service
            meilisearch_client = get_meilisearch_client()
            search_service = SearchService(meilisearch_client)

            # Execute search
            search_results = await search_service.search(
                query=saved_search_response.query,
                filters=saved_search_response.filters,
                page=page,
                page_size=page_size
            )

            # Build response
            return SavedSearchExecuteResponse(
                saved_search={
                    "id": saved_search_response.id,
                    "name": saved_search_response.name,
                    "query": saved_search_response.query,
                    "filters": saved_search_response.filters,
                },
                results=search_results,
                execution_metadata={
                    "executed_at": now,
                    "execution_count": new_execution_count,
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error executing saved search: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to execute saved search: {str(e)}"
            )
