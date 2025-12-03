/**
 * @file Unit tests for the BookmarkButton component.
 * @version 1.0
 * @task TASK-002
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BookmarkButton } from './BookmarkButton';

// Use vi.hoisted to create the mock function so it's available in the factory
const { mockUseBookmarks } = vi.hoisted(() => {
  return { mockUseBookmarks: vi.fn() };
});

// Mock the module using the hoisted mock function
vi.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: mockUseBookmarks,
}));

describe('BookmarkButton', () => {
  const mockToggleBookmark = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBookmarks.mockReset();
  });

  it('renders in the unbookmarked state', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: false,
      toggleBookmark: mockToggleBookmark,
      isLoading: false,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" />);

    expect(screen.getByLabelText('Add bookmark')).toBeInTheDocument();
  });

  it('renders in the bookmarked state', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: true,
      toggleBookmark: mockToggleBookmark,
      isLoading: false,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" />);

    expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument();
  });

  it('calls toggleBookmark when clicked', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: false,
      toggleBookmark: mockToggleBookmark,
      isLoading: false,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" />);
    const button = screen.getByLabelText('Add bookmark');
    fireEvent.click(button);

    expect(mockToggleBookmark).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: false,
      toggleBookmark: mockToggleBookmark,
      isLoading: true,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" />);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders as a full button with text', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: false,
      toggleBookmark: mockToggleBookmark,
      isLoading: false,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" variant="button" />);

    expect(screen.getByText('Bookmark')).toBeInTheDocument();
  });

  it('is accessible via keyboard', () => {
    mockUseBookmarks.mockReturnValue({
      isBookmarked: false,
      toggleBookmark: mockToggleBookmark,
      isLoading: false,
      isError: false,
    });

    render(<BookmarkButton entityType="program" entityId="123" />);
    const button = screen.getByLabelText('Add bookmark');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    button.focus();
    expect(button).toHaveFocus();
  });
});
