/**
 * @file A reusable button/icon for bookmarking an entity.
 * @description This component uses the useBookmarks hook to manage state and API calls.
 * @version 1.0
 * @task TASK-002
 */

import { FC } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming a utility for classnames
import { Button } from '@packages/ui/components/button'; // Using the shared button
import { useBookmarks } from '@/hooks/useBookmarks';
import { EntityType } from '@/types/user-features';

export interface BookmarkButtonProps {
  entityType: EntityType;
  entityId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: FC<BookmarkButtonProps> = ({
  entityType,
  entityId,
  size = 'md',
  variant = 'icon',
  className,
  onBookmarkChange,
}) => {
  const { isBookmarked, toggleBookmark, isLoading } = useBookmarks(entityType, entityId);

  const handleToggle = () => {
    toggleBookmark();
    if (onBookmarkChange) {
      onBookmarkChange(!isBookmarked);
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const IconComponent = isBookmarked ? BookmarkCheck : Bookmark;

  if (variant === 'button') {
    return (
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn('gap-2', className)}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <IconComponent size={iconSize} />
        {isLoading ? 'Saving...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        { 'text-blue-600': isBookmarked, 'text-gray-500': !isBookmarked },
        className
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isLoading ? (
        <span className="animate-spin h-5 w-5">...</span> // Simple spinner
      ) : (
        <IconComponent size={iconSize} />
      )}
    </button>
  );
};

BookmarkButton.displayName = 'BookmarkButton';
