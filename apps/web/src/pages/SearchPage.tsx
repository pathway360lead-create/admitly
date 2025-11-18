import { FC, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/api';
import { SearchFilters } from '@/components/organisms/SearchFilters';
import { Button } from '@admitly/ui';
import { Search } from 'lucide-react';
import { ProgramCard } from '@/components/molecules/ProgramCard';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';
import { useSearchFilterStore } from '@/stores/searchFilterStore';

type ResultType = 'all' | 'programs' | 'institutions';

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

  // Fetch search results from API
  const { data, isLoading, isError, error } = useSearch(filters.search || '', {
    // Additional filters would go here when API supports them
  });

  const rawSearchResults = {
    programs: data?.programs || [],
    institutions: data?.institutions || [],
  };

  // Apply client-side filters (until API supports them fully)
  const filteredResults = {
    programs: rawSearchResults.programs.filter((prog) => {
      if (filters.state && prog.institution?.state !== filters.state) return false;
      if (filters.degreeType && filters.degreeType.length > 0) {
        if (!filters.degreeType.includes(prog.degree_type)) return false;
      }
      if (filters.mode && filters.mode.length > 0) {
        if (!filters.mode.includes(prog.mode as any)) return false;
      }
      if (filters.minTuition !== undefined && prog.tuition_per_year < filters.minTuition)
        return false;
      if (filters.maxTuition !== undefined && prog.tuition_per_year > filters.maxTuition)
        return false;
      if (filters.minCutoff !== undefined && prog.cutoff_score && prog.cutoff_score < filters.minCutoff)
        return false;
      if (filters.maxCutoff !== undefined && prog.cutoff_score && prog.cutoff_score > filters.maxCutoff)
        return false;
      return true;
    }),
    institutions: rawSearchResults.institutions.filter((inst) => {
      if (filters.state && inst.state !== filters.state) return false;
      if (filters.institutionType && filters.institutionType.length > 0) {
        if (!filters.institutionType.includes(inst.type)) return false;
      }
      if (filters.verified !== undefined && inst.verified !== filters.verified) return false;
      return true;
    }),
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchQuery || undefined);
    setSearchParams({ q: searchQuery });
  };

  const handleFilterChange = () => {
    // Filters are already updated via the store
  };

  const totalResults = filteredResults.programs.length + filteredResults.institutions.length;
  const displayedPrograms = resultType === 'institutions' ? [] : filteredResults.programs;
  const displayedInstitutions = resultType === 'programs' ? [] : filteredResults.institutions;

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for programs or institutions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Result Type Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setResultType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                resultType === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Results ({totalResults})
            </button>
            <button
              onClick={() => setResultType('programs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                resultType === 'programs'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Programs ({filteredResults.programs.length})
            </button>
            <button
              onClick={() => setResultType('institutions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                resultType === 'institutions'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Institutions ({filteredResults.institutions.length})
            </button>
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
                <div className="text-center py-12">
                  <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-lg mx-auto mb-4" />
                  <p className="text-gray-600">Searching...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-6">
                  {error?.message || 'Failed to search. Please try again.'}
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : totalResults === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search query or filters
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Programs Section */}
                {displayedPrograms.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Programs ({displayedPrograms.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedPrograms.map((program) => (
                        <ProgramCard key={program.id} program={program} showInstitution />
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
                        <InstitutionCard key={institution.id} institution={institution} />
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
