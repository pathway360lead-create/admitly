import { useQuery } from '@tanstack/react-query';
import { getDeadlines, getUpcomingDeadlines, type Deadline } from '@/lib/api';

export function useDeadlines(filters?: {
    type?: string;
    priority?: string;
    from_date?: string;
    limit?: number;
}) {
    return useQuery({
        queryKey: ['deadlines', filters],
        queryFn: () => getDeadlines(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useUpcomingDeadlines(limit: number = 10) {
    return useQuery({
        queryKey: ['deadlines', 'upcoming', limit],
        queryFn: () => getUpcomingDeadlines(limit),
        staleTime: 5 * 60 * 1000,
    });
}

export type { Deadline };
