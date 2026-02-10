from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from core.dependencies import get_supabase, get_admin_context
from schemas.deadlines import (
    DeadlineCreate, 
    DeadlineUpdate, 
    DeadlineResponse, 
    DeadlineType, 
    DeadlinePriority
)
from supabase import Client

router = APIRouter(prefix="/api/v1/deadlines", tags=["deadlines"])

# --- PUBLIC ENDPOINTS ---

@router.get("/", response_model=List[DeadlineResponse])
async def list_deadlines(
    type: Optional[DeadlineType] = None,
    priority: Optional[DeadlinePriority] = None,
    from_date: Optional[datetime] = None,
    limit: int = 50,
    offset: int = 0,
    supabase: Client = Depends(get_supabase)
):
    """
    List deadlines with optional filtering.
    """
    query = supabase.table("deadlines").select("*")
    
    if type:
        query = query.eq("type", type.value)
    if priority:
        query = query.eq("priority", priority.value)
    if from_date:
        query = query.gte("end_date", from_date.isoformat())
        
    # Default sort by end_date ascending (closest deadline first)
    query = query.order("end_date", desc=False).range(offset, offset + limit - 1)
    
    result = query.execute()
    return result.data

@router.get("/upcoming", response_model=List[DeadlineResponse])
async def get_upcoming_deadlines(
    limit: int = 5,
    supabase: Client = Depends(get_supabase)
):
    """
    Get top N upcoming deadlines (closing soon).
    """
    now = datetime.now().isoformat()
    result = supabase.table("deadlines")\
        .select("*")\
        .gt("end_date", now)\
        .order("end_date", desc=False)\
        .limit(limit)\
        .execute()
        
    return result.data

@router.get("/{deadline_id}", response_model=DeadlineResponse)
async def get_deadline(
    deadline_id: UUID,
    supabase: Client = Depends(get_supabase)
):
    """
    Get a specific deadline.
    """
    result = supabase.table("deadlines").select("*").eq("id", str(deadline_id)).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Deadline not found")
        
    return result.data[0]

# --- ADMIN ENDPOINTS ---

@router.post("/", response_model=DeadlineResponse, status_code=status.HTTP_201_CREATED)
async def create_deadline(
    deadline: DeadlineCreate,
    admin_context = Depends(get_admin_context) # Ensures admin auth
):
    """
    Create a new deadline (Admin only).
    """
    admin_user, supabase = admin_context
    
    # Prepare data for insertion
    deadline_data = deadline.model_dump()
    deadline_data["created_by"] = admin_user.user.id if hasattr(admin_user, 'user') else admin_user.id
    
    # Supabase/Postgrest requires ISO formatted strings for timestamptz
    # Pydantic models have datetime objects
    if deadline_data.get("start_date"):
        deadline_data["start_date"] = deadline_data["start_date"].isoformat()
    
    deadline_data["end_date"] = deadline_data["end_date"].isoformat()
    
    if deadline_data.get("screening_date"):
        deadline_data["screening_date"] = deadline_data["screening_date"].isoformat()

    try:
        result = supabase.table("deadlines").insert(deadline_data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{deadline_id}", response_model=DeadlineResponse)
async def update_deadline(
    deadline_id: UUID,
    deadline_update: DeadlineUpdate,
    admin_context = Depends(get_admin_context)
):
    """
    Update a deadline (Admin only).
    """
    _, supabase = admin_context
    
    # Filter out None values
    update_data = {k: v for k, v in deadline_update.model_dump().items() if v is not None}
    
    # Serialize datetime objects to strings for Supabase
    for key, value in update_data.items():
        if isinstance(value, datetime):
            update_data[key] = value.isoformat()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
        
    try:
        result = supabase.table("deadlines").update(update_data).eq("id", str(deadline_id)).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Deadline not found")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deadline(
    deadline_id: UUID,
    admin_context = Depends(get_admin_context)
):
    """
    Delete a deadline (Admin only).
    """
    _, supabase = admin_context
    
    try:
        result = supabase.table("deadlines").delete().eq("id", str(deadline_id)).execute()
        
        # Supabase delete returns the deleted rows. If empty, it wasn't found (or RLS hidden it).
        if not result.data:
            # We could return 404, but for delete 204 is often acceptable even if idempotent.
            # But strictly, if ID didn't exist, we might want to know.
            pass 
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
