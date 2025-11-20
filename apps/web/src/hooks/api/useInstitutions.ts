import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { Institution, InstitutionFilters, ProgramFilters, Program } from '@admitly/types';
import { mockInstitutions, mockPrograms } from '@/lib/mockData';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

// TEMPORARY: Use mock data flag (set to true until backend is running)
const USE_MOCK_DATA = false;

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
    queryKey: ['institutions', filters],
    queryFn: async () => {
      // TEMPORARY: Return mock data if flag is set
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Simple filtering on mock data
        let filteredInstitutions = [...mockInstitutions];

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredInstitutions = filteredInstitutions.filter(i =>
            i.name.toLowerCase().includes(searchLower) ||
            i.short_name?.toLowerCase().includes(searchLower)
          );
        }

        if (filters.state && filters.state.length > 0) {
          filteredInstitutions = filteredInstitutions.filter(i =>
            filters.state?.includes(i.state)
          );
        }

        if (filters.type && filters.type.length > 0) {
          filteredInstitutions = filteredInstitutions.filter(i =>
            filters.type?.includes(i.type)
          );
        }

        return {
          data: filteredInstitutions,
          pagination: {
            page: filters.page || 1,
            page_size: filters.page_size || 20,
            total: filteredInstitutions.length,
            total_pages: Math.ceil(filteredInstitutions.length / (filters.page_size || 20)),
            has_prev: (filters.page || 1) > 1,
            has_next: (filters.page || 1) < Math.ceil(filteredInstitutions.length / (filters.page_size || 20))
          }
        };
      }

      return apiClient.getInstitutions(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // TEMPORARY: Return mock data if flag is set
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const institution = mockInstitutions.find(i => i.slug === slug);
        if (!institution) throw new Error('Institution not found');
        return institution;
      }

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
      // TEMPORARY: Return mock data if flag is set
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Find institution to get its ID
        const institution = mockInstitutions.find(i => i.slug === slug);
        if (!institution) throw new Error('Institution not found');

        // Filter programs by institution_id
        let filteredPrograms = mockPrograms.filter(p => p.institution_id === institution.id);

        // Apply additional filters
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPrograms = filteredPrograms.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.field_of_study?.toLowerCase().includes(searchLower)
          );
        }

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

      return apiClient.getInstitutionPrograms(slug, filters);
    },
    enabled: !!slug, // Only fetch if slug is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
