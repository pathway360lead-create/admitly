import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Institution, InstitutionFilters, ProgramFilters, Program } from '@admitly/types';

// Create API client instance
// Client imported from @/lib/api

/**
 * Get list of institutions with filters
 * @param filters - Filter parameters (state, type, search, etc.)
 * @param options - React Query options
 */
export function useInstitutions(
  filters: InstitutionFilters = {},
  options?: Omit<UseQueryOptions<{ data: Institution[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  // Extract pagination params explicitly for queryKey
  // This ensures React Query properly detects page changes
  const { page = 1, page_size = 20, ...otherFilters } = filters;

  return useQuery({
    // Explicit queryKey structure - React Query compares each element
    // When page changes from 1 to 2, queryKey changes and triggers refetch
    queryKey: ['institutions', page, page_size, otherFilters],
    queryFn: async () => {
      return apiClient.getInstitutions(filters);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    // Keep previous data when fetching new page to prevent content flash
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Get single institution by slug
 * @param slug - Institution slug (e.g., 'unilag')
 * @param options - React Query options
 */
export function useInstitution(
  slug: string,
  options?: Omit<UseQueryOptions<Institution>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['institution', slug],
    queryFn: async () => {
      return apiClient.getInstitutionBySlug(slug);
    },
    enabled: !!slug, // Only fetch if slug is provided
    staleTime: 10 * 60 * 1000, // 10 minutes - detail pages change less often
    ...options,
  });
}

/**
 * Get programs offered by a specific institution
 * @param slug - Institution slug
 * @param filters - Program filter parameters
 * @param options - React Query options
 */
export function useInstitutionPrograms(
  slug: string,
  filters: ProgramFilters = {},
  options?: Omit<UseQueryOptions<{ data: Program[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['institution-programs', slug, filters],
    queryFn: async () => {
      return apiClient.getInstitutionPrograms(slug, filters);
    },
    enabled: !!slug, // Only fetch if slug is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get single institution by ID (UUID)
 * Used for comparison feature where we store entity IDs
 * @param id - Institution UUID
 * @param options - React Query options
 */
export function useInstitutionById(
  id: string,
  options?: Omit<UseQueryOptions<Institution>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['institution-by-id', id],
    queryFn: async () => {
      return apiClient.getInstitution(id);
    },
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 10 * 60 * 1000, // 10 minutes - detail pages change less often
    ...options,
  });
}
