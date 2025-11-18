import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkItem {
  id: string;
  type: 'program' | 'institution';
  notes?: string;
  addedAt: string;
}

interface BookmarkStore {
  bookmarks: BookmarkItem[];
  addBookmark: (id: string, type: 'program' | 'institution', notes?: string) => void;
  removeBookmark: (id: string, type: 'program' | 'institution') => void;
  isBookmarked: (id: string, type: 'program' | 'institution') => boolean;
  getBookmarksByType: (type: 'program' | 'institution') => BookmarkItem[];
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (id, type, notes) => {
        const exists = get().isBookmarked(id, type);
        if (exists) return;

        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              id,
              type,
              notes,
              addedAt: new Date().toISOString(),
            },
          ],
        }));
      },

      removeBookmark: (id, type) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (bookmark) => !(bookmark.id === id && bookmark.type === type)
          ),
        }));
      },

      isBookmarked: (id, type) => {
        return get().bookmarks.some(
          (bookmark) => bookmark.id === id && bookmark.type === type
        );
      },

      getBookmarksByType: (type) => {
        return get().bookmarks.filter((bookmark) => bookmark.type === type);
      },

      clearBookmarks: () => {
        set({ bookmarks: [] });
      },
    }),
    {
      name: 'bookmark-storage',
    }
  )
);
