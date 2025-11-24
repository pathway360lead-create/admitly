import axios from 'axios';
import type {
  SearchParams,
  SearchResponse,
  AutocompleteParams,
  AutocompleteResponse,
} from '@/types/search';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Search API Methods =====

/**
 * Global search across institutions and programs
 * @param params - Search parameters including query, filters, and pagination
 * @returns Search results with institutions and programs
 */
export async function search(params: SearchParams): Promise<SearchResponse> {
  const { q, type = 'all', filters, page = 1, page_size = 20 } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    q,
    type,
    page: page.toString(),
    page_size: page_size.toString(),
  });

  // Add filters if provided
  if (filters) {
    if (filters.institution_type?.length) {
      queryParams.append('institution_type', filters.institution_type.join(','));
    }
    if (filters.state?.length) {
      queryParams.append('state', filters.state.join(','));
    }
    if (filters.verified !== undefined) {
      queryParams.append('verified', filters.verified.toString());
    }
    if (filters.degree_type?.length) {
      queryParams.append('degree_type', filters.degree_type.join(','));
    }
    if (filters.field_of_study?.length) {
      queryParams.append('field_of_study', filters.field_of_study.join(','));
    }
    if (filters.mode?.length) {
      queryParams.append('mode', filters.mode.join(','));
    }
    if (filters.min_tuition !== undefined) {
      queryParams.append('min_tuition', filters.min_tuition.toString());
    }
    if (filters.max_tuition !== undefined) {
      queryParams.append('max_tuition', filters.max_tuition.toString());
    }
    if (filters.min_cutoff !== undefined) {
      queryParams.append('min_cutoff', filters.min_cutoff.toString());
    }
    if (filters.max_cutoff !== undefined) {
      queryParams.append('max_cutoff', filters.max_cutoff.toString());
    }
  }

  const response = await api.get<SearchResponse>(`/api/v1/search?${queryParams.toString()}`);
  return response.data;
}

/**
 * Autocomplete search suggestions
 * @param params - Autocomplete parameters (query and limit)
 * @returns Autocomplete suggestions for institutions and programs
 */
export async function autocomplete(
  params: AutocompleteParams
): Promise<AutocompleteResponse> {
  const { q, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    q,
    limit: limit.toString(),
  });

  const response = await api.get<AutocompleteResponse>(
    `/api/v1/search/autocomplete?${queryParams.toString()}`
  );
  return response.data;
}
