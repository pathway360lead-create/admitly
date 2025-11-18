import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InstitutionType,
  DegreeType,
  NigerianState,
} from '@admitly/types';

// ============================================================================
// Filter State Types
// ============================================================================

export type ProgramMode = 'full_time' | 'part_time' | 'distance_learning' | 'sandwich';
export type AccreditationStatus = 'fully_accredited' | 'provisionally_accredited' | 'not_accredited';

export interface FilterState {
  // Common filters
  search?: string;
  state?: NigerianState;

  // Institution filters
  institutionType?: InstitutionType[];
  accreditationStatus?: AccreditationStatus;
  verified?: boolean;

  // Program filters
  degreeType?: DegreeType[];
  mode?: ProgramMode[];
  fieldOfStudy?: string;
  minTuition?: number;
  maxTuition?: number;
  duration?: number[];
  minCutoff?: number;
  maxCutoff?: number;
}

export interface SearchFilterStore {
  // Filter state
  filters: FilterState;

  // Filter actions
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setMultipleFilters: (updates: Partial<FilterState>) => void;
  clearFilter: (key: keyof FilterState) => void;
  clearAllFilters: () => void;

  // Utility methods
  getActiveFilterCount: () => number;
  hasActiveFilters: () => boolean;
  getFiltersForAPI: (filterType: 'institutions' | 'programs' | 'all') => Record<string, any>;

  // URL synchronization helpers
  filtersToURLParams: () => URLSearchParams;
  filtersFromURLParams: (params: URLSearchParams) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count active filters (non-empty values)
 */
const countActiveFilters = (filters: FilterState): number => {
  let count = 0;

  Object.entries(filters).forEach(([_, value]) => {
    if (value === undefined || value === null) return;

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length > 0) count++;
    }
    // Handle numbers (including 0)
    else if (typeof value === 'number') {
      count++;
    }
    // Handle booleans
    else if (typeof value === 'boolean') {
      count++;
    }
    // Handle strings
    else if (typeof value === 'string' && value.trim() !== '') {
      count++;
    }
  });

  return count;
};

/**
 * Convert filters to API-compatible format
 */
const filtersToAPIFormat = (
  filters: FilterState,
  filterType: 'institutions' | 'programs' | 'all'
): Record<string, any> => {
  const apiFilters: Record<string, any> = {};

  // Common filters
  if (filters.search) apiFilters.search = filters.search;
  if (filters.state) apiFilters.state = filters.state;

  // Institution-specific filters
  if (filterType === 'institutions' || filterType === 'all') {
    if (filters.institutionType && filters.institutionType.length > 0) {
      // API typically accepts single type, use first one or join with comma if API supports it
      apiFilters.type = filters.institutionType[0];
    }
    if (filters.accreditationStatus) {
      apiFilters.accreditation_status = filters.accreditationStatus;
    }
    if (filters.verified !== undefined) {
      apiFilters.verified = filters.verified;
    }
  }

  // Program-specific filters
  if (filterType === 'programs' || filterType === 'all') {
    if (filters.degreeType && filters.degreeType.length > 0) {
      // API typically accepts single degree_type, use first one
      apiFilters.degree_type = filters.degreeType[0];
    }
    if (filters.mode && filters.mode.length > 0) {
      // API typically accepts single mode, use first one
      apiFilters.mode = filters.mode[0];
    }
    if (filters.fieldOfStudy) {
      apiFilters.field_of_study = filters.fieldOfStudy;
    }
    if (filters.minTuition !== undefined) {
      apiFilters.min_tuition = filters.minTuition;
    }
    if (filters.maxTuition !== undefined) {
      apiFilters.max_tuition = filters.maxTuition;
    }
    if (filters.duration && filters.duration.length > 0) {
      // Convert duration array to min/max
      apiFilters.min_duration = Math.min(...filters.duration);
      apiFilters.max_duration = Math.max(...filters.duration);
    }
    if (filters.minCutoff !== undefined) {
      apiFilters.min_cutoff = filters.minCutoff;
    }
    if (filters.maxCutoff !== undefined) {
      apiFilters.max_cutoff = filters.maxCutoff;
    }
  }

  return apiFilters;
};

/**
 * Convert filters to URL search parameters
 */
const filtersToURL = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Handle arrays (convert to comma-separated string)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    }
    // Handle all other types
    else {
      params.set(key, String(value));
    }
  });

  return params;
};

/**
 * Parse filters from URL search parameters
 */
const filtersFromURL = (params: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};

  // Parse search
  const search = params.get('search');
  if (search) filters.search = search;

  // Parse state
  const state = params.get('state');
  if (state) filters.state = state as NigerianState;

  // Parse institutionType (array)
  const institutionType = params.get('institutionType');
  if (institutionType) {
    filters.institutionType = institutionType.split(',') as InstitutionType[];
  }

  // Parse accreditationStatus
  const accreditationStatus = params.get('accreditationStatus');
  if (accreditationStatus) {
    filters.accreditationStatus = accreditationStatus as AccreditationStatus;
  }

  // Parse verified (boolean)
  const verified = params.get('verified');
  if (verified) filters.verified = verified === 'true';

  // Parse degreeType (array)
  const degreeType = params.get('degreeType');
  if (degreeType) {
    filters.degreeType = degreeType.split(',') as DegreeType[];
  }

  // Parse mode (array)
  const mode = params.get('mode');
  if (mode) {
    filters.mode = mode.split(',') as ProgramMode[];
  }

  // Parse fieldOfStudy
  const fieldOfStudy = params.get('fieldOfStudy');
  if (fieldOfStudy) filters.fieldOfStudy = fieldOfStudy;

  // Parse tuition range (numbers)
  const minTuition = params.get('minTuition');
  if (minTuition) filters.minTuition = Number(minTuition);

  const maxTuition = params.get('maxTuition');
  if (maxTuition) filters.maxTuition = Number(maxTuition);

  // Parse duration (array of numbers)
  const duration = params.get('duration');
  if (duration) {
    filters.duration = duration.split(',').map(Number);
  }

  // Parse cutoff range (numbers)
  const minCutoff = params.get('minCutoff');
  if (minCutoff) filters.minCutoff = Number(minCutoff);

  const maxCutoff = params.get('maxCutoff');
  if (maxCutoff) filters.maxCutoff = Number(maxCutoff);

  return filters;
};

// ============================================================================
// Zustand Store
// ============================================================================

export const useSearchFilterStore = create<SearchFilterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: {},

      // Set a single filter
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },

      // Set multiple filters at once
      setMultipleFilters: (updates) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...updates,
          },
        }));
      },

      // Clear a specific filter
      clearFilter: (key) => {
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        });
      },

      // Clear all filters
      clearAllFilters: () => {
        set({ filters: {} });
      },

      // Get count of active filters
      getActiveFilterCount: () => {
        return countActiveFilters(get().filters);
      },

      // Check if any filters are active
      hasActiveFilters: () => {
        return countActiveFilters(get().filters) > 0;
      },

      // Get filters formatted for API requests
      getFiltersForAPI: (filterType) => {
        return filtersToAPIFormat(get().filters, filterType);
      },

      // Convert filters to URL parameters
      filtersToURLParams: () => {
        return filtersToURL(get().filters);
      },

      // Load filters from URL parameters
      filtersFromURLParams: (params) => {
        const parsedFilters = filtersFromURL(params);
        set({ filters: parsedFilters });
      },
    }),
    {
      name: 'search-filter-storage',
      // Optionally, you can customize what gets persisted
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
