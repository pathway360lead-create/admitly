import { FC, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/api';
import { SearchFilters, ActiveFilters } from '@/components/organisms/SearchFilters';
import { Button } from '@admitly/ui';
import { Search } from 'lucide-react';
import { ProgramCard } from '@/components/molecules/ProgramCard';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import type { SearchFilters as APISearchFilters, SearchType } from '@/types/search';

type ResultType = 'all' | 'programs' | 'institutions';

/**
 * Convert frontend filter state to API search filters format
 */
function convertFiltersToAPIFormat(
  frontendFilters: { [key: string]: any }
): APISearchFilters {
  const apiFilters: APISearchFilters = {};

  // Institution filters
  if (frontendFilters.institutionType && frontendFilters.institutionType.length > 0) {
    apiFilters.institution_type = frontendFilters.institutionType;
  }
  if (frontendFilters.state) {
    apiFilters.state = [frontendFilters.state];
  }
  if (frontendFilters.verified !== undefined) {
    apiFilters.verified = frontendFilters.verified;
  }

  // Program filters
  if (frontendFilters.degreeType && frontendFilters.degreeType.length > 0) {
    apiFilters.degree_type = frontendFilters.degreeType;
  }
  if (frontendFilters.fieldOfStudy) {
    apiFilters.field_of_study = [frontendFilters.fieldOfStudy];
  }
  if (frontendFilters.mode && frontendFilters.mode.length > 0) {
    apiFilters.mode = frontendFilters.mode;
  }
  if (frontendFilters.minTuition !== undefined) {
    apiFilters.min_tuition = frontendFilters.minTuition;
  }
  if (frontendFilters.maxTuition !== undefined) {
    apiFilters.max_tuition = frontendFilters.maxTuition;
  }
  if (frontendFilters.minCutoff !== undefined) {
    apiFilters.min_cutoff = frontendFilters.minCutoff;
  }
  if (frontendFilters.maxCutoff !== undefined) {
    apiFilters.max_cutoff = frontendFilters.maxCutoff;
  }

  return apiFilters;
}

export const SearchPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [resultType, setResultType] = useState<ResultType>('all');

  const {
    filters,
    setFilter,
    filtersFromURLParams,
    filtersToURLParams,
  } = useSearchFilterStore();

  // Sync filters with URL on mount
  useEffect(() => {
    filtersFromURLParams(searchParams);
    if (query) {
      setFilter('search', query);
    }
  }, []); // Only run on mount

  // Sync filters to URL when they change
  useEffect(() => {
    const params = filtersToURLParams();
    // Also include the 'q' parameter for backward compatibility
    if (filters.search) {
      params.set('q', filters.search);
    }
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams, filtersToURLParams]);

  // Update searchQuery when URL query param changes
  useEffect(() => {
    setSearchQuery(query);
    if (query && query !== filters.search) {
      setFilter('search', query);
    }
  }, [query]);

  // Convert frontend filters to API format
  const apiFilters = useMemo(() => convertFiltersToAPIFormat(filters), [filters]);

  // Fetch search results from API
  const { data, isLoading, isError, error } = useSearch({
    q: filters.search || '',
    type: resultType as SearchType,
    filters: apiFilters,
    page: 1,
    page_size: 50,
  });

  // Extract results from API response
  const institutions = data?.data.institutions || [];
  const programs = data?.data.programs || [];
  const totalResults = data?.data.total_results || 0;
  const searchTimeMs = data?.search_time_ms;

  // Determine what to display based on result type
  const displayedPrograms = resultType === 'institutions' ? [] : programs;
  const displayedInstitutions = resultType === 'programs' ? [] : institutions;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchQuery || undefined);
    setSearchParams({ q: searchQuery });
  };

  const handleFilterChange = () => {
    // Filters are already updated via the store
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Results {filters.search && `for "${filters.search}"`}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for programs or institutions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Search for programs or institutions"
              />
            </div>
            <Button type="submit" data-testid="search-button">Search</Button>
          </form>

          {/* Result Type Tabs */}
          <div className="flex gap-2 items-center">
            <button
              data-testid="tab-all"
              onClick={() => setResultType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${resultType === 'all'
                ? 'bg-primary text-white active'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              All Results (<span data-testid="result-count">{totalResults}</span>)
            </button>
            <button
              data-testid="tab-programs"
              onClick={() => setResultType('programs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${resultType === 'programs'
                ? 'bg-primary text-white active'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Programs ({programs.length})
            </button>
            <button
              data-testid="tab-institutions"
              onClick={() => setResultType('institutions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${resultType === 'institutions'
                ? 'bg-primary text-white active'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Institutions ({institutions.length})
            </button>

            {/* Search time display */}
            {searchTimeMs !== undefined && (
              <span className="ml-auto text-sm text-gray-500" data-testid="processing-time">
                Search took {searchTimeMs.toFixed(0)}ms
              </span>
            )}
          </div>
        </div>

        {/* Main Content: Filters + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <SearchFilters
                filterType="all"
                onFilterChange={handleFilterChange}
                resultsCount={totalResults}
              />
            </div>
          </aside>

          {/* Mobile Filters (Collapsible) */}
          <div className="lg:hidden col-span-1">
            <SearchFilters
              filterType="all"
              onFilterChange={handleFilterChange}
              resultsCount={totalResults}
              compact
            />
          </div>

          {/* Results */}
          <main className="lg:col-span-3">
            <ActiveFilters className="mb-6" />
            {!filters.search ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-600 mb-6">
                  Enter a search query to find programs and institutions
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-8">
                <div className="text-center py-12" data-testid="loading-spinner">
                  <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-lg mx-auto mb-4" />
                  <p className="text-gray-600">Searching...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="bg-white rounded-lg p-12 text-center" data-testid="error-state">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-6">
                  {error?.message || 'Failed to search. Please try again.'}
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : totalResults === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center" data-testid="empty-state">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search query or filters
                </p>
              </div>
            ) : (
              <div className="space-y-8" data-testid="search-results">
                {/* Programs Section */}
                {displayedPrograms.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Programs ({displayedPrograms.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedPrograms.map((program) => (
                        <div key={program.id} data-testid="result-card">
                          <ProgramCard
                            program={{
                              id: program.id,
                              slug: program.slug,
                              name: program.name,
                              degree_type: program.degree_type as import('@admitly/types').DegreeType,
                              duration_years: program.duration_years || 0,
                              mode: (program.mode || 'full_time') as 'full_time' | 'part_time' | 'online' | 'hybrid',
                              tuition_per_year: program.tuition_annual || 0,
                              cutoff_score: program.cutoff_score,
                              institution_id: program.institution_id,
                              status: 'published',
                              created_at: '',
                              updated_at: '',
                              institution: {
                                id: program.institution_id,
                                slug: program.institution_slug,
                                name: program.institution_name,
                                state: program.institution_state as import('@admitly/types').NigerianState,
                                type: 'federal_university',
                                city: '',
                                verified: true,
                                status: 'published',
                                program_count: 0,
                                created_at: '',
                                updated_at: '',
                              },
                            }}
                            showInstitution
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Institutions Section */}
                {displayedInstitutions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Institutions ({displayedInstitutions.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedInstitutions.map((institution) => (
                        <div key={institution.id} data-testid="result-card">
                          <InstitutionCard
                            institution={{
                              id: institution.id,
                              slug: institution.slug,
                              name: institution.name,
                              short_name: institution.short_name,
                              type: institution.type as import('@admitly/types').InstitutionType,
                              state: institution.state as import('@admitly/types').NigerianState,
                              city: institution.city,
                              logo_url: institution.logo_url,
                              website: institution.website,
                              verified: institution.verified,
                              program_count: institution.program_count,
                              status: 'published',
                              created_at: '',
                              updated_at: '',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

SearchPage.displayName = 'SearchPage';
