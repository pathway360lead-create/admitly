import { useQueries } from '@tanstack/react-query';
import { useComparisonStore } from '@/stores/comparisonStore';
import { apiClient } from '@/lib/api';
import type { Program, Institution } from '@admitly/types';

interface ComparisonData {
    programs: Array<{ id: string; type: 'program'; data?: Program }>;
    institutions: Array<{ id: string; type: 'institution'; data?: Institution }>;
    isLoading: boolean;
    hasError: boolean;
}

/**
 * Hook to fetch data for all items in the comparison store
 * Uses useQueries to properly handle dynamic number of queries without violating hooks rules
 */
export function useComparisonData(): ComparisonData {
    const { items } = useComparisonStore();

    // Create query configurations for all items
    const queryConfigs = items.map((item) => ({
        queryKey: ['comparison', item.type, item.id],
        queryFn: async () => {
            if (item.type === 'program') {
                return apiClient.getProgramById(item.id);
            } else {
                return apiClient.getInstitution(item.id);
            }
        },
        enabled: true,
        staleTime: 10 * 60 * 1000, // 10 minutes
        meta: { itemType: item.type, itemId: item.id },
    }));

    // Use useQueries for dynamic number of queries
    const results = useQueries({ queries: queryConfigs });

    // Process results to separate programs and institutions
    const programs: Array<{ id: string; type: 'program'; data?: Program }> = [];
    const institutions: Array<{ id: string; type: 'institution'; data?: Institution }> = [];

    results.forEach((result, index) => {
        const item = items[index];
        if (item.type === 'program') {
            programs.push({
                id: item.id,
                type: 'program',
                data: result.data as Program | undefined,
            });
        } else {
            institutions.push({
                id: item.id,
                type: 'institution',
                data: result.data as Institution | undefined,
            });
        }
    });

    // Check loading and error states
    const isLoading = results.some((r) => r.isLoading);
    const hasError = results.some((r) => r.isError);

    return {
        programs,
        institutions,
        isLoading,
        hasError,
    };
}
