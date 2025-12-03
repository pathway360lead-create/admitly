import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SavedSearchCard } from './SavedSearchCard';
import { SavedSearch } from '@/types/user-features';

const mockSavedSearch: SavedSearch = {
    id: '123',
    name: 'Test Search',
    query: 'computer science',
    filters: { state: ['Lagos'] },
    notify_on_new_results: true,
    execution_count: 5,
    last_executed_at: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
};

describe('SavedSearchCard', () => {
    it('renders correctly', () => {
        render(<SavedSearchCard savedSearch={mockSavedSearch} />);
        expect(screen.getByText('Test Search')).toBeInTheDocument();
        expect(screen.getByText('"computer science"')).toBeInTheDocument();
        expect(screen.getByText(/state: Lagos/i)).toBeInTheDocument();
    });

    it('calls onExecute when execute button is clicked', async () => {
        const onExecute = vi.fn();
        render(<SavedSearchCard savedSearch={mockSavedSearch} onExecute={onExecute} />);

        fireEvent.click(screen.getByText('Execute'));
        expect(onExecute).toHaveBeenCalledWith('123');
    });

    it('calls onEdit when edit button is clicked', () => {
        const onEdit = vi.fn();
        render(<SavedSearchCard savedSearch={mockSavedSearch} onEdit={onEdit} />);

        fireEvent.click(screen.getByText('Edit'));
        expect(onEdit).toHaveBeenCalledWith('123');
    });

    it('calls onDelete when delete button is clicked', async () => {
        const onDelete = vi.fn();
        render(<SavedSearchCard savedSearch={mockSavedSearch} onDelete={onDelete} />);

        fireEvent.click(screen.getByText('Delete'));
        expect(onDelete).toHaveBeenCalledWith('123');
    });

    it('calls onToggleNotify when notification toggle is clicked', async () => {
        const onToggleNotify = vi.fn();
        render(<SavedSearchCard savedSearch={mockSavedSearch} onToggleNotify={onToggleNotify} />);

        fireEvent.click(screen.getByLabelText('Turn off notifications'));
        expect(onToggleNotify).toHaveBeenCalledWith('123', false);
    });

    it('shows loading state during execution', async () => {
        const onExecute = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<SavedSearchCard savedSearch={mockSavedSearch} onExecute={onExecute} />);

        fireEvent.click(screen.getByText('Execute'));
        expect(screen.getByRole('button', { name: /execute/i })).toBeDisabled();

        await waitFor(() => expect(screen.getByRole('button', { name: /execute/i })).not.toBeDisabled());
    });
});
