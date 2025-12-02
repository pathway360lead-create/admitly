"""
Program Service
Business logic for program operations
"""
import logging
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from supabase import Client

from schemas.programs import (
    ProgramBase,
    ProgramResponse,
    ProgramFilters,
    PaginationMetadata,
    ProgramListResponse,
)

logger = logging.getLogger(__name__)


class ProgramService:
    """Service for program operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def list_programs(self, filters: ProgramFilters) -> ProgramListResponse:
        """
        List programs with filters and pagination

        Args:
            filters: ProgramFilters object containing filter parameters

        Returns:
            ProgramListResponse with data and pagination metadata

        Raises:
            HTTPException: On database errors
        """
        try:
            # Start query - join with institutions to get institution data
            query = (
                self.supabase.table('programs')
                .select(
                    '''
                    *,
                    institution:institutions (
                        name,
                        slug,
                        state
                    )
                    ''',
                    count='exact'
                )
            )

            # Apply status filters (only published, non-deleted, active programs)
            query = query.eq('status', 'published')
            query = query.is_('deleted_at', 'null')
            query = query.eq('is_active', True)

            # Apply search filter
            if filters.search:
                # Search in name or field_of_study using ilike (case-insensitive)
                search_pattern = f"%{filters.search}%"
                query = query.or_(
                    f'name.ilike.{search_pattern},'
                    f'field_of_study.ilike.{search_pattern},'
                    f'specialization.ilike.{search_pattern}'
                )

            # Apply state filter (from institution)
            if filters.state and len(filters.state) > 0:
                # Note: This requires institutions table to be joined
                # For now, we'll filter in Python after fetching
                pass

            # Apply degree_type filter
            if filters.degree_type and len(filters.degree_type) > 0:
                query = query.in_('degree_type', filters.degree_type)

            # Apply field_of_study filter
            if filters.field_of_study and len(filters.field_of_study) > 0:
                query = query.in_('field_of_study', filters.field_of_study)

            # Apply mode filter
            if filters.mode and len(filters.mode) > 0:
                query = query.in_('mode', filters.mode)

            # Order by name
            query = query.order('name', desc=False)

            # Apply pagination
            offset = (filters.page - 1) * filters.page_size
            query = query.range(offset, offset + filters.page_size - 1)

            # Execute query
            response = query.execute()

            # Transform data to include institution fields
            programs_data = []
            for item in response.data:
                institution_data = item.get('institution', {})
                program_dict = {
                    **item,
                    'institution_name': institution_data.get('name', ''),
                    'institution_slug': institution_data.get('slug', ''),
                    'institution_state': institution_data.get('state', ''),
                }
                # Remove nested institution object
                program_dict.pop('institution', None)

                # Apply state filter in Python (since we couldn't do it in SQL)
                if filters.state and len(filters.state) > 0:
                    if program_dict['institution_state'] not in filters.state:
                        continue

                programs_data.append(program_dict)

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

            # Parse data
            programs = [ProgramBase(**item) for item in programs_data]

            return ProgramListResponse(
                data=programs,
                pagination=pagination
            )

        except Exception as e:
            logger.error(f"Error listing programs: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch programs: {str(e)}"
            )

    async def get_by_id(self, program_id: str) -> ProgramResponse:
        """
        Get single program by ID

        Args:
            program_id: Program UUID

        Returns:
            ProgramResponse with full details

        Raises:
            HTTPException: 404 if not found, 500 on database errors
        """
        try:
            # Query by ID with status filters, join with institution
            response = (
                self.supabase.table('programs')
                .select(
                    '''
                    *,
                    institution:institutions (
                        name,
                        slug,
                        state
                    )
                    '''
                )
                .eq('id', program_id)
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .execute()
            )

            # response.data will be [] if no match, or [program_dict] if match
            if not response.data or len(response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Program with ID '{program_id}' not found"
                )

            # Transform data to include institution fields
            program_data = response.data[0]  # Get first (and only) item from list
            institution_data = program_data.get('institution', {})
            program_dict = {
                **program_data,
                'institution_name': institution_data.get('name', ''),
                'institution_slug': institution_data.get('slug', ''),
                'institution_state': institution_data.get('state', ''),
            }
            # Remove nested institution object
            program_dict.pop('institution', None)

            return ProgramResponse(**program_dict)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching program by ID '{program_id}': {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch program: {str(e)}"
            )
