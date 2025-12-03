import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgramsPage } from './ProgramsPage';
import { usePrograms } from '@/hooks/api';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('@/hooks/api', () => ({
    usePrograms: vi.fn(),
}));

vi.mock('@/stores/searchFilterStore', () => ({
    useSearchFilterStore: vi.fn(),
}));

// Mock child components
vi.mock('@/components/organisms/SearchFilters', () => ({
    SearchFilters: () => <div data-testid="search-filters">Filters</div>,
    ActiveFilters: () => <div data-testid="active-filters">Active Filters</div>,
}));

vi.mock('@/components/molecules/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name}</div>
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

describe('ProgramsPage', () => {
    const mockSetFilter = vi.fn();
    const mockGetFiltersForAPI = vi.fn().mockReturnValue({});
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
        (usePrograms as any).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Loading programs...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        (usePrograms as any).mockReturnValue({
            isLoading: false,
            isError: true,
            error: { message: 'Network error' },
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Error Loading Programs')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        (usePrograms as any).mockReturnValue({
            isLoading: false,
            data: {
                data: [],
                pagination: { total: 0, total_pages: 0 },
            },
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('No programs found')).toBeInTheDocument();
    });

    it('renders programs list', () => {
        const mockData = {
            data: [
                { id: '1', name: 'Computer Science', institution: { name: 'Unilag' } },
                { id: '2', name: 'Medicine', institution: { name: 'Unilag' } },
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

        (usePrograms as any).mockReturnValue({
            isLoading: false,
            data: mockData,
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Medicine')).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 2 programs (Page 1 of 1)')).toBeInTheDocument();
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

        (usePrograms as any).mockReturnValue({
            isLoading: false,
            data: mockData,
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(usePrograms).toHaveBeenCalledTimes(2);
            expect(usePrograms).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
        });
    });

    it('updates search filter on search input', () => {
        (usePrograms as any).mockReturnValue({
            isLoading: false,
            data: { data: [], pagination: { total: 0 } },
        });

        render(
            <MemoryRouter>
                <ProgramsPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByTestId('search-bar');
        fireEvent.change(searchInput, { target: { value: 'Computer' } });

        expect(mockSetFilter).toHaveBeenCalledWith('search', 'Computer');
    });
});
