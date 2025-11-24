import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { search, autocomplete } from '@/lib/api';
import type {
  SearchResponse,
  SearchParams,
  AutocompleteResponse,
} from '@/types/search';

/**
 * Global search across institutions and programs
 * @param params - Search parameters including query, filters, and pagination
 * @param options - React Query options
 */
export function useSearch(
  params: SearchParams,
  options?: Omit<UseQueryOptions<SearchResponse>, 'queryKey' | 'queryFn'>
) {
  const { q } = params;

  return useQuery({
    queryKey: ['search', params],
    queryFn: () => search(params),
    enabled: q.length >= 2, // Only search if query is at least 2 characters
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
  options?: Omit<UseQueryOptions<AutocompleteResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['autocomplete', query, limit],
    queryFn: () => autocomplete({ q: query, limit }),
    enabled: query.length >= 2, // Only autocomplete if query is at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute - autocomplete needs to be fresh
    ...options,
  });
}
