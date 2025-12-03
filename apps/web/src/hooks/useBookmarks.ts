/**
 * @file Custom hook for managing user bookmarks.
 * @description This hook provides functions to check, add, and remove bookmarks,
 *              leveraging React Query for server state management.
 * @version 1.0
 * @task TASK-002
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Bookmark, BookmarkCreate, BookmarkCheckResponse, EntityType } from '@/types/user-features';

// == Query Keys ============================================================
const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (filters: string) => [...bookmarkKeys.lists(), { filters }] as const,
  details: () => [...bookmarkKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookmarkKeys.details(), id] as const,
  check: (entityType: EntityType, entityId: string) => [...bookmarkKeys.all, 'check', entityType, entityId] as const,
};

// == API Functions =========================================================

/**
 * Checks the bookmark status of a single entity.
 */
const checkBookmarkStatus = async (entityType: EntityType, entityId: string): Promise<BookmarkCheckResponse> => {
  const response = await api.get(`/users/me/bookmarks/check`, {
    params: { entity_type: entityType, entity_ids: entityId },
  });
  return response.data;
};

/**
 * Creates a new bookmark.
 */
const createBookmark = async (data: BookmarkCreate): Promise<Bookmark> => {
  const response = await api.post('/users/me/bookmarks', data);
  return response.data;
};

/**
 * Deletes a bookmark.
 */
const deleteBookmark = async (bookmarkId: string): Promise<void> => {
  await api.delete(`/users/me/bookmarks/${bookmarkId}`);
};


// == Hook ==================================================================

export const useBookmarks = (entityType: EntityType, entityId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = bookmarkKeys.check(entityType, entityId);

  /**
   * Query to fetch the bookmark status for the given entity.
   */
  const { data, isLoading: isCheckingStatus, isError } = useQuery<BookmarkCheckResponse>({
    queryKey,
    queryFn: () => checkBookmarkStatus(entityType, entityId),
    enabled: !!entityId, // Only run if entityId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const bookmarkInfo = data?.bookmarks?.[entityId];
  const isBookmarked = bookmarkInfo?.is_bookmarked ?? false;
  const bookmarkId = bookmarkInfo?.bookmark_id;

  /**
   * Mutation to add a bookmark.
   */
  const { mutate: addBookmark, isPending: isAdding } = useMutation({
    mutationFn: (notes?: string) => createBookmark({ entity_type: entityType, entity_id: entityId, notes }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `${entityType === 'program' ? 'Program' : 'Institution'} bookmarked.`,
      });
      // Invalidate the query to refetch the status
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to bookmark. ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  /**
   * Mutation to remove a bookmark.
   */
  const { mutate: removeBookmark, isPending: isRemoving } = useMutation({
    mutationFn: () => {
      if (!bookmarkId) {
        throw new Error('Cannot remove bookmark without a bookmark ID.');
      }
      return deleteBookmark(bookmarkId)
    },
    onSuccess: () => {
      toast({
        title: 'Bookmark Removed',
        description: `${entityType === 'program' ? 'Program' : 'Institution'} removed from bookmarks.`,
      });
      // Invalidate the query to refetch the status
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to remove bookmark. ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  /**
   * Toggles the bookmark status.
   */
  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark();
    } else {
      addBookmark();
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading: isCheckingStatus || isAdding || isRemoving,
    isError,
  };
};
