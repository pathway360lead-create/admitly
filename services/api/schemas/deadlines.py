from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, UUID4, ConfigDict

# Enums
class DeadlineType(str, Enum):
    exam = 'exam'
    admission = 'admission'
    scholarship = 'scholarship'
    event = 'event'
    other = 'other'

class DeadlinePriority(str, Enum):
    high = 'high'
    medium = 'medium'
    low = 'low'

class RelatedEntityType(str, Enum):
    program = 'program'
    institution = 'institution'
    none = 'none'

# Base Model
class DeadlineBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: datetime
    screening_date: Optional[datetime] = None
    type: DeadlineType = DeadlineType.other
    priority: DeadlinePriority = DeadlinePriority.medium
    related_entity_type: RelatedEntityType = RelatedEntityType.none
    related_entity_id: Optional[UUID4] = None
    link: Optional[str] = None

# Create/Update Models
class DeadlineCreate(DeadlineBase):
    pass

class DeadlineUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    screening_date: Optional[datetime] = None
    type: Optional[DeadlineType] = None
    priority: Optional[DeadlinePriority] = None
    related_entity_type: Optional[RelatedEntityType] = None
    related_entity_id: Optional[UUID4] = None
    link: Optional[str] = None

# Response Model
class DeadlineResponse(DeadlineBase):
    id: UUID4
    created_by: Optional[UUID4]
    created_at: datetime
    updated_at: datetime
    
    # Optional expanded data (if joined in query)
    program: Optional[dict] = None
    institution: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)
