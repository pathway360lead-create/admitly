import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Program, ProgramFilters } from '@admitly/types';

// Create API client instance
// Client imported from @/lib/api

/**
 * Get list of programs with filters
 * @param filters - Filter parameters (degree_type, field_of_study, search, etc.)
 * @param options - React Query options
 */
export function usePrograms(
  filters: ProgramFilters = {},
  options?: Omit<UseQueryOptions<{ data: Program[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  // Extract pagination params explicitly for queryKey
  // This ensures React Query properly detects page changes
  const { page = 1, page_size = 20, ...otherFilters } = filters;

  return useQuery({
    // Explicit queryKey structure - React Query compares each element
    // When page changes from 1 to 2, queryKey changes and triggers refetch
    queryKey: ['programs', page, page_size, otherFilters],
    queryFn: async () => {
      const result = await apiClient.getPrograms(filters);
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    // Keep previous data when fetching new page to prevent content flash
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Get single program by ID
 * @param id - Program ID
 * @param options - React Query options
 */
export function useProgram(
  id: string,
  options?: Omit<UseQueryOptions<Program>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      return apiClient.getProgramById(id);
    },
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 10 * 60 * 1000, // 10 minutes - detail pages change less often
    ...options,
  });
}

/**
 * Alias for useProgram - Get program detail with full information
 * @param id - Program ID
 * @param options - React Query options
 */
export function useProgramDetail(
  id: string,
  options?: Omit<UseQueryOptions<Program>, 'queryKey' | 'queryFn'>
) {
  return useProgram(id, options);
}
