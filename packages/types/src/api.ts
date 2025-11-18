// API request/response types matching specs/api-specification.md

// ============================================================================
// Standard Response Wrappers
// ============================================================================

/**
 * Standard API success response wrapper
 * Matches API spec lines 50-61
 */
export interface APIResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

/**
 * Paginated API response wrapper
 * Matches API spec lines 64-83
 */
export interface APIPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

/**
 * Standard API error response
 * Matches API spec lines 86-104
 */
export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

// ============================================================================
// Request Parameter Types
// ============================================================================

/**
 * Basic pagination parameters
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/**
 * Institution filter parameters
 * Matches API spec lines 127-137
 */
export interface InstitutionFilters extends PaginationParams {
  type?: 'federal_university' | 'state_university' | 'private_university' | 'polytechnic' | 'college_of_education' | 'specialized' | 'jupeb_center';
  state?: string;
  accreditation_status?: 'fully_accredited' | 'provisionally_accredited' | 'not_accredited';
  search?: string;
  sort?: 'name' | 'founded_year';
  order?: 'asc' | 'desc';
}

/**
 * Program filter parameters
 * Matches API spec lines 246-259
 */
export interface ProgramFilters extends PaginationParams {
  institution_id?: string;
  degree_type?: 'undergraduate' | 'postgraduate' | 'diploma' | 'certificate' | 'pre_degree';
  field_of_study?: string;
  mode?: 'full_time' | 'part_time' | 'distance_learning' | 'sandwich';
  min_duration?: number;
  max_duration?: number;
  search?: string;
  sort?: 'name' | 'tuition' | 'cutoff';
  order?: 'asc' | 'desc';
}

/**
 * Search filter parameters
 * Matches API spec lines 403-410
 */
export interface SearchFilters extends PaginationParams {
  q: string;
  type?: 'all' | 'institutions' | 'programs';
  filters?: Record<string, any>;
}

/**
 * Deadline filter parameters
 * Matches API spec lines 543-551
 */
export interface DeadlineFilters extends PaginationParams {
  status?: 'open' | 'closing_soon' | 'closed' | 'pending';
  institution_id?: string;
  program_id?: string;
  from_date?: string;
  to_date?: string;
}

/**
 * Create bookmark request
 * Matches API spec lines 736-742
 */
export interface CreateBookmarkRequest {
  entity_type: 'program' | 'institution';
  entity_id: string;
  notes?: string;
}

/**
 * Create alert request
 * Matches API spec lines 617-634
 */
export interface CreateAlertRequest {
  alert_type: 'deadline' | 'cutoff_update' | 'new_program';
  institution_ids?: string[];
  program_ids?: string[];
  states?: string[];
  degree_types?: string[];
  email_enabled?: boolean;
  push_enabled?: boolean;
}

/**
 * Compare programs request
 * Matches API spec lines 482-491
 */
export interface CompareProgramsRequest {
  program_ids: string[];
}

/**
 * Compare institutions request
 * Matches API spec lines 527-532
 */
export interface CompareInstitutionsRequest {
  institution_ids: string[];
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface SearchParams extends PaginationParams {
  q?: string;
  state?: string;
  type?: string;
  degree_type?: string;
  tuition_min?: number;
  tuition_max?: number;
  sort_by?: 'relevance' | 'name' | 'tuition' | 'cutoff';
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
  filters_applied: Record<string, any>;
}

export interface APIError {
  error: string;
  detail?: string;
  status_code: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}
