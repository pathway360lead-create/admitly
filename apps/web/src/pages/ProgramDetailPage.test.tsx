import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgramDetailPage } from './ProgramDetailPage';
import { useProgramDetail, useDeadlines } from '@/hooks/api';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the hooks
vi.mock('@/hooks/api', () => ({
    useProgramDetail: vi.fn(),
    useDeadlines: vi.fn(),
}));

vi.mock('@/stores/bookmarkStore', () => ({
    useBookmarkStore: vi.fn().mockReturnValue({
        isBookmarked: vi.fn().mockReturnValue(false),
        addBookmark: vi.fn(),
        removeBookmark: vi.fn(),
    }),
}));

vi.mock('@/stores/comparisonStore', () => ({
    useComparisonStore: vi.fn().mockReturnValue({
        isInComparison: vi.fn().mockReturnValue(false),
        addItem: vi.fn(),
        removeItem: vi.fn(),
    }),
}));

// Mock UI components
vi.mock('@admitly/ui', () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}));

describe('ProgramDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        (useProgramDetail as any).mockReturnValue({
            isLoading: true,
            data: null,
        });
        (useDeadlines as any).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(
            <MemoryRouter initialEntries={['/programs/computer-science']}>
                <Routes>
                    <Route path="/programs/:slug" element={<ProgramDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Check for skeletons
        const skeletons = screen.getAllByTestId('skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state', () => {
        (useProgramDetail as any).mockReturnValue({
            isLoading: false,
            isError: true,
            error: { message: 'Program not found' },
        });
        (useDeadlines as any).mockReturnValue({
            isLoading: false,
            data: null,
        });

        render(
            <MemoryRouter initialEntries={['/programs/invalid']}>
                <Routes>
                    <Route path="/programs/:slug" element={<ProgramDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Program not found')).toBeInTheDocument();
    });

    it('renders program details', () => {
        const mockProgram = {
            id: '1',
            name: 'Computer Science',
            slug: 'computer-science',
            degree_type: 'BSc',
            duration_years: 4,
            mode: 'full_time',
            tuition_per_year: 150000,
            institution: {
                name: 'University of Lagos',
                slug: 'unilag',
            },
        };

        (useProgramDetail as any).mockReturnValue({
            isLoading: false,
            data: mockProgram,
        });
        (useDeadlines as any).mockReturnValue({
            isLoading: false,
            data: { data: [] },
        });

        render(
            <MemoryRouter initialEntries={['/programs/computer-science']}>
                <Routes>
                    <Route path="/programs/:slug" element={<ProgramDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('University of Lagos')).toBeInTheDocument();
        expect(screen.getByText('BSc')).toBeInTheDocument();
    });
});
