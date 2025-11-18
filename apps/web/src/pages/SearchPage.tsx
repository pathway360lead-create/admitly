import { FC, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/api';
import { Button } from '@admitly/ui';
import { Search, Filter, X } from 'lucide-react';
import { ProgramCard } from '@/components/molecules/ProgramCard';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';

type ResultType = 'all' | 'programs' | 'institutions';

export const SearchPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [resultType, setResultType] = useState<ResultType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Update searchQuery when URL query param changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Fetch search results from API
  const { data, isLoading, isError, error } = useSearch(query, {
    // Note: state and type filters would go in the filters object if API supports them
    // For now, we'll filter client-side or wait for API support
  });

  const rawSearchResults = {
    programs: data?.programs || [],
    institutions: data?.institutions || [],
  };

  // Apply client-side filters (until API supports them)
  const filteredResults = {
    programs: rawSearchResults.programs.filter(prog => {
      if (selectedState && prog.institution?.state !== selectedState) return false;
      return true;
    }),
    institutions: rawSearchResults.institutions.filter(inst => {
      if (selectedState && inst.state !== selectedState) return false;
      if (selectedType && inst.type !== selectedType) return false;
      return true;
    }),
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedType('');
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
            Search Results {query && `for "${query}"`}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All States</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Osun">Osun</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Enugu">Enugu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="federal_university">Federal University</option>
                    <option value="state_university">State University</option>
                    <option value="private_university">Private University</option>
                    <option value="polytechnic">Polytechnic</option>
                    <option value="college_of_education">College of Education</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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

        {/* Results */}
        {!query ? (
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
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Programs Section */}
            {displayedPrograms.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Programs ({displayedPrograms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedInstitutions.map((institution) => (
                    <InstitutionCard key={institution.id} institution={institution} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SearchPage.displayName = 'SearchPage';
