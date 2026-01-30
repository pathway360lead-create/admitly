"""
Admin Program Service
Business logic for program CRUD operations (admin only)
"""
import logging
import re
from typing import Optional, List
from supabase import Client
from fastapi import HTTPException, status
from schemas.admin import (
    ProgramCreateRequest,
    ProgramUpdateRequest,
    ProgramAdminResponse,
)

logger = logging.getLogger(__name__)


class AdminProgramService:
    """Service for managing programs via admin portal"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    def _generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug from program name"""
        # Convert to lowercase
        slug = name.lower()
        # Replace non-alphanumeric characters with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        # Replace multiple consecutive hyphens with single hyphen
        slug = re.sub(r'-+', '-', slug)
        return slug

    async def create_program(self, data: ProgramCreateRequest) -> ProgramAdminResponse:
        """
        Create a new program

        Args:
            data: Program creation data

        Returns:
            Created program with institution details

        Raises:
            HTTPException: 409 if slug already exists, 404 if institution not found
        """
        # Generate base slug if not provided
        base_slug = data.slug or self._generate_slug(data.name)

        # Check if institution exists
        institution_response = self.supabase.table('institutions').select('id').eq('id', data.institution_id).maybe_single().execute()
        if not institution_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Institution with id {data.institution_id} not found"
            )

        # Try to insert with generated slug (with retry on constraint violation)
        slug = base_slug
        max_attempts = 10
        for attempt in range(max_attempts):
            try:
                # Prepare program data
                program_data = data.model_dump(exclude_unset=True)
                program_data['slug'] = slug

                # Insert program (database will enforce uniqueness per institution)
                response = self.supabase.table('programs').insert(program_data).execute()

                if not response.data:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create program"
                    )

                # Success! Fetch with institution details
                program_id = response.data[0]['id']
                return await self.get_program(program_id)

            except Exception as insert_error:
                error_msg = str(insert_error).lower()

                # Check if error is due to duplicate slug constraint (per institution)
                if 'programs_slug_institution_unique' in error_msg or \
                   ('duplicate key' in error_msg and 'slug' in error_msg):
                    # Retry with incremented slug
                    slug = f"{base_slug}-{attempt + 1}"
                    logger.info(f"Slug collision detected for program, retrying with: {slug}")
                    continue
                else:
                    # Other error - re-raise
                    raise

        # Max attempts reached
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate unique slug after {max_attempts} attempts"
        )

    async def get_program(self, program_id: str) -> ProgramAdminResponse:
        """
        Get a program by ID with institution details

        Args:
            program_id: Program UUID

        Returns:
            Program with institution details

        Raises:
            HTTPException: 404 if program not found
        """
        response = self.supabase.table('programs').select(
            '*, institution:institutions(id, name, short_name)'
        ).eq('id', program_id).maybe_single().execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with id {program_id} not found"
            )

        return ProgramAdminResponse(**response.data)

    async def list_programs(
        self,
        page: int = 1,
        page_size: int = 20,
        institution_id: Optional[str] = None,
        degree_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> dict:
        """
        List programs with filtering and pagination

        Args:
            page: Page number (1-indexed)
            page_size: Items per page
            institution_id: Filter by institution
            degree_type: Filter by degree type
            status_filter: Filter by status (draft/published/archived)
            search: Search by program name

        Returns:
            Dict with data and pagination info
        """
        # Build query
        query = self.supabase.table('programs').select(
            '*, institution:institutions(id, name, short_name)',
            count='exact'
        )

        # Apply filters
        if institution_id:
            query = query.eq('institution_id', institution_id)

        if degree_type:
            query = query.eq('degree_type', degree_type)

        if status_filter:
            query = query.eq('status', status_filter)

        # Include soft-deleted programs in admin view
        # (normal users don't see deleted_at != null)

        if search:
            query = query.ilike('name', f'%{search}%')

        # Get total count
        count_response = query.execute()
        total = count_response.count if count_response.count is not None else 0

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)

        # Order by updated_at desc
        query = query.order('updated_at', desc=True)

        # Execute query
        response = query.execute()

        programs = [ProgramAdminResponse(**item) for item in response.data]

        return {
            "data": programs,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
                "has_prev": page > 1,
                "has_next": page * page_size < total
            }
        }

    async def update_program(
        self,
        program_id: str,
        data: ProgramUpdateRequest
    ) -> ProgramAdminResponse:
        """
        Update a program

        Args:
            program_id: Program UUID
            data: Program update data

        Returns:
            Updated program

        Raises:
            HTTPException: 404 if program not found, 409 if slug conflict
        """
        # Check program exists
        existing = self.supabase.table('programs').select('id, slug, institution_id').eq('id', program_id).maybe_single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with id {program_id} not found"
            )

        # Prepare update data
        update_data = data.model_dump(exclude_unset=True)

        # If slug is being updated, check uniqueness
        if 'slug' in update_data and update_data['slug'] != existing.data['slug']:
            slug_check = self.supabase.table('programs').select('id').eq('slug', update_data['slug']).eq('institution_id', existing.data['institution_id']).maybe_single().execute()
            if slug_check.data and slug_check.data['id'] != program_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Program with slug '{update_data['slug']}' already exists for this institution"
                )

        # Update program
        response = self.supabase.table('programs').update(update_data).eq('id', program_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update program"
            )

        # Return updated program with institution details
        return await self.get_program(program_id)

    async def delete_program(self, program_id: str) -> dict:
        """
        Soft delete a program (sets deleted_at timestamp)

        Args:
            program_id: Program UUID

        Returns:
            Success message

        Raises:
            HTTPException: 404 if program not found
        """
        # Check program exists
        existing = self.supabase.table('programs').select('id').eq('id', program_id).maybe_single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with id {program_id} not found"
            )

        # Soft delete (set deleted_at)
        from datetime import datetime, timezone
        response = self.supabase.table('programs').update({
            'deleted_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', program_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete program"
            )

        return {"message": "Program deleted successfully"}

    async def update_program_status(
        self,
        program_id: str,
        new_status: str
    ) -> ProgramAdminResponse:
        """
        Update program publication status

        Args:
            program_id: Program UUID
            new_status: New status (draft/published/archived)

        Returns:
            Updated program

        Raises:
            HTTPException: 404 if program not found
        """
        # Check program exists
        existing = self.supabase.table('programs').select('id').eq('id', program_id).maybe_single().execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Program with id {program_id} not found"
            )

        # Update status
        response = self.supabase.table('programs').update({
            'status': new_status
        }).eq('id', program_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update program status"
            )

        # Return updated program
        return await self.get_program(program_id)
