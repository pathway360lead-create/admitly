import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SearchFilters, ActiveFilters } from '@/components/organisms/SearchFilters';
import { Button } from '@admitly/ui';
import { useInstitutions } from '@/hooks/api';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { useToast } from '@/components/ui/use-toast';

export const InstitutionsPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const searchFilterStore = useSearchFilterStore();
  const { filters, setFilter } = searchFilterStore;
  const { addItem, isInComparison } = useComparisonStore();
  const { toast } = useToast();

  // Sync filters with URL on mount
  useEffect(() => {
    searchFilterStore.filtersFromURLParams(searchParams);
  }, []); // Only run on mount

  // Sync filters to URL when they change
  useEffect(() => {
    const params = searchFilterStore.filtersToURLParams();
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams, searchFilterStore]);

  // Get API-compatible filters (memoized to prevent unnecessary re-renders)
  // Only depend on filters object, not on the getFiltersForAPI function
  const apiFilters = useMemo(() => {
    return searchFilterStore.getFiltersForAPI('institutions');
  }, [filters, searchFilterStore]);

  // Combine pagination with filters (memoized for stable reference)
  const institutionFilters = useMemo(() => ({
    ...apiFilters, // Spread first to ensure local page state overrides any defaults
    page: currentPage,
    page_size: 20,
  }), [currentPage, apiFilters]);

  // Fetch institutions from API with filters
  const { data, isLoading, isError, error } = useInstitutions(institutionFilters);

  // Track previous filters to detect ACTUAL changes
  const prevFiltersRef = useRef(filters);

  // Handle adding to comparison
  const handleCompare = (id: string) => {
    const success = addItem(id, 'institution');
    if (success) {
      toast({
        title: "Added to comparison",
        description: "You can compare up to 3 institutions",
      });
    } else {
      if (isInComparison(id)) {
        toast({
          title: "Already added",
          description: "This institution is already in your comparison list",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Comparison limit reached",
          description: "You can only compare up to 3 institutions at a time",
          variant: "destructive",
        });
      }
    }
  };

  // Handle search query changes
  const handleSearch = (query: string) => {
    setFilter('search', query || undefined);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter changes - Only reset page when filters ACTUALLY change
  const handleFilterChange = useCallback(() => {
    // Compare current filters with previous
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);

    if (filtersChanged) {
      console.log('[InstitutionsPage] Filters changed, resetting to page 1', {
        prev: prevFiltersRef.current,
        curr: filters
      });
      prevFiltersRef.current = filters;
      setCurrentPage(1);
    }
  }, [filters]);

  // Reset page to 1 when filters change
  useEffect(() => {
    // This effect should run whenever the filters change.
    // The handleFilterChange function is memoized, so it won't cause
    // unnecessary re-renders if the filters object itself hasn't changed.
    handleFilterChange();
  }, [filters, handleFilterChange]);

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

  const institutions = data?.data || [];
  const pagination = data?.pagination;

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

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search institutions by name, location, or type..."
            onSearch={handleSearch}
            initialValue={filters.search || ''}
          />
        </div>

        {/* Main Content: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <SearchFilters
                filterType="institutions"
                onFilterChange={handleFilterChange}
                resultsCount={pagination?.total}
              />
            </div>
          </aside>

          {/* Mobile Filters (Collapsible) */}
          <div className="lg:hidden col-span-1">
            <SearchFilters
              filterType="institutions"
              onFilterChange={handleFilterChange}
              resultsCount={pagination?.total}
              compact
            />
          </div>

          {/* Results Grid */}
          <main className="lg:col-span-3">
            <ActiveFilters className="mb-6" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="institutions-list">
                  {institutions.map((institution) => (
                    <div key={institution.id} data-testid="institution-card">
                      <InstitutionCard
                        institution={institution}
                        onCompare={handleCompare}
                        isComparing={isInComparison(institution.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev}
                      data-testid="prev-page"
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
                      data-testid="next-page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12" data-testid="empty-state">
                <p className="text-lg text-muted-foreground mb-4">No institutions found</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

InstitutionsPage.displayName = 'InstitutionsPage';
