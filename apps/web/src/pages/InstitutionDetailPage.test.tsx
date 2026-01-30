import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstitutionDetailPage } from './InstitutionDetailPage';
import { useInstitution, useInstitutionPrograms } from '@/hooks/api';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the hooks
vi.mock('@/hooks/api', () => ({
    useInstitution: vi.fn(),
    useInstitutionPrograms: vi.fn(),
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

describe('InstitutionDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        (useInstitution as any).mockReturnValue({
            isLoading: true,
            data: null,
        });
        (useInstitutionPrograms as any).mockReturnValue({
            isLoading: true,
            data: null,
        });

        render(
            <MemoryRouter initialEntries={['/institutions/unilag']}>
                <Routes>
                    <Route path="/institutions/:slug" element={<InstitutionDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Check for skeletons
        const skeletons = screen.getAllByTestId('skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state', () => {
        (useInstitution as any).mockReturnValue({
            isLoading: false,
            isError: true,
            error: { message: 'Institution not found' },
        });
        (useInstitutionPrograms as any).mockReturnValue({
            isLoading: false,
            data: null,
        });

        render(
            <MemoryRouter initialEntries={['/institutions/invalid']}>
                <Routes>
                    <Route path="/institutions/:slug" element={<InstitutionDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Institution not found')).toBeInTheDocument();
    });

    it('renders institution details', async () => {
        const mockInstitution = {
            id: '1',
            name: 'University of Lagos',
            slug: 'unilag',
            type: 'federal_university',
            state: 'Lagos',
            city: 'Akoka',
            verified: true,
            program_count: 10,
            description: 'A great university',
        };

        (useInstitution as any).mockReturnValue({
            isLoading: false,
            data: mockInstitution,
        });
        (useInstitutionPrograms as any).mockReturnValue({
            isLoading: false,
            data: { data: [] },
        });

        render(
            <MemoryRouter initialEntries={['/institutions/unilag']}>
                <Routes>
                    <Route path="/institutions/:slug" element={<InstitutionDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('University of Lagos')).toBeInTheDocument();
        expect(await screen.findByText('Akoka, Lagos')).toBeInTheDocument();
        expect(await screen.findByText('federal university')).toBeInTheDocument();
    });
});
