"""
Search History Service
Business logic for user search history
"""
import logging
from typing import Optional
from supabase import Client
from fastapi import HTTPException, status
from datetime import datetime, timezone
from collections import Counter

from schemas.search_history import (
    SearchHistoryListResponse,
    SearchHistoryEntry,
    SearchHistoryClearResponse,
    SearchHistoryAnalytics,
    TopQuery,
)

logger = logging.getLogger(__name__)


class SearchHistoryService:
    """Service for managing user search history"""

    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    async def list_search_history(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> SearchHistoryListResponse:
        """List user's search history with pagination"""
        try:
            # Get total count
            count_response = (
                self.supabase.table("user_search_history")
                .select("id", count="exact")
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )
            total = count_response.count if count_response.count is not None else 0

            # Get paginated results
            response = (
                self.supabase.table("user_search_history")
                .select("*")
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )

            # Convert to response models
            entries = [
                SearchHistoryEntry(
                    id=item["id"],
                    query=item["query"],
                    filters=item.get("filters", {}),
                    results_count=item.get("results_count"),
                    created_at=item["created_at"],
                )
                for item in response.data
            ]

            return SearchHistoryListResponse(
                data=entries,
                total=total,
                limit=limit,
                offset=offset
            )

        except Exception as e:
            logger.error(f"Error listing search history: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to list search history"
            )

    async def clear_search_history(self) -> SearchHistoryClearResponse:
        """Clear all search history for user (soft delete)"""
        try:
            # Count entries to be deleted
            count_response = (
                self.supabase.table("user_search_history")
                .select("id", count="exact")
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )
            count = count_response.count if count_response.count is not None else 0

            if count == 0:
                return SearchHistoryClearResponse(
                    message="No search history to clear",
                    deleted_count=0
                )

            # Soft delete all entries
            now = datetime.now(timezone.utc).isoformat()
            response = (
                self.supabase.table("user_search_history")
                .update({"deleted_at": now})
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .execute()
            )

            return SearchHistoryClearResponse(
                message="Search history cleared successfully",
                deleted_count=count
            )

        except Exception as e:
            logger.error(f"Error clearing search history: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear search history"
            )

    async def get_search_analytics(self) -> SearchHistoryAnalytics:
        """Get analytics about user's search behavior"""
        try:
            # Get all search history
            response = (
                self.supabase.table("user_search_history")
                .select("*")
                .eq("user_id", self.user_id)
                .is_("deleted_at", "null")
                .order("created_at", desc=False)
                .execute()
            )

            if not response.data:
                # Return empty analytics
                return SearchHistoryAnalytics(
                    total_searches=0,
                    unique_queries=0,
                    top_queries=[],
                    top_filters={},
                    date_range={}
                )

            # Calculate analytics
            total_searches = len(response.data)
            queries = [item["query"] for item in response.data]
            unique_queries = len(set(queries))

            # Top queries
            query_counts = Counter(queries)
            top_queries = [
                TopQuery(query=query, count=count)
                for query, count in query_counts.most_common(10)
            ]

            # Top filters
            top_filters = {}
            all_filters = [item.get("filters", {}) for item in response.data if item.get("filters")]

            # Aggregate filter values
            for filters in all_filters:
                for key, value in filters.items():
                    if key not in top_filters:
                        top_filters[key] = Counter()

                    # Handle list values (e.g., state: ["Lagos", "Ogun"])
                    if isinstance(value, list):
                        for v in value:
                            top_filters[key][str(v)] += 1
                    else:
                        top_filters[key][str(value)] += 1

            # Convert Counter to dict
            top_filters_dict = {
                key: dict(counter.most_common(5))
                for key, counter in top_filters.items()
            }

            # Date range
            dates = [item["created_at"] for item in response.data]
            date_range = {
                "first_search": min(dates) if dates else None,
                "last_search": max(dates) if dates else None
            }

            return SearchHistoryAnalytics(
                total_searches=total_searches,
                unique_queries=unique_queries,
                top_queries=top_queries,
                top_filters=top_filters_dict,
                date_range=date_range
            )

        except Exception as e:
            logger.error(f"Error getting search analytics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get search analytics"
            )
