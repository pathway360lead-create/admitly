import { useProgram } from '@/hooks/api/usePrograms';
import { useInstitutionById } from '@/hooks/api/useInstitutions';
import type { Program, Institution } from '@admitly/types';

/**
 * Hook for a single comparison item
 * Uses the appropriate hook based on item type
 * 
 * @param id - Entity ID
 * @param type - 'program' or 'institution'
 * @param enabled - Whether to fetch
 */
export function useComparisonItem(
  id: string,
  type: 'program' | 'institution',
  enabled: boolean = true
) {
  // Use the appropriate hook based on type
  // Following Interface Segregation - each hook has single responsibility
  const programQuery = useProgram(id, {
    enabled: enabled && type === 'program',
  });
  
  const institutionQuery = useInstitutionById(id, {
    enabled: enabled && type === 'institution',
  });

  // Return the appropriate query based on type
  if (type === 'program') {
    return {
      data: programQuery.data as Program | undefined,
      isLoading: programQuery.isLoading,
      isError: programQuery.isError,
      error: programQuery.error as Error | null,
    };
  }
  
  return {
    data: institutionQuery.data as Institution | undefined,
    isLoading: institutionQuery.isLoading,
    isError: institutionQuery.isError,
    error: institutionQuery.error as Error | null,
  };
}
