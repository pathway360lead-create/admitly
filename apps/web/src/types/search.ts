/**
 * Search API Types
 * TypeScript interfaces matching backend search API schemas
 */

// ===== Search Request Types =====

export interface SearchFilters {
  // Institution filters
  institution_type?: string[];
  state?: string[];
  verified?: boolean;

  // Program filters
  degree_type?: string[];
  field_of_study?: string[];
  mode?: string[];
  min_tuition?: number;
  max_tuition?: number;
  min_cutoff?: number;
  max_cutoff?: number;
}

export type SearchType = 'all' | 'institutions' | 'programs';

export interface SearchParams {
  q: string;
  type?: SearchType;
  filters?: SearchFilters;
  page?: number;
  page_size?: number;
}

export interface AutocompleteParams {
  q: string;
  limit?: number;
}

// ===== Search Result Item Types =====

export interface InstitutionSearchResult {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  type: string;
  state: string;
  city: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  accreditation_status?: string;
  program_count: number;
  description?: string;
  _formatted?: Record<string, any>;
}

export interface ProgramSearchResult {
  id: string;
  slug: string;
  name: string;
  degree_type: string;
  field_of_study?: string;
  specialization?: string;
  qualification?: string;
  duration_years?: number;
  duration_text?: string;
  mode?: string;
  tuition_annual?: number;
  cutoff_score?: number;
  institution_id: string;
  institution_name: string;
  institution_slug: string;
  institution_state: string;
  description?: string;
  is_active: boolean;
  _formatted?: Record<string, any>;
}

// ===== Search Response Types =====

export interface SearchResults {
  institutions: InstitutionSearchResult[];
  programs: ProgramSearchResult[];
  total_results: number;
}

export interface PaginationMetadata {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResults;
  pagination: PaginationMetadata;
  query: string;
  search_time_ms?: number;
}

// ===== Autocomplete Types =====

export interface AutocompleteSuggestion {
  type: 'institution' | 'program';
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Institution-specific fields
  institution_state?: string;

  // Program-specific fields
  institution_name?: string;
  degree_type?: string;
}

export interface AutocompleteResponse {
  success: boolean;
  data: AutocompleteSuggestion[];
  query: string;
}

// ===== Helper Types for Frontend =====

/**
 * Unified search result item that can be either institution or program
 * Used for simplified rendering logic
 */
export type SearchResultItem =
  | (InstitutionSearchResult & { _type: 'institution' })
  | (ProgramSearchResult & { _type: 'program' });
