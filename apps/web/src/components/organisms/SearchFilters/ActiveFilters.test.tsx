import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActiveFilters } from './ActiveFilters';
import { useSearchFilterStore } from '@/stores/searchFilterStore';

// Mock the store
vi.mock('@/stores/searchFilterStore', () => ({
    useSearchFilterStore: vi.fn(),
}));

describe('ActiveFilters', () => {
    const mockClearFilter = vi.fn();
    const mockClearAllFilters = vi.fn();
    const mockSetFilter = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default store mock
        (useSearchFilterStore as any).mockReturnValue({
            filters: {},
            clearFilter: mockClearFilter,
            clearAllFilters: mockClearAllFilters,
            hasActiveFilters: () => false,
            setFilter: mockSetFilter,
        });

        // Also mock the static getState for the array removal logic
        (useSearchFilterStore as any).getState = () => ({
            setFilter: mockSetFilter,
        });
    });

    it('renders nothing when no filters are active', () => {
        render(<ActiveFilters />);
        expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    });

    it('renders active filters chips', () => {
        (useSearchFilterStore as any).mockReturnValue({
            filters: {
                search: 'computer',
                state: 'Lagos',
                minTuition: 100000,
            },
            clearFilter: mockClearFilter,
            clearAllFilters: mockClearAllFilters,
            hasActiveFilters: () => true,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('Active Filters:')).toBeInTheDocument();
        expect(screen.getByText('Search: computer')).toBeInTheDocument();
        expect(screen.getByText('State: Lagos')).toBeInTheDocument();
        expect(screen.getByText('Min Tuition: ₦100000')).toBeInTheDocument();
    });

    it('calls clearFilter when chip remove button is clicked', () => {
        (useSearchFilterStore as any).mockReturnValue({
            filters: {
                state: 'Lagos',
            },
            clearFilter: mockClearFilter,
            clearAllFilters: mockClearAllFilters,
            hasActiveFilters: () => true,
        });

        render(<ActiveFilters />);

        const removeButton = screen.getByLabelText('Remove filter State: Lagos');
        fireEvent.click(removeButton);

        expect(mockClearFilter).toHaveBeenCalledWith('state');
    });

    it('calls clearAllFilters when Clear All button is clicked', () => {
        (useSearchFilterStore as any).mockReturnValue({
            filters: {
                state: 'Lagos',
            },
            clearFilter: mockClearFilter,
            clearAllFilters: mockClearAllFilters,
            hasActiveFilters: () => true,
        });

        render(<ActiveFilters />);

        const clearAllButton = screen.getByText('Clear All');
        fireEvent.click(clearAllButton);

        expect(mockClearAllFilters).toHaveBeenCalled();
    });

    it('handles array filters correctly', () => {
        (useSearchFilterStore as any).mockReturnValue({
            filters: {
                institutionType: ['federal_university', 'state_university'],
            },
            clearFilter: mockClearFilter,
            clearAllFilters: mockClearAllFilters,
            hasActiveFilters: () => true,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('Type: federal university')).toBeInTheDocument();
        expect(screen.getByText('Type: state university')).toBeInTheDocument();
    });
});
