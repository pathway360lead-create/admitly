"""
Search API Schemas
Pydantic models for search requests and responses
"""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


# ===== Search Request Schemas =====

class SearchFilters(BaseModel):
    """Filters for search queries"""
    # Institution filters
    institution_type: Optional[List[str]] = None
    state: Optional[List[str]] = None
    verified: Optional[bool] = None

    # Program filters
    degree_type: Optional[List[str]] = None
    field_of_study: Optional[List[str]] = None
    mode: Optional[List[str]] = None
    min_tuition: Optional[int] = None
    max_tuition: Optional[int] = None
    min_cutoff: Optional[int] = None
    max_cutoff: Optional[int] = None

    model_config = {"from_attributes": True}


class SearchParams(BaseModel):
    """Search query parameters"""
    q: str = Field(..., min_length=2, description="Search query (minimum 2 characters)")
    type: Literal["all", "institutions", "programs"] = Field(
        default="all",
        description="Type of entities to search"
    )
    filters: Optional[SearchFilters] = None
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=50, description="Items per page (max 50)")

    model_config = {"from_attributes": True}


class AutocompleteParams(BaseModel):
    """Autocomplete query parameters"""
    q: str = Field(..., min_length=2, description="Search query (minimum 2 characters)")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum results (max 50)")

    model_config = {"from_attributes": True}


# ===== Search Result Item Schemas =====

class InstitutionSearchResult(BaseModel):
    """Search result for an institution"""
    id: str
    slug: str
    name: str
    short_name: Optional[str] = None
    type: str
    state: str
    city: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    verified: bool
    accreditation_status: Optional[str] = None
    program_count: int = 0
    description: Optional[str] = None
    formatted: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Highlighted search matches",
        alias="_formatted"
    )

    model_config = {"from_attributes": True, "populate_by_name": True}


class ProgramSearchResult(BaseModel):
    """Search result for a program"""
    id: str
    slug: str
    name: str
    degree_type: str
    field_of_study: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    duration_years: Optional[float] = None
    duration_text: Optional[str] = None
    mode: Optional[str] = None
    tuition_annual: Optional[int] = None
    cutoff_score: Optional[int] = None
    institution_id: str
    institution_name: str
    institution_slug: str
    institution_state: str
    description: Optional[str] = None
    is_active: bool = True
    formatted: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Highlighted search matches",
        alias="_formatted"
    )

    model_config = {"from_attributes": True, "populate_by_name": True}


# ===== Search Response Schemas =====

class SearchResults(BaseModel):
    """Search results container"""
    institutions: List[InstitutionSearchResult] = []
    programs: List[ProgramSearchResult] = []
    total_results: int = 0

    model_config = {"from_attributes": True}


class PaginationMetadata(BaseModel):
    """Pagination metadata"""
    page: int
    page_size: int
    total: int
    total_pages: int
    has_prev: bool
    has_next: bool

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    """Complete search API response"""
    success: bool = True
    data: SearchResults
    pagination: PaginationMetadata
    query: str
    search_time_ms: Optional[float] = Field(
        default=None,
        description="Search execution time in milliseconds"
    )

    model_config = {"from_attributes": True}


# ===== Autocomplete Schemas =====

class AutocompleteSuggestion(BaseModel):
    """Single autocomplete suggestion"""
    type: Literal["institution", "program"]
    id: str
    name: str
    slug: str
    description: Optional[str] = None

    # Institution-specific fields
    institution_state: Optional[str] = None

    # Program-specific fields
    institution_name: Optional[str] = None
    degree_type: Optional[str] = None

    model_config = {"from_attributes": True}


class AutocompleteResponse(BaseModel):
    """Autocomplete API response"""
    success: bool = True
    data: List[AutocompleteSuggestion]
    query: str

    model_config = {"from_attributes": True}


# ===== Meilisearch Document Schemas (for indexing) =====

class InstitutionDocument(BaseModel):
    """Institution document for Meilisearch index"""
    id: str
    slug: str
    name: str
    short_name: Optional[str] = None
    type: str
    state: str
    city: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    verified: bool
    accreditation_status: Optional[str] = None
    program_count: int = 0
    description: Optional[str] = None
    status: str
    created_at: str

    model_config = {"from_attributes": True}


class ProgramDocument(BaseModel):
    """Program document for Meilisearch index"""
    id: str
    institution_id: str
    slug: str
    name: str
    degree_type: str
    field_of_study: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    duration_years: Optional[float] = None
    duration_text: Optional[str] = None
    mode: Optional[str] = None
    tuition_annual: Optional[int] = None
    cutoff_score: Optional[int] = None
    institution_name: str
    institution_slug: str
    institution_state: str
    description: Optional[str] = None
    status: str
    is_active: bool = True
    created_at: str

    model_config = {"from_attributes": True}
