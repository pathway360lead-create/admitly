import type {
  InstitutionType,
  DegreeType,
  NigerianState,
} from '@admitly/types';

export type FilterType = 'institutions' | 'programs' | 'all';

export type ProgramMode = 'full_time' | 'part_time' | 'distance_learning' | 'sandwich';

export type AccreditationStatus =
  | 'fully_accredited'
  | 'provisionally_accredited'
  | 'not_accredited';

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

export interface SearchFiltersProps {
  filterType: FilterType;
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  compact?: boolean;
  className?: string;
  resultsCount?: number;
}

// Field of study categories matching Nigerian education system
export const FIELD_OF_STUDY_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'education', label: 'Education' },
  { value: 'law', label: 'Law' },
  { value: 'medicine', label: 'Medicine & Health Sciences' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'management', label: 'Management Sciences' },
  { value: 'environmental', label: 'Environmental Sciences' },
  { value: 'technology', label: 'Technology' },
] as const;

// Duration options (in years)
export const DURATION_OPTIONS = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: '6 years' },
] as const;

// Tuition range constants (in Naira)
export const TUITION_MIN = 0;
export const TUITION_MAX = 5000000;
export const TUITION_STEP = 50000;

// UTME cutoff range constants
export const CUTOFF_MIN = 100;
export const CUTOFF_MAX = 400;
export const CUTOFF_STEP = 10;
