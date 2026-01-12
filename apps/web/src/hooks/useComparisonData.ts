import { useComparisonStore } from '@/stores/comparisonStore';
import { useComparisonItem } from '@/hooks/useComparisonItem';
import type { Program, Institution } from '@admitly/types';

interface ComparisonItemWithData {
    id: string;
    type: 'program' | 'institution';
    data?: Program | Institution;
}

interface UseComparisonDataReturn {
    programs: ComparisonItemWithData[];
    institutions: ComparisonItemWithData[];
    isLoading: boolean;
    hasError: boolean;
}

/**
 * Hook to fetch data for all items in the comparison store
 * Fetches real data from the backend API for each comparison item
 */
export function useComparisonData(): UseComparisonDataReturn {
    const { items } = useComparisonStore();

    // Fetch data for each item using useComparisonItem hook
    const itemsWithQueries = items.map((item) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const query = useComparisonItem(item.id, item.type, true);
        return {
            ...item,
            data: query.data,
            isLoading: query.isLoading,
            isError: query.isError,
        };
    });

    // Separate programs and institutions
    const programs = itemsWithQueries
        .filter((item) => item.type === 'program')
        .map((item) => ({
            id: item.id,
            type: item.type as 'program',
            data: item.data as Program | undefined,
        }));

    const institutions = itemsWithQueries
        .filter((item) => item.type === 'institution')
        .map((item) => ({
            id: item.id,
            type: item.type as 'institution',
            data: item.data as Institution | undefined,
        }));

    // Check if any items are still loading
    const isLoading = itemsWithQueries.some((item) => item.isLoading);

    // Check if any items have errors
    const hasError = itemsWithQueries.some((item) => item.isError);

    return {
        programs,
        institutions,
        isLoading,
        hasError,
    };
}
