import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { Program, ProgramFilters } from '@admitly/types';
import { mockPrograms } from '@/lib/mockData';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

// TEMPORARY: Use mock data flag (set to true until backend is running)
const USE_MOCK_DATA = false;

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
      // TEMPORARY: Return mock data if flag is set
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Simple filtering on mock data
        let filteredPrograms = [...mockPrograms];

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPrograms = filteredPrograms.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
          );
        }

        // Note: state filtering not applicable for programs
        // Programs are filtered by institution, not directly by state

        return {
          data: filteredPrograms,
          pagination: {
            page: filters.page || 1,
            page_size: filters.page_size || 20,
            total: filteredPrograms.length,
            total_pages: Math.ceil(filteredPrograms.length / (filters.page_size || 20)),
            has_prev: (filters.page || 1) > 1,
            has_next: (filters.page || 1) < Math.ceil(filteredPrograms.length / (filters.page_size || 20))
          }
        };
      }

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
      // TEMPORARY: Return mock data if flag is set
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const program = mockPrograms.find(p => p.id === id);
        if (!program) throw new Error('Program not found');
        return program;
      }

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
