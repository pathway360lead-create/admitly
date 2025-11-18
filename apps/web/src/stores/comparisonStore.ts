import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonItem {
  id: string;
  type: 'program' | 'institution';
  addedAt: string;
}

interface ComparisonStore {
  items: ComparisonItem[];
  maxItems: number;
  addItem: (id: string, type: 'program' | 'institution') => boolean;
  removeItem: (id: string) => void;
  isInComparison: (id: string) => boolean;
  canAddMore: () => boolean;
  clear: () => void;
  getItemsByType: (type: 'program' | 'institution') => ComparisonItem[];
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 3,

      addItem: (id, type) => {
        const state = get();

        // Check if already in comparison
        if (state.isInComparison(id)) {
          return false;
        }

        // Check if we've reached the limit
        if (state.items.length >= state.maxItems) {
          return false;
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              id,
              type,
              addedAt: new Date().toISOString(),
            },
          ],
        }));

        return true;
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      isInComparison: (id) => {
        return get().items.some((item) => item.id === id);
      },

      canAddMore: () => {
        return get().items.length < get().maxItems;
      },

      clear: () => {
        set({ items: [] });
      },

      getItemsByType: (type) => {
        return get().items.filter((item) => item.type === type);
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
);
