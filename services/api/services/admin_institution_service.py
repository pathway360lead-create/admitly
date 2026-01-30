"""
Admin Institution Service
Business logic for admin institution management (CRUD operations)
"""
import logging
import re
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from supabase import Client
from datetime import datetime

from schemas.admin import (
    InstitutionCreateRequest,
    InstitutionUpdateRequest,
    InstitutionAdminResponse,
)

logger = logging.getLogger(__name__)


class AdminInstitutionService:
    """Service for admin institution management"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    def _generate_slug(self, name: str) -> str:
        """
        Generate URL-friendly slug from institution name

        Args:
            name: Institution name

        Returns:
            URL-friendly slug (lowercase, hyphens, no special chars)
        """
        # Convert to lowercase
        slug = name.lower()

        # Replace spaces and special chars with hyphens
        slug = re.sub(r'[^a-z0-9]+', '-', slug)

        # Remove leading/trailing hyphens
        slug = slug.strip('-')

        # Remove consecutive hyphens
        slug = re.sub(r'-+', '-', slug)

        return slug

    async def create_institution(
        self,
        data: InstitutionCreateRequest
    ) -> InstitutionAdminResponse:
        """
        Create a new institution

        Args:
            data: Institution creation data

        Returns:
            Created institution with admin fields

        Raises:
            HTTPException: If creation fails or slug already exists
        """
        try:
            # Generate base slug if not provided
            base_slug = data.slug or self._generate_slug(data.name)
            slug = base_slug

            # Try to insert with generated slug (with retry on constraint violation)
            max_attempts = 10
            for attempt in range(max_attempts):
                try:
                    # Prepare institution data
                    institution_data = {
                        "slug": slug,
                        "name": data.name,
                        "short_name": data.short_name,
                        "type": data.type.value,
                        "state": data.state,
                        "city": data.city,
                        "description": data.description,
                        "address": data.address,
                        "phone": data.phone,
                        "email": data.email,
                        "website": data.website,
                        "logo_url": data.logo_url,
                        "banner_url": data.banner_url,
                        "year_established": data.year_established,
                        "accreditation_status": data.accreditation_status,
                        "verified": data.verified,
                        "status": data.status.value,
                    }

                    # Insert institution (database will enforce uniqueness)
                    response = self.supabase.table('institutions')\
                        .insert(institution_data)\
                        .execute()

                    if not response.data or len(response.data) == 0:
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Failed to create institution"
                        )

                    # Success! Get created institution with program count
                    institution_id = response.data[0]['id']
                    return await self.get_institution(institution_id)

                except Exception as insert_error:
                    error_msg = str(insert_error).lower()

                    # Check if error is due to duplicate slug constraint
                    if 'institutions_slug_unique' in error_msg or \
                       ('duplicate key' in error_msg and 'slug' in error_msg):
                        # Retry with incremented slug
                        slug = f"{base_slug}-{attempt + 1}"
                        logger.info(f"Slug collision detected, retrying with: {slug}")
                        continue
                    else:
                        # Other error - re-raise
                        raise

            # Max attempts reached
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate unique slug after {max_attempts} attempts"
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating institution: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create institution: {str(e)}"
            )

    async def get_institution(self, institution_id: str) -> InstitutionAdminResponse:
        """
        Get single institution by ID (admin view - includes all fields)

        Args:
            institution_id: Institution UUID

        Returns:
            Institution with all admin fields

        Raises:
            HTTPException: If institution not found
        """
        try:
            # Get institution
            response = self.supabase.table('institutions')\
                .select('*')\
                .eq('id', institution_id)\
                .maybe_single()\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with id {institution_id} not found"
                )

            institution = response.data

            # Get program count
            program_count_response = self.supabase.table('programs')\
                .select('id', count='exact')\
                .eq('institution_id', institution_id)\
                .is_('deleted_at', 'null')\
                .execute()

            program_count = program_count_response.count or 0

            # Add program count to response
            institution['program_count'] = program_count

            return InstitutionAdminResponse(**institution)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching institution: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch institution: {str(e)}"
            )

    async def list_institutions(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict:
        """
        List all institutions with admin filters (includes drafts, archived)

        Args:
            page: Page number (1-indexed)
            page_size: Items per page
            status_filter: Filter by status (draft, published, archived)
            search: Search in name or short_name

        Returns:
            Dict with data and pagination metadata
        """
        try:
            # Start query with count
            query = self.supabase.table('institutions').select('*', count='exact')

            # Apply status filter
            if status_filter:
                query = query.eq('status', status_filter)

            # Apply search filter
            if search:
                search_pattern = f"%{search}%"
                query = query.or_(
                    f'name.ilike.{search_pattern},'
                    f'short_name.ilike.{search_pattern}'
                )

            # Exclude deleted (soft delete)
            query = query.is_('deleted_at', 'null')

            # Order by updated_at desc (show recent first)
            query = query.order('updated_at', desc=True)

            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)

            # Execute query
            response = query.execute()

            # Calculate pagination
            total = response.count if response.count is not None else 0
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0

            # OPTIMIZATION: Get program counts for ALL institutions in single query
            # This prevents N+1 query problem (was: 1 institutions query + N program count queries)
            # Now: 1 institutions query + 1 aggregated program counts query
            institution_ids = [item['id'] for item in response.data]
            program_counts_dict = {}

            if institution_ids:
                # Query all programs for these institutions at once
                programs_response = (
                    self.supabase.table('programs')
                    .select('institution_id')
                    .in_('institution_id', institution_ids)
                    .is_('deleted_at', 'null')
                    .execute()
                )

                # Count programs per institution in Python (O(n) operation, very fast)
                for program in programs_response.data:
                    inst_id = program['institution_id']
                    program_counts_dict[inst_id] = program_counts_dict.get(inst_id, 0) + 1

            # Add program counts to each institution
            for item in response.data:
                item['program_count'] = program_counts_dict.get(item['id'], 0)

            return {
                "data": [InstitutionAdminResponse(**item) for item in response.data],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": total_pages,
                    "has_prev": page > 1,
                    "has_next": page < total_pages
                }
            }

        except Exception as e:
            logger.error(f"Error listing institutions: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list institutions: {str(e)}"
            )

    async def update_institution(
        self,
        institution_id: str,
        data: InstitutionUpdateRequest
    ) -> InstitutionAdminResponse:
        """
        Update institution

        Args:
            institution_id: Institution UUID
            data: Update data (only provided fields will be updated)

        Returns:
            Updated institution

        Raises:
            HTTPException: If institution not found or update fails
        """
        try:
            # Check institution exists
            existing = self.supabase.table('institutions')\
                .select('id')\
                .eq('id', institution_id)\
                .maybe_single()\
                .execute()

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with id {institution_id} not found"
                )

            # Build update dict (only include provided fields)
            update_data = {}

            if data.name is not None:
                update_data['name'] = data.name
            if data.short_name is not None:
                update_data['short_name'] = data.short_name
            if data.slug is not None:
                update_data['slug'] = data.slug
            if data.type is not None:
                update_data['type'] = data.type.value
            if data.state is not None:
                update_data['state'] = data.state
            if data.city is not None:
                update_data['city'] = data.city
            if data.description is not None:
                update_data['description'] = data.description
            if data.address is not None:
                update_data['address'] = data.address
            if data.phone is not None:
                update_data['phone'] = data.phone
            if data.email is not None:
                update_data['email'] = data.email
            if data.website is not None:
                update_data['website'] = data.website
            if data.logo_url is not None:
                update_data['logo_url'] = data.logo_url
            if data.banner_url is not None:
                update_data['banner_url'] = data.banner_url
            if data.year_established is not None:
                update_data['year_established'] = data.year_established
            if data.accreditation_status is not None:
                update_data['accreditation_status'] = data.accreditation_status
            if data.verified is not None:
                update_data['verified'] = data.verified
            if data.status is not None:
                update_data['status'] = data.status.value

            # Always update updated_at timestamp
            update_data['updated_at'] = datetime.utcnow().isoformat()

            # Update institution
            response = self.supabase.table('institutions')\
                .update(update_data)\
                .eq('id', institution_id)\
                .execute()

            if not response.data or len(response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update institution"
                )

            # Return updated institution
            return await self.get_institution(institution_id)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating institution: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update institution: {str(e)}"
            )

    async def delete_institution(self, institution_id: str) -> Dict:
        """
        Soft delete institution (sets deleted_at timestamp)

        Args:
            institution_id: Institution UUID

        Returns:
            Success message

        Raises:
            HTTPException: If institution not found
        """
        try:
            # Check institution exists
            existing = self.supabase.table('institutions')\
                .select('id')\
                .eq('id', institution_id)\
                .is_('deleted_at', 'null')\
                .maybe_single()\
                .execute()

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with id {institution_id} not found"
                )

            # Soft delete by setting deleted_at
            response = self.supabase.table('institutions')\
                .update({"deleted_at": datetime.utcnow().isoformat()})\
                .eq('id', institution_id)\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to delete institution"
                )

            return {"message": f"Institution {institution_id} deleted successfully"}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting institution: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete institution: {str(e)}"
            )

    async def update_status(self, institution_id: str, new_status: str) -> InstitutionAdminResponse:
        """
        Update institution status (publish/unpublish)

        Args:
            institution_id: Institution UUID
            new_status: New status value

        Returns:
            Updated institution

        Raises:
            HTTPException: If institution not found
        """
        try:
            # Check institution exists
            existing = self.supabase.table('institutions')\
                .select('id')\
                .eq('id', institution_id)\
                .maybe_single()\
                .execute()

            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Institution with id {institution_id} not found"
                )

            # Update status
            response = self.supabase.table('institutions')\
                .update({
                    "status": new_status,
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq('id', institution_id)\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update status"
                )

            # Return updated institution
            return await self.get_institution(institution_id)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating status: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update status: {str(e)}"
            )
