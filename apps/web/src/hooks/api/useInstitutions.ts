import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { Institution, InstitutionFilters, ProgramFilters, Program } from '@admitly/types';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

/**
 * Get list of institutions with filters
 * @param filters - Filter parameters (state, type, search, etc.)
 * @param options - React Query options
 */
export function useInstitutions(
  filters: InstitutionFilters = {},
  options?: Omit<UseQueryOptions<{ data: Institution[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['institutions', filters.page, filters.page_size, filters],
    queryFn: async () => {
      return apiClient.getInstitutions(filters);
    },
    staleTime: 1 * 60 * 1000, // 1 minute (reduced from 5 to ensure fresh pagination)
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

