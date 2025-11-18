import { FC, useState } from 'react';
import { ProgramCard } from '@/components/molecules/ProgramCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Badge } from '@admitly/ui';
import { usePrograms } from '@/hooks/api';
import { DegreeType } from '@admitly/types';
import { SlidersHorizontal } from 'lucide-react';

export const ProgramsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDegreeType, setSelectedDegreeType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxTuition, setMaxTuition] = useState<number>(Infinity);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Map frontend degree types to API degree types
  const mapDegreeType = (type: string): 'undergraduate' | 'postgraduate' | 'diploma' | 'certificate' | 'pre_degree' | undefined => {
    if (type === 'all') return undefined;
    // Map ND and HND to diploma
    if (type === 'nd' || type === 'hnd') return 'diploma';
    // Map JUPEB to pre_degree
    if (type === 'jupeb') return 'pre_degree';
    return type as 'undergraduate' | 'postgraduate' | 'diploma' | 'certificate' | 'pre_degree';
  };

  // Map frontend mode to API mode
  const mapMode = (mode: string): 'full_time' | 'part_time' | 'distance_learning' | 'sandwich' | undefined => {
    if (mode === 'all') return undefined;
    // Map online to distance_learning
    if (mode === 'online') return 'distance_learning';
    // Map hybrid to full_time (or handle as needed)
    if (mode === 'hybrid') return 'full_time';
    return mode as 'full_time' | 'part_time' | 'distance_learning' | 'sandwich';
  };

  // Fetch programs from API with filters
  const { data, isLoading, isError, error } = usePrograms({
    page: currentPage,
    page_size: 20,
    degree_type: mapDegreeType(selectedDegreeType),
    mode: mapMode(selectedMode),
    // Note: max_tuition not supported by API yet - will be client-side filtered
    search: searchQuery || undefined,
  });

  // Extract programs and pagination from response
  const allPrograms = data?.data || [];
  const pagination = data?.pagination;

  // Apply client-side tuition filter if needed (until API supports it)
  const programs = maxTuition !== Infinity
    ? allPrograms.filter(prog => prog.tuition_per_year <= maxTuition)
    : allPrograms;

  const degreeTypes: Array<{ value: DegreeType; label: string }> = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'nd', label: 'National Diploma (ND)' },
    { value: 'hnd', label: 'Higher National Diploma (HND)' },
    { value: 'pre_degree', label: 'Pre-Degree' },
    { value: 'jupeb', label: 'JUPEB' },
    { value: 'postgraduate', label: 'Postgraduate' },
  ];

  const modes = [
    { value: 'full_time', label: 'Full-Time' },
    { value: 'part_time', label: 'Part-Time' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const tuitionRanges = [
    { value: Infinity, label: 'Any Budget' },
    { value: 100000, label: 'Under ₦100,000' },
    { value: 200000, label: 'Under ₦200,000' },
    { value: 500000, label: 'Under ₦500,000' },
    { value: 1000000, label: 'Under ₦1,000,000' },
  ];

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Programs</h1>
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Programs</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'Failed to load programs'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Programs</h1>
          <p className="text-muted-foreground">
            Explore {pagination?.total || programs.length} academic programs across Nigerian institutions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-background border rounded-lg p-6 mb-8 space-y-4">
          <SearchBar
            placeholder="Search programs by name, field of study, or institution..."
            onSearch={setSearchQuery}
            initialValue={searchQuery}
          />

          {/* Filter Toggle Button (Mobile) */}
          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!showFilters && 'hidden md:grid'}`}>
            {/* Degree Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Degree Type</label>
              <Select value={selectedDegreeType} onValueChange={setSelectedDegreeType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Degree Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degree Types</SelectItem>
                  {degreeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Study Mode</label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger>
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {modes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tuition Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Annual Tuition</label>
              <Select value={maxTuition.toString()} onValueChange={(val) => setMaxTuition(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Budget" />
                </SelectTrigger>
                <SelectContent>
                  {tuitionRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedDegreeType !== 'all' || selectedMode !== 'all' || maxTuition !== Infinity) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedDegreeType !== 'all' && (
                <Badge variant="secondary">
                  Degree: {degreeTypes.find((t) => t.value === selectedDegreeType)?.label}
                  <button
                    onClick={() => setSelectedDegreeType('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedMode !== 'all' && (
                <Badge variant="secondary">
                  Mode: {modes.find((m) => m.value === selectedMode)?.label}
                  <button
                    onClick={() => setSelectedMode('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {maxTuition !== Infinity && (
                <Badge variant="secondary">
                  Budget: {tuitionRanges.find((r) => r.value === maxTuition)?.label}
                  <button
                    onClick={() => setMaxTuition(Infinity)}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {programs.length} {pagination ? `of ${pagination.total}` : ''} programs
            {pagination && ` (Page ${pagination.page} of ${pagination.total_pages})`}
          </p>
        </div>

        {/* Programs Grid */}
        {programs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} showInstitution />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.has_prev}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.has_next}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No programs found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedDegreeType('all');
                setSelectedMode('all');
                setMaxTuition(Infinity);
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

ProgramsPage.displayName = 'ProgramsPage';
