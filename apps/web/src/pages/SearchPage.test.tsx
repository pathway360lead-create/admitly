import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchPage } from './SearchPage';
import { useSearch } from '@/hooks/api';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('@/hooks/api', () => ({
    useSearch: vi.fn(),
}));

vi.mock('@/stores/searchFilterStore', () => ({
    useSearchFilterStore: vi.fn(),
}));

// Mock child components to simplify testing
vi.mock('@/components/organisms/SearchFilters', () => ({
    SearchFilters: () => <div data-testid="search-filters">Filters</div>,
}));

vi.mock('@/components/molecules/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name}</div>
    ),
}));

vi.mock('@/components/molecules/InstitutionCard', () => ({
    InstitutionCard: ({ institution }: { institution: any }) => (
        <div data-testid="institution-card">{institution.name}</div>
    ),
}));

describe('SearchPage', () => {
    const mockSetFilter = vi.fn();
    const mockFiltersFromURLParams = vi.fn();
    const mockFiltersToURLParams = vi.fn().mockReturnValue(new URLSearchParams());

    beforeEach(() => {
        vi.clearAllMocks();

        // Default store mock
        (useSearchFilterStore as any).mockReturnValue({
            filters: { search: 'computer' },
            setFilter: mockSetFilter,
            filtersFromURLParams: mockFiltersFromURLParams,
            filtersToURLParams: mockFiltersToURLParams,
        });
    });

    it('renders loading state', () => {
        (useSearch as any).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders error state', () => {
        (useSearch as any).mockReturnValue({
            isLoading: false,
            isError: true,
            error: { message: 'Network error' },
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        (useSearch as any).mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    institutions: [],
                    programs: [],
                    total_results: 0,
                },
            },
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('renders search results', () => {
        const mockData = {
            data: {
                institutions: [
                    { id: '1', name: 'University of Lagos', type: 'federal_university' },
                ],
                programs: [
                    { id: 'p1', name: 'Computer Science', degree_type: 'undergraduate' },
                ],
                total_results: 2,
            },
            search_time_ms: 123,
        };

        (useSearch as any).mockReturnValue({
            isLoading: false,
            data: mockData,
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('search-results')).toBeInTheDocument();
        expect(screen.getByText('University of Lagos')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByTestId('processing-time')).toHaveTextContent('Search took 123ms');
    });

    it('updates search query on input change', () => {
        (useSearch as any).mockReturnValue({
            isLoading: false,
            data: { data: { institutions: [], programs: [], total_results: 0 } },
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        const input = screen.getByTestId('search-input');
        fireEvent.change(input, { target: { value: 'new query' } });

        expect(input).toHaveValue('new query');
    });

    it('triggers search on form submit', () => {
        (useSearch as any).mockReturnValue({
            isLoading: false,
            data: { data: { institutions: [], programs: [], total_results: 0 } },
        });

        render(
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        );

        const input = screen.getByTestId('search-input');
        fireEvent.change(input, { target: { value: 'new query' } });

        const button = screen.getByTestId('search-button');
        fireEvent.click(button);

        expect(mockSetFilter).toHaveBeenCalledWith('search', 'new query');
    });
});
