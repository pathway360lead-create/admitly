import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createClient } from '@admitly/api-client';
import type { ApplicationWindow, DeadlineFilters } from '@admitly/types';

// Create API client instance
const apiClient = createClient(import.meta.env.VITE_API_URL || 'http://localhost:8000');

/**
 * Get application deadlines with filters
 * @param filters - Filter parameters (status, institution_id, program_id, dates)
 * @param options - React Query options
 */
export function useDeadlines(
  filters: DeadlineFilters = {},
  options?: Omit<UseQueryOptions<{ data: ApplicationWindow[]; pagination: any }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['deadlines', filters],
    queryFn: () => apiClient.getDeadlines(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get deadline calendar view for a specific month
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2025)
 * @param options - React Query options
 */
export function useDeadlineCalendar(
  month: number,
  year: number,
  options?: Omit<
    UseQueryOptions<{
      month: number;
      year: number;
      events: Array<{
        date: string;
        events: Array<{
          type: string;
          institution: string;
          program: string;
        }>;
      }>;
    }>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['deadline-calendar', month, year],
    queryFn: () => apiClient.getDeadlineCalendar(month, year),
    enabled: month >= 1 && month <= 12 && year >= 2020, // Validate month and year
    staleTime: 30 * 60 * 1000, // 30 minutes - calendar view is more static
    ...options,
  });
}
