// API request/response types

import type { Institution, Program } from './models';

// Pagination
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// Search
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

// API Errors
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
