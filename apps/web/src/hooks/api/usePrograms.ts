import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { Program, ProgramFilters } from '@admitly/types';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

/**
 * Get list of programs with filters
 * @param filters - Filter parameters (degree_type, field_of_study, search, etc.)
 * @param options - React Query options
 */
export function usePrograms(
  filters: ProgramFilters = {},
  options?: Omit<UseQueryOptions<{ data: Program[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: async () => {
      return apiClient.getPrograms(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
