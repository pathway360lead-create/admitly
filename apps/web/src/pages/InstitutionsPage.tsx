import { FC, useState } from 'react';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Badge } from '@admitly/ui';
import { useInstitutions } from '@/hooks/api';
import { NIGERIAN_STATES, InstitutionType } from '@admitly/types';
import { SlidersHorizontal } from 'lucide-react';

export const InstitutionsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch institutions from API with filters
  const { data, isLoading, isError, error } = useInstitutions({
    page: currentPage,
    page_size: 20,
    state: selectedState !== 'all' ? selectedState : undefined,
    type: selectedType !== 'all' ? (selectedType as InstitutionType) : undefined,
    // Note: 'verified' filter not yet supported by API - will be client-side filtered if needed
    search: searchQuery || undefined,
  });

  // Extract institutions and pagination from response
  const allInstitutions = data?.data || [];
  const pagination = data?.pagination;

  // Apply client-side verified filter if needed (until API supports it)
  const institutions = verifiedOnly
    ? allInstitutions.filter(inst => inst.verified)
    : allInstitutions;

  const institutionTypes: Array<{ value: InstitutionType; label: string }> = [
    { value: 'federal_university', label: 'Federal University' },
    { value: 'state_university', label: 'State University' },
    { value: 'private_university', label: 'Private University' },
    { value: 'polytechnic', label: 'Polytechnic' },
    { value: 'college_of_education', label: 'College of Education' },
    { value: 'specialized', label: 'Specialized Institution' },
    { value: 'jupeb_center', label: 'JUPEB Center' },
  ];

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Institutions</h1>
            <p className="text-muted-foreground">Loading institutions...</p>
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
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Institutions</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'Failed to load institutions'}</p>
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
          <h1 className="text-4xl font-bold mb-2">Institutions</h1>
          <p className="text-muted-foreground">
            Browse and compare {pagination?.total || institutions.length} verified educational institutions across
            Nigeria
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-background border rounded-lg p-6 mb-8 space-y-4">
          <SearchBar
            placeholder="Search institutions by name, location, or type..."
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
            {/* State Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {NIGERIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Institution Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {institutionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verified Filter */}
            <div className="flex items-end">
              <Button
                variant={verifiedOnly ? 'default' : 'outline'}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className="w-full"
              >
                {verifiedOnly ? '✓ ' : ''}Verified Only
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedState !== 'all' || selectedType !== 'all' || verifiedOnly) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedState !== 'all' && (
                <Badge variant="secondary">
                  State: {selectedState}
                  <button
                    onClick={() => setSelectedState('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary">
                  Type: {institutionTypes.find((t) => t.value === selectedType)?.label}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="secondary">
                  Verified Only
                  <button
                    onClick={() => setVerifiedOnly(false)}
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
            Showing {institutions.length} {pagination ? `of ${pagination.total}` : ''} institutions
            {pagination && ` (Page ${pagination.page} of ${pagination.total_pages})`}
          </p>
        </div>

        {/* Institutions Grid */}
        {institutions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
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
            <p className="text-lg text-muted-foreground mb-4">No institutions found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedState('all');
                setSelectedType('all');
                setVerifiedOnly(false);
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

InstitutionsPage.displayName = 'InstitutionsPage';
