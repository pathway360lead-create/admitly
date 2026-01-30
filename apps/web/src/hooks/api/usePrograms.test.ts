import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrograms } from './usePrograms';
import { apiClient } from '@/lib/api';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    getPrograms: vi.fn(),
  },
}));

describe('usePrograms pagination', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch page 1 with correct filters', async () => {
    const mockResponse = {
      data: [{ id: '1', name: 'Program 1' }],
      pagination: { page: 1, page_size: 20, total: 100, total_pages: 5 },
    };

    vi.mocked(apiClient.getPrograms).mockResolvedValueOnce(mockResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => usePrograms({ page: 1, page_size: 20 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.getPrograms).toHaveBeenCalledWith({ page: 1, page_size: 20 });
    expect(result.current.data?.pagination.page).toBe(1);
  });

  it('should fetch page 2 when page filter changes', async () => {
    const mockResponsePage1 = {
      data: [{ id: '1', name: 'Program 1' }],
      pagination: { page: 1, page_size: 20, total: 100, total_pages: 5 },
    };

    const mockResponsePage2 = {
      data: [{ id: '21', name: 'Program 21' }],
      pagination: { page: 2, page_size: 20, total: 100, total_pages: 5 },
    };

    vi.mocked(apiClient.getPrograms)
      .mockResolvedValueOnce(mockResponsePage1)
      .mockResolvedValueOnce(mockResponsePage2);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // First render with page 1
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => usePrograms({ page, page_size: 20 }),
      {
        wrapper,
        initialProps: { page: 1 },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pagination.page).toBe(1);
    expect(apiClient.getPrograms).toHaveBeenCalledWith({ page: 1, page_size: 20 });

    // Change to page 2
    rerender({ page: 2 });

    await waitFor(() => expect(result.current.data?.pagination.page).toBe(2));
    expect(apiClient.getPrograms).toHaveBeenCalledWith({ page: 2, page_size: 20 });
    expect(apiClient.getPrograms).toHaveBeenCalledTimes(2);
  });

  it('should use stable queryKey for same filter values', async () => {
    const mockResponse = {
      data: [{ id: '1', name: 'Program 1' }],
      pagination: { page: 1, page_size: 20, total: 100, total_pages: 5 },
    };

    vi.mocked(apiClient.getPrograms).mockResolvedValue(mockResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const filters1 = { page: 1, page_size: 20 };
    const filters2 = { page: 1, page_size: 20 }; // Same values, different object

    const { result: result1 } = renderHook(() => usePrograms(filters1), { wrapper });
    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const { result: result2 } = renderHook(() => usePrograms(filters2), { wrapper });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Should only call API once because queryKey should be the same for same filter values
    expect(apiClient.getPrograms).toHaveBeenCalledTimes(1);
  });
});
