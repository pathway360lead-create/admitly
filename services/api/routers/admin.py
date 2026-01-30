"""
Admin Router
API endpoints for admin management
"""
from fastapi import APIRouter, Depends, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from supabase import Client

from core.dependencies import get_current_admin_user, get_supabase
from core.database import get_supabase_with_token
from services.admin_institution_service import AdminInstitutionService
from services.admin_program_service import AdminProgramService
from schemas.admin import (
    InstitutionCreateRequest,
    InstitutionUpdateRequest,
    InstitutionAdminResponse,
    ProgramCreateRequest,
    ProgramUpdateRequest,
    ProgramAdminResponse,
    StatusUpdateRequest,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
security = HTTPBearer()  # For extracting JWT tokens from Authorization header


def get_admin_institution_service(
    current_user = Depends(get_current_admin_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AdminInstitutionService:
    """
    Get admin institution service with user's authenticated client
    
    RLS policies enforce internal_admin role check.
    User's JWT token is used to create client, enabling:
    - Role-based access control via RLS
    - Audit trail via auth.uid()
    - Defense in depth security
    """
    supabase = get_supabase_with_token(credentials.credentials)
    return AdminInstitutionService(supabase)


def get_admin_program_service(
    current_user = Depends(get_current_admin_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AdminProgramService:
    """
    Get admin program service with user's authenticated client
    
    RLS policies enforce internal_admin role check.
    User's JWT token is used to create client, enabling:
    - Role-based access control via RLS
    - Audit trail via auth.uid()
    - Defense in depth security
    """
    supabase = get_supabase_with_token(credentials.credentials)
    return AdminProgramService(supabase)


# ========== INSTITUTION MANAGEMENT ==========


@router.post(
    "/institutions",
    response_model=InstitutionAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new institution",
    description="Create a new institution (admin only)"
)
async def create_institution(
    data: InstitutionCreateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    Create a new institution

    **Requires:** Admin role

    **Request Body:**
    - name (required): Institution name
    - type (required): Institution type (federal_university, state_university, etc.)
    - state (required): Nigerian state
    - city (required): City location
    - All other fields optional

    **Returns:** Created institution with all fields
    """
    return await service.create_institution(data)


@router.get(
    "/institutions",
    response_model=Dict,
    summary="List all institutions",
    description="List all institutions including drafts and archived (admin only)"
)
async def list_institutions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status (draft, published, archived)"),
    search: Optional[str] = Query(None, description="Search in name or short_name"),
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    List all institutions with admin filters

    **Requires:** Admin role

    **Query Parameters:**
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - status_filter: Filter by status (draft, published, archived)
    - search: Search in institution name or short_name

    **Returns:** List of institutions with pagination metadata

    **Note:** Unlike public endpoint, this returns ALL institutions including drafts and archived
    """
    return await service.list_institutions(page, page_size, status_filter, search)


@router.get(
    "/institutions/{institution_id}",
    response_model=InstitutionAdminResponse,
    summary="Get institution by ID",
    description="Get single institution with all fields (admin only)"
)
async def get_institution(
    institution_id: str,
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    Get single institution by ID

    **Requires:** Admin role

    **Path Parameters:**
    - institution_id: Institution UUID

    **Returns:** Institution with all admin fields including program_count
    """
    return await service.get_institution(institution_id)


@router.put(
    "/institutions/{institution_id}",
    response_model=InstitutionAdminResponse,
    summary="Update institution",
    description="Update institution (admin only)"
)
async def update_institution(
    institution_id: str,
    data: InstitutionUpdateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    Update institution

    **Requires:** Admin role

    **Path Parameters:**
    - institution_id: Institution UUID

    **Request Body:**
    - All fields optional (only provided fields will be updated)

    **Returns:** Updated institution
    """
    return await service.update_institution(institution_id, data)


@router.delete(
    "/institutions/{institution_id}",
    response_model=Dict,
    summary="Delete institution",
    description="Soft delete institution (admin only)"
)
async def delete_institution(
    institution_id: str,
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    Soft delete institution (sets deleted_at timestamp)

    **Requires:** Admin role

    **Path Parameters:**
    - institution_id: Institution UUID

    **Returns:** Success message

    **Note:** This is a soft delete. Institution is not removed from database,
    just marked as deleted with deleted_at timestamp.
    """
    return await service.delete_institution(institution_id)


@router.patch(
    "/institutions/{institution_id}/status",
    response_model=InstitutionAdminResponse,
    summary="Update institution status",
    description="Publish, unpublish, or archive institution (admin only)"
)
async def update_institution_status(
    institution_id: str,
    data: StatusUpdateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminInstitutionService = Depends(get_admin_institution_service),
):
    """
    Update institution status

    **Requires:** Admin role

    **Path Parameters:**
    - institution_id: Institution UUID

    **Request Body:**
    - status: New status (draft, published, archived)

    **Returns:** Updated institution

    **Common Use Cases:**
    - Publish draft: Change status from "draft" to "published"
    - Unpublish: Change status from "published" to "draft"
    - Archive: Change status to "archived"
    """
    return await service.update_status(institution_id, data.status.value)


# ========== PROGRAM MANAGEMENT ==========


@router.post(
    "/programs",
    response_model=ProgramAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new program",
    description="Create a new program (admin only)"
)
async def create_program(
    data: ProgramCreateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    Create a new program

    **Requires:** Admin role

    **Request Body:**
    - institution_id (required): Institution UUID
    - name (required): Program name
    - degree_type (required): Degree type (undergraduate, nd, hnd, pre_degree, jupeb, postgraduate)
    - duration_years (required): Program duration (1-10 years)
    - tuition_per_year (required): Annual tuition in Naira
    - mode: Study mode (full_time, part_time, online, hybrid) - defaults to full_time
    - All other fields optional

    **Returns:** Created program with institution details
    """
    return await service.create_program(data)


@router.get(
    "/programs",
    response_model=Dict,
    summary="List all programs",
    description="List all programs including drafts and archived (admin only)"
)
async def list_programs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    institution_id: Optional[str] = Query(None, description="Filter by institution ID"),
    degree_type: Optional[str] = Query(None, description="Filter by degree type"),
    status_filter: Optional[str] = Query(None, description="Filter by status (draft, published, archived)"),
    search: Optional[str] = Query(None, description="Search in program name"),
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    List all programs with admin filters

    **Requires:** Admin role

    **Query Parameters:**
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - institution_id: Filter by institution UUID
    - degree_type: Filter by degree type (undergraduate, nd, hnd, etc.)
    - status_filter: Filter by status (draft, published, archived)
    - search: Search in program name

    **Returns:** List of programs with institution details and pagination metadata

    **Note:** Unlike public endpoint, this returns ALL programs including drafts and archived
    """
    return await service.list_programs(
        page=page,
        page_size=page_size,
        institution_id=institution_id,
        degree_type=degree_type,
        status_filter=status_filter,
        search=search
    )


@router.get(
    "/programs/{program_id}",
    response_model=ProgramAdminResponse,
    summary="Get program by ID",
    description="Get single program with all fields (admin only)"
)
async def get_program(
    program_id: str,
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    Get single program by ID

    **Requires:** Admin role

    **Path Parameters:**
    - program_id: Program UUID

    **Returns:** Program with all admin fields and institution details
    """
    return await service.get_program(program_id)


@router.put(
    "/programs/{program_id}",
    response_model=ProgramAdminResponse,
    summary="Update program",
    description="Update program (admin only)"
)
async def update_program(
    program_id: str,
    data: ProgramUpdateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    Update program

    **Requires:** Admin role

    **Path Parameters:**
    - program_id: Program UUID

    **Request Body:**
    - All fields optional (only provided fields will be updated)

    **Returns:** Updated program with institution details
    """
    return await service.update_program(program_id, data)


@router.delete(
    "/programs/{program_id}",
    response_model=Dict,
    summary="Delete program",
    description="Soft delete program (admin only)"
)
async def delete_program(
    program_id: str,
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    Soft delete program (sets deleted_at timestamp)

    **Requires:** Admin role

    **Path Parameters:**
    - program_id: Program UUID

    **Returns:** Success message

    **Note:** This is a soft delete. Program is not removed from database,
    just marked as deleted with deleted_at timestamp.
    """
    return await service.delete_program(program_id)


@router.patch(
    "/programs/{program_id}/status",
    response_model=ProgramAdminResponse,
    summary="Update program status",
    description="Publish, unpublish, or archive program (admin only)"
)
async def update_program_status(
    program_id: str,
    data: StatusUpdateRequest,
    current_user=Depends(get_current_admin_user),
    service: AdminProgramService = Depends(get_admin_program_service),
):
    """
    Update program status

    **Requires:** Admin role

    **Path Parameters:**
    - program_id: Program UUID

    **Request Body:**
    - status: New status (draft, published, archived)

    **Returns:** Updated program with institution details

    **Common Use Cases:**
    - Publish draft: Change status from "draft" to "published"
    - Unpublish: Change status from "published" to "draft"
    - Archive: Change status to "archived"
    """
    return await service.update_program_status(program_id, data.status.value)


# ========== HEALTH CHECK ==========


@router.get(
    "/health",
    response_model=Dict,
    summary="Admin health check",
    description="Check admin access (admin only)"
)
async def admin_health_check(
    current_user=Depends(get_current_admin_user),
):
    """
    Admin health check

    **Requires:** Admin role

    **Returns:** Success message with user info

    **Purpose:** Verify admin authentication is working
    """
    return {
        "status": "healthy",
        "message": "Admin access granted",
        "user_id": current_user.user.id,
        "user_email": current_user.user.email
    }
