import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstitutionsPage } from './InstitutionsPage';
import { useInstitutions } from '@/hooks/api';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('@/hooks/api', () => ({
    useInstitutions: vi.fn(),
}));

vi.mock('@/stores/searchFilterStore', () => ({
    useSearchFilterStore: vi.fn(),
}));

// Mock child components
vi.mock('@/components/organisms/SearchFilters', () => ({
    SearchFilters: () => <div data-testid="search-filters">Filters</div>,
    ActiveFilters: () => <div data-testid="active-filters">Active Filters</div>,
}));

vi.mock('@/components/molecules/InstitutionCard', () => ({
    InstitutionCard: ({ institution }: { institution: any }) => (
        <div data-testid="institution-card">{institution.name}</div>
    ),
}));

vi.mock('@/components/molecules/SearchBar', () => ({
    SearchBar: ({ onSearch }: { onSearch: (q: string) => void }) => (
        <input
            data-testid="search-bar"
            onChange={(e) => onSearch(e.target.value)}
        />
    ),
}));

describe('InstitutionsPage', () => {
    const mockSetFilter = vi.fn();
    const mockGetFiltersForAPI = vi.fn();
    const mockFiltersFromURLParams = vi.fn();
    const mockFiltersToURLParams = vi.fn().mockReturnValue(new URLSearchParams());

    beforeEach(() => {
        vi.clearAllMocks();

        // Default store mock
        (useSearchFilterStore as any).mockReturnValue({
            filters: {},
            setFilter: mockSetFilter,
            getFiltersForAPI: mockGetFiltersForAPI,
            filtersFromURLParams: mockFiltersFromURLParams,
            filtersToURLParams: mockFiltersToURLParams,
        });
    });

    it('renders loading state', () => {
        (useInstitutions as any).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Loading institutions...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        (useInstitutions as any).mockReturnValue({
            isLoading: false,
            isError: true,
            error: { message: 'Network error' },
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Error Loading Institutions')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        (useInstitutions as any).mockReturnValue({
            isLoading: false,
            data: {
                data: [],
                pagination: { total: 0, total_pages: 0 },
            },
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('No institutions found')).toBeInTheDocument();
    });

    it('renders institutions list', () => {
        const mockData = {
            data: [
                { id: '1', name: 'University of Lagos', type: 'federal_university' },
                { id: '2', name: 'Lagos State University', type: 'state_university' },
            ],
            pagination: {
                page: 1,
                page_size: 20,
                total: 2,
                total_pages: 1,
                has_next: false,
                has_prev: false,
            },
        };

        (useInstitutions as any).mockReturnValue({
            isLoading: false,
            data: mockData,
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('University of Lagos')).toBeInTheDocument();
        expect(screen.getByText('Lagos State University')).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 2 institutions (Page 1 of 1)')).toBeInTheDocument();
    });

    it('handles pagination', async () => {
        const mockData = {
            data: [],
            pagination: {
                page: 1,
                page_size: 20,
                total: 30,
                total_pages: 2,
                has_next: true,
                has_prev: false,
            },
        };

        (useInstitutions as any).mockReturnValue({
            isLoading: false,
            data: mockData,
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(useInstitutions).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
        });
    });

    it('updates search filter on search input', () => {
        (useInstitutions as any).mockReturnValue({
            isLoading: false,
            data: { data: [], pagination: { total: 0 } },
        });

        render(
            <MemoryRouter>
                <InstitutionsPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByTestId('search-bar');
        fireEvent.change(searchInput, { target: { value: 'Lagos' } });

        expect(mockSetFilter).toHaveBeenCalledWith('search', 'Lagos');
    });
});
