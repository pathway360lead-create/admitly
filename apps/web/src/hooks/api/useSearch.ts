import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { Institution, Program, SearchFilters } from '@admitly/types';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

/**
 * Global search across institutions and programs
 * @param query - Search query string
 * @param filters - Additional search filters
 * @param options - React Query options
 */
export function useSearch(
  query: string,
  filters: Omit<SearchFilters, 'q'> = {},
  options?: Omit<
    UseQueryOptions<{ institutions: Institution[]; programs: Program[]; total_results: number }>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => apiClient.search(query, filters),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes - search results change more frequently
    ...options,
  });
}

/**
 * Autocomplete suggestions for search
 * @param query - Search query string
 * @param limit - Maximum number of suggestions (default: 10)
 * @param options - React Query options
 */
export function useAutocomplete(
  query: string,
  limit: number = 10,
  options?: Omit<
    UseQueryOptions<Array<{ text: string; type: 'program' | 'institution' }>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['autocomplete', query, limit],
    queryFn: () => apiClient.autocomplete(query, limit),
    enabled: query.length >= 2, // Only autocomplete if query is at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute - autocomplete needs to be fresh
    ...options,
  });
}
