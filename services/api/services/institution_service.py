"""
Institution Service
Business logic for institution operations
"""
import logging
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from supabase import Client

from schemas.institutions import (
    InstitutionBase,
    InstitutionResponse,
    InstitutionFilters,
    PaginationMetadata,
    InstitutionListResponse,
)

logger = logging.getLogger(__name__)


class InstitutionService:
    """Service for institution operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def list_institutions(self, filters: InstitutionFilters) -> InstitutionListResponse:
        """
        List institutions with filters and pagination

        Args:
            filters: InstitutionFilters object containing filter parameters

        Returns:
            InstitutionListResponse with data and pagination metadata

        Raises:
            HTTPException: On database errors
        """
        try:
            # Start query
            query = self.supabase.table('institutions').select('*', count='exact')

            # Apply status filters (only published, non-deleted)
            query = query.eq('status', 'published')
            query = query.is_('deleted_at', 'null')

            # Apply search filter
            if filters.search:
                # Search in name or short_name using ilike (case-insensitive)
                search_pattern = f"%{filters.search}%"
                query = query.or_(
                    f'name.ilike.{search_pattern},'
                    f'short_name.ilike.{search_pattern}'
                )

            # Apply state filter
            if filters.state and len(filters.state) > 0:
                query = query.in_('state', filters.state)

            # Apply type filter
            if filters.type and len(filters.type) > 0:
                query = query.in_('type', filters.type)

            # Apply verified filter
            if filters.verified is not None:
                query = query.eq('verified', filters.verified)

            # Order by name
            query = query.order('name', desc=False)

            # Apply pagination
            offset = (filters.page - 1) * filters.page_size
            query = query.range(offset, offset + filters.page_size - 1)

            # Execute query
            response = query.execute()

            # Calculate pagination metadata
            total = response.count if response.count is not None else 0
            total_pages = (total + filters.page_size - 1) // filters.page_size if total > 0 else 0

            pagination = PaginationMetadata(
                page=filters.page,
                page_size=filters.page_size,
                total=total,
                total_pages=total_pages,
                has_prev=filters.page > 1,
                has_next=filters.page < total_pages
            )

            # OPTIMIZATION: Fetch program counts for ALL institutions in single query
            # This prevents N+1 query problem (was: 1 institutions query + N program count queries)
            # Now: 1 institutions query + 1 aggregated program counts query
            institution_ids = [item['id'] for item in response.data]

            # Get program counts for all institutions at once
            program_counts_dict = {}
            if institution_ids:
                # Query all programs for these institutions
                programs_response = (
                    self.supabase.table('programs')
                    .select('institution_id')
                    .in_('institution_id', institution_ids)
                    .eq('status', 'published')
                    .is_('deleted_at', 'null')
                    .execute()
                )

                # Count programs per institution in Python (O(n) operation, very fast)
                for program in programs_response.data:
                    inst_id = program['institution_id']
                    program_counts_dict[inst_id] = program_counts_dict.get(inst_id, 0) + 1

            # Parse data and add program_count from our pre-computed dictionary
            institutions = []
            for item in response.data:
                item['program_count'] = program_counts_dict.get(item['id'], 0)
                institutions.append(InstitutionBase(**item))

            return InstitutionListResponse(
                data=institutions,
                pagination=pagination
            )

        except Exception as e:
            logger.error(f"Error listing institutions: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch institutions: {str(e)}"
            )

    async def get_by_slug(self, slug: str) -> InstitutionResponse:
        """
        Get single institution by slug

        Args:
            slug: Institution slug (URL-friendly identifier)

        Returns:
            InstitutionResponse with full details

        Raises:
            HTTPException: 404 if not found, 500 on database errors
        """
        try:
            # Query by slug with status filters
            response = (
                self.supabase.table('institutions')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .execute()
            )

            # response.data will be [] if no match, or [institution_dict] if match
            if not response.data or len(response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with slug '{slug}' not found"
                )

            # Add program_count (optimized: use count='exact' for single query)
            institution_data = response.data[0]  # Get first (and only) item from list
            program_count_response = (
                self.supabase.table('programs')
                .select('*', count='exact')
                .eq('institution_id', institution_data['id'])
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .limit(0)  # We only need the count, not the data
                .execute()
            )
            institution_data['program_count'] = program_count_response.count or 0

            return InstitutionResponse(**institution_data)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching institution by slug '{slug}': {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch institution: {str(e)}"
            )

    async def get_by_id(self, institution_id: str) -> InstitutionResponse:
        """
        Get single institution by UUID

        Used by comparison feature which stores entity IDs.

        Args:
            institution_id: Institution UUID

        Returns:
            InstitutionResponse with full details

        Raises:
            HTTPException: 404 if not found, 500 on database errors
        """
        try:
            # Query by id with status filters
            response = (
                self.supabase.table('institutions')
                .select('*')
                .eq('id', institution_id)
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .execute()
            )

            # response.data will be [] if no match, or [institution_dict] if match
            if not response.data or len(response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with id '{institution_id}' not found"
                )

            # Add program_count (optimized: use count='exact' for single query)
            institution_data = response.data[0]  # Get first (and only) item from list
            program_count_response = (
                self.supabase.table('programs')
                .select('*', count='exact')
                .eq('institution_id', institution_data['id'])
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .limit(0)  # We only need the count, not the data
                .execute()
            )
            institution_data['program_count'] = program_count_response.count or 0

            return InstitutionResponse(**institution_data)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching institution by id '{institution_id}': {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch institution: {str(e)}"
            )

    async def get_programs(
        self,
        slug: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict:
        """
        Get programs for an institution

        Args:
            slug: Institution slug
            page: Page number
            page_size: Items per page

        Returns:
            Dict with programs data and pagination metadata

        Raises:
            HTTPException: 404 if institution not found, 500 on database errors
        """
        try:
            # First verify institution exists
            institution_response = (
                self.supabase.table('institutions')
                .select('id')
                .eq('slug', slug)
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .execute()
            )

            # institution_response.data will be [] if no match, or [institution_dict] if match
            if not institution_response.data or len(institution_response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with slug '{slug}' not found"
                )

            institution_id = institution_response.data[0]['id']  # Get first (and only) item from list

            # Query programs
            query = self.supabase.table('programs').select('*', count='exact')
            query = query.eq('institution_id', institution_id)
            query = query.eq('status', 'published')
            query = query.is_('deleted_at', 'null')
            query = query.order('name', desc=False)

            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)

            # Execute query
            response = query.execute()

            # Calculate pagination
            total = response.count if response.count is not None else 0
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0

            return {
                "data": response.data,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": total_pages,
                    "has_prev": page > 1,
                    "has_next": page < total_pages
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching programs for institution '{slug}': {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch programs: {str(e)}"
            )
