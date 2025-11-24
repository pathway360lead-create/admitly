"""
Search Service
Business logic for search operations using Meilisearch
"""
import logging
import time
from typing import Dict, List, Optional, Any
from fastapi import HTTPException, status

import meilisearch
from meilisearch.errors import MeilisearchApiError

from schemas.search import (
    SearchParams,
    SearchResults,
    SearchFilters,
    InstitutionSearchResult,
    ProgramSearchResult,
    AutocompleteSuggestion,
)

logger = logging.getLogger(__name__)


class SearchService:
    """Service for search operations using Meilisearch"""

    def __init__(self, meilisearch_client: meilisearch.Client):
        self.client = meilisearch_client
        self.institutions_index = self.client.index("institutions")
        self.programs_index = self.client.index("programs")

    def _build_filter_expression(
        self,
        filters: Optional[SearchFilters],
        entity_type: str
    ) -> Optional[str]:
        """
        Build Meilisearch filter expression from SearchFilters

        Args:
            filters: SearchFilters object
            entity_type: 'institution' or 'program'

        Returns:
            Filter expression string or None
        """
        if not filters:
            return None

        filter_parts = []

        # Always filter for published status
        if entity_type == "institution":
            filter_parts.append('status = "published"')
        elif entity_type == "program":
            filter_parts.append('status = "published"')
            filter_parts.append('is_active = true')

        # Institution filters
        if entity_type == "institution":
            if filters.institution_type:
                type_filter = " OR ".join([f'type = "{t}"' for t in filters.institution_type])
                filter_parts.append(f"({type_filter})")

            if filters.state:
                state_filter = " OR ".join([f'state = "{s}"' for s in filters.state])
                filter_parts.append(f"({state_filter})")

            if filters.verified is not None:
                filter_parts.append(f'verified = {str(filters.verified).lower()}')

        # Program filters
        elif entity_type == "program":
            if filters.degree_type:
                degree_filter = " OR ".join([f'degree_type = "{d}"' for d in filters.degree_type])
                filter_parts.append(f"({degree_filter})")

            if filters.field_of_study:
                field_filter = " OR ".join([f'field_of_study = "{f}"' for f in filters.field_of_study])
                filter_parts.append(f"({field_filter})")

            if filters.mode:
                mode_filter = " OR ".join([f'mode = "{m}"' for m in filters.mode])
                filter_parts.append(f"({mode_filter})")

            if filters.state:
                # For programs, filter by institution_state
                state_filter = " OR ".join([f'institution_state = "{s}"' for s in filters.state])
                filter_parts.append(f"({state_filter})")

            # Tuition range filters
            if filters.min_tuition is not None:
                filter_parts.append(f"tuition_annual >= {filters.min_tuition}")

            if filters.max_tuition is not None:
                filter_parts.append(f"tuition_annual <= {filters.max_tuition}")

            # Cutoff score filters
            if filters.min_cutoff is not None:
                filter_parts.append(f"cutoff_score >= {filters.min_cutoff}")

            if filters.max_cutoff is not None:
                filter_parts.append(f"cutoff_score <= {filters.max_cutoff}")

        # Combine all filters with AND
        if filter_parts:
            return " AND ".join(filter_parts)

        return None

    async def search_institutions(
        self,
        query: str,
        filters: Optional[SearchFilters] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search institutions index

        Args:
            query: Search query string
            filters: Optional filters
            limit: Maximum results to return
            offset: Offset for pagination

        Returns:
            Dict with hits, total, and processing time
        """
        try:
            # Build filter expression
            filter_expr = self._build_filter_expression(filters, "institution")

            # Search parameters
            search_params = {
                "limit": limit,
                "offset": offset,
                "attributesToHighlight": ["name", "short_name", "description"],
                "highlightPreTag": "<mark>",
                "highlightPostTag": "</mark>",
            }

            if filter_expr:
                search_params["filter"] = filter_expr

            # Execute search
            results = self.institutions_index.search(query, search_params)

            return {
                "hits": results["hits"],
                "total": results.get("estimatedTotalHits", 0),
                "processing_time_ms": results.get("processingTimeMs", 0),
            }

        except MeilisearchApiError as e:
            logger.error(f"Meilisearch API error during institution search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search service error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during institution search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to execute search: {str(e)}"
            )

    async def search_programs(
        self,
        query: str,
        filters: Optional[SearchFilters] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search programs index

        Args:
            query: Search query string
            filters: Optional filters
            limit: Maximum results to return
            offset: Offset for pagination

        Returns:
            Dict with hits, total, and processing time
        """
        try:
            # Build filter expression
            filter_expr = self._build_filter_expression(filters, "program")

            # Search parameters
            search_params = {
                "limit": limit,
                "offset": offset,
                "attributesToHighlight": ["name", "field_of_study", "specialization", "institution_name"],
                "highlightPreTag": "<mark>",
                "highlightPostTag": "</mark>",
            }

            if filter_expr:
                search_params["filter"] = filter_expr

            # Execute search
            results = self.programs_index.search(query, search_params)

            return {
                "hits": results["hits"],
                "total": results.get("estimatedTotalHits", 0),
                "processing_time_ms": results.get("processingTimeMs", 0),
            }

        except MeilisearchApiError as e:
            logger.error(f"Meilisearch API error during program search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search service error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during program search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to execute search: {str(e)}"
            )

    async def search_all(
        self,
        params: SearchParams
    ) -> Dict[str, Any]:
        """
        Global search across institutions and programs

        Args:
            params: SearchParams with query, filters, and pagination

        Returns:
            Dict with institutions, programs, totals, and timing info
        """
        start_time = time.time()

        try:
            # Calculate offset
            offset = (params.page - 1) * params.page_size

            institutions = []
            programs = []
            institutions_total = 0
            programs_total = 0
            total_processing_time_ms = 0

            # Search institutions
            if params.type in ("all", "institutions"):
                inst_results = await self.search_institutions(
                    query=params.q,
                    filters=params.filters,
                    limit=params.page_size,
                    offset=offset
                )
                institutions = inst_results["hits"]
                institutions_total = inst_results["total"]
                total_processing_time_ms += inst_results["processing_time_ms"]

            # Search programs
            if params.type in ("all", "programs"):
                prog_results = await self.search_programs(
                    query=params.q,
                    filters=params.filters,
                    limit=params.page_size,
                    offset=offset
                )
                programs = prog_results["hits"]
                programs_total = prog_results["total"]
                total_processing_time_ms += prog_results["processing_time_ms"]

            # Calculate total execution time
            execution_time_ms = (time.time() - start_time) * 1000

            return {
                "institutions": institutions,
                "programs": programs,
                "institutions_total": institutions_total,
                "programs_total": programs_total,
                "total_results": institutions_total + programs_total,
                "search_time_ms": round(execution_time_ms, 2),
                "meilisearch_time_ms": total_processing_time_ms,
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during global search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to execute search: {str(e)}"
            )

    async def autocomplete(
        self,
        query: str,
        limit: int = 10
    ) -> List[AutocompleteSuggestion]:
        """
        Autocomplete search across institutions and programs

        Args:
            query: Search query string (minimum 2 characters)
            limit: Maximum suggestions to return

        Returns:
            List of AutocompleteSuggestion objects
        """
        try:
            suggestions = []

            # Split limit between institutions and programs
            per_type_limit = limit // 2 + (limit % 2)

            # Search institutions (only get essential fields)
            inst_results = self.institutions_index.search(
                query,
                {
                    "limit": per_type_limit,
                    "filter": 'status = "published"',
                    "attributesToRetrieve": [
                        "id", "name", "slug", "state", "type", "short_name"
                    ],
                }
            )

            # Add institution suggestions
            for hit in inst_results["hits"]:
                suggestions.append(
                    AutocompleteSuggestion(
                        type="institution",
                        id=hit["id"],
                        name=hit["name"],
                        slug=hit["slug"],
                        description=f"{hit['type'].replace('_', ' ').title()} - {hit['state']}",
                        institution_state=hit["state"],
                    )
                )

            # Search programs (only get essential fields)
            prog_results = self.programs_index.search(
                query,
                {
                    "limit": per_type_limit,
                    "filter": 'status = "published" AND is_active = true',
                    "attributesToRetrieve": [
                        "id", "name", "slug", "institution_name",
                        "institution_slug", "degree_type", "field_of_study"
                    ],
                }
            )

            # Add program suggestions
            for hit in prog_results["hits"]:
                description_parts = []
                if hit.get("field_of_study"):
                    description_parts.append(hit["field_of_study"])
                if hit.get("institution_name"):
                    description_parts.append(hit["institution_name"])

                suggestions.append(
                    AutocompleteSuggestion(
                        type="program",
                        id=hit["id"],
                        name=hit["name"],
                        slug=hit["slug"],
                        description=" - ".join(description_parts) if description_parts else None,
                        institution_name=hit.get("institution_name"),
                        degree_type=hit.get("degree_type"),
                    )
                )

            # Return only up to limit
            return suggestions[:limit]

        except MeilisearchApiError as e:
            logger.error(f"Meilisearch API error during autocomplete: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Autocomplete service error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during autocomplete: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to execute autocomplete: {str(e)}"
            )
