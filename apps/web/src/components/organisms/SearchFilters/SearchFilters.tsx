import { FC, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
} from '@admitly/ui';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { NIGERIAN_STATES } from '@admitly/types';
import type {
  SearchFiltersProps,
  ProgramMode,
  AccreditationStatus,
} from './types';
import {
  FIELD_OF_STUDY_OPTIONS,
  DURATION_OPTIONS,
  TUITION_MIN,
  TUITION_MAX,
  TUITION_STEP,
  CUTOFF_MIN,
  CUTOFF_MAX,
  CUTOFF_STEP,
} from './types';

export const SearchFilters: FC<SearchFiltersProps> = ({
  filterType,
  onFilterChange,
  initialFilters,
  compact = false,
  className = '',
  resultsCount,
}) => {
  const {
    filters,
    setFilter,
    setMultipleFilters,
    clearFilter,
    clearAllFilters,
    getActiveFilterCount,
    hasActiveFilters,
  } = useSearchFilterStore();

  // Mobile collapse state
  const [isCollapsed, setIsCollapsed] = useState(compact);

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters) {
      setMultipleFilters(initialFilters);
    }
  }, [initialFilters, setMultipleFilters]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const activeFilterCount = getActiveFilterCount();
  const showInstitutionFilters = filterType === 'institutions' || filterType === 'all';
  const showProgramFilters = filterType === 'programs' || filterType === 'all';

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Institution type options
  const institutionTypeOptions = [
    { value: 'federal_university' as const, label: 'Federal University' },
    { value: 'state_university' as const, label: 'State University' },
    { value: 'private_university' as const, label: 'Private University' },
    { value: 'polytechnic' as const, label: 'Polytechnic' },
    { value: 'college_of_education' as const, label: 'College of Education' },
    { value: 'specialized' as const, label: 'Specialized Institution' },
    { value: 'jupeb_center' as const, label: 'JUPEB Center' },
  ];

  // Degree type options
  const degreeTypeOptions = [
    { value: 'undergraduate' as const, label: 'Undergraduate' },
    { value: 'postgraduate' as const, label: 'Postgraduate' },
    { value: 'nd' as const, label: 'National Diploma (ND)' },
    { value: 'hnd' as const, label: 'Higher National Diploma (HND)' },
    { value: 'pre_degree' as const, label: 'Pre-Degree' },
    { value: 'jupeb' as const, label: 'JUPEB' },
  ];

  // Program mode options
  const modeOptions: Array<{ value: ProgramMode; label: string }> = [
    { value: 'full_time', label: 'Full-Time' },
    { value: 'part_time', label: 'Part-Time' },
    { value: 'distance_learning', label: 'Distance Learning' },
    { value: 'sandwich', label: 'Sandwich' },
  ];

  // Accreditation status options
  const accreditationOptions: Array<{ value: AccreditationStatus; label: string }> = [
    { value: 'fully_accredited', label: 'Fully Accredited' },
    { value: 'provisionally_accredited', label: 'Provisionally Accredited' },
    { value: 'not_accredited', label: 'Not Accredited' },
  ];

  // Handle checkbox toggle for arrays
  const toggleArrayValue = <T,>(key: keyof typeof filters, value: T) => {
    const currentArray = (filters[key] as T[] | undefined) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    setFilter(key, newArray.length > 0 ? (newArray as any) : undefined);
  };

  return (
    <div className={`bg-background border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        {resultsCount !== undefined && (
          <p className="text-sm text-muted-foreground mt-2">
            {resultsCount} {resultsCount === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {/* Filters Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <Accordion type="multiple" defaultValue={['state', 'type', 'degree']}>
            {/* State Filter (Common) */}
            <AccordionItem value="state">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  State
                  {filters.state && <Badge variant="secondary">1</Badge>}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Select
                  value={filters.state || ''}
                  onValueChange={(value) =>
                    setFilter('state', (value as any) || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.state && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('state')}
                    className="w-full mt-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Institution Type Filter */}
            {showInstitutionFilters && (
              <AccordionItem value="type">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Institution Type
                    {filters.institutionType && filters.institutionType.length > 0 && (
                      <Badge variant="secondary">{filters.institutionType.length}</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {institutionTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${option.value}`}
                          checked={filters.institutionType?.includes(option.value) || false}
                          onCheckedChange={() =>
                            toggleArrayValue('institutionType', option.value)
                          }
                        />
                        <Label
                          htmlFor={`type-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Accreditation Status Filter */}
            {showInstitutionFilters && (
              <AccordionItem value="accreditation">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Accreditation Status
                    {filters.accreditationStatus && <Badge variant="secondary">1</Badge>}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {accreditationOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`accred-${option.value}`}
                          name="accreditation"
                          checked={filters.accreditationStatus === option.value}
                          onChange={() => setFilter('accreditationStatus', option.value)}
                          className="h-4 w-4 text-primary"
                        />
                        <Label
                          htmlFor={`accred-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                    {filters.accreditationStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter('accreditationStatus')}
                        className="w-full mt-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Verified Only Toggle */}
            {showInstitutionFilters && (
              <AccordionItem value="verified">
                <AccordionTrigger>Verified Only</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verified" className="text-sm font-normal">
                      Show only verified institutions
                    </Label>
                    <Switch
                      id="verified"
                      checked={filters.verified || false}
                      onCheckedChange={(checked) =>
                        setFilter('verified', checked || undefined)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Degree Type Filter */}
            {showProgramFilters && (
              <AccordionItem value="degree">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Degree Type
                    {filters.degreeType && filters.degreeType.length > 0 && (
                      <Badge variant="secondary">{filters.degreeType.length}</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {degreeTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`degree-${option.value}`}
                          checked={filters.degreeType?.includes(option.value) || false}
                          onCheckedChange={() =>
                            toggleArrayValue('degreeType', option.value)
                          }
                        />
                        <Label
                          htmlFor={`degree-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Program Mode Filter */}
            {showProgramFilters && (
              <AccordionItem value="mode">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Study Mode
                    {filters.mode && filters.mode.length > 0 && (
                      <Badge variant="secondary">{filters.mode.length}</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {modeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mode-${option.value}`}
                          checked={filters.mode?.includes(option.value) || false}
                          onCheckedChange={() => toggleArrayValue('mode', option.value)}
                        />
                        <Label
                          htmlFor={`mode-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Field of Study Filter */}
            {showProgramFilters && (
              <AccordionItem value="field">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Field of Study
                    {filters.fieldOfStudy && <Badge variant="secondary">1</Badge>}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Select
                    value={filters.fieldOfStudy || ''}
                    onValueChange={(value) =>
                      setFilter('fieldOfStudy', value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Fields" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Fields</SelectItem>
                      {FIELD_OF_STUDY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.fieldOfStudy && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('fieldOfStudy')}
                      className="w-full mt-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Tuition Range Filter */}
            {showProgramFilters && (
              <AccordionItem value="tuition">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Annual Tuition
                    {(filters.minTuition !== undefined ||
                      filters.maxTuition !== undefined) && (
                      <Badge variant="secondary">1</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {formatCurrency(filters.minTuition || TUITION_MIN)} -{' '}
                        {formatCurrency(filters.maxTuition || TUITION_MAX)}
                      </Label>
                      <Slider
                        min={TUITION_MIN}
                        max={TUITION_MAX}
                        step={TUITION_STEP}
                        value={[
                          filters.minTuition || TUITION_MIN,
                          filters.maxTuition || TUITION_MAX,
                        ]}
                        onValueChange={(values: number[]) => {
                          const [min, max] = values;
                          setFilter('minTuition', min > TUITION_MIN ? min : undefined);
                          setFilter('maxTuition', max < TUITION_MAX ? max : undefined);
                        }}
                        className="mt-2"
                      />
                    </div>
                    {(filters.minTuition !== undefined ||
                      filters.maxTuition !== undefined) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          clearFilter('minTuition');
                          clearFilter('maxTuition');
                        }}
                        className="w-full text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Duration Filter */}
            {showProgramFilters && (
              <AccordionItem value="duration">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    Duration
                    {filters.duration && filters.duration.length > 0 && (
                      <Badge variant="secondary">{filters.duration.length}</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {DURATION_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`duration-${option.value}`}
                          checked={filters.duration?.includes(option.value) || false}
                          onCheckedChange={() =>
                            toggleArrayValue('duration', option.value)
                          }
                        />
                        <Label
                          htmlFor={`duration-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* UTME Cutoff Range Filter */}
            {showProgramFilters && (
              <AccordionItem value="cutoff">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    UTME Cutoff
                    {(filters.minCutoff !== undefined ||
                      filters.maxCutoff !== undefined) && (
                      <Badge variant="secondary">1</Badge>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {filters.minCutoff || CUTOFF_MIN} -{' '}
                        {filters.maxCutoff || CUTOFF_MAX}
                      </Label>
                      <Slider
                        min={CUTOFF_MIN}
                        max={CUTOFF_MAX}
                        step={CUTOFF_STEP}
                        value={[
                          filters.minCutoff || CUTOFF_MIN,
                          filters.maxCutoff || CUTOFF_MAX,
                        ]}
                        onValueChange={(values: number[]) => {
                          const [min, max] = values;
                          setFilter('minCutoff', min > CUTOFF_MIN ? min : undefined);
                          setFilter('maxCutoff', max < CUTOFF_MAX ? max : undefined);
                        }}
                        className="mt-2"
                      />
                    </div>
                    {(filters.minCutoff !== undefined || filters.maxCutoff !== undefined) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          clearFilter('minCutoff');
                          clearFilter('maxCutoff');
                        }}
                        className="w-full text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
};

SearchFilters.displayName = 'SearchFilters';
