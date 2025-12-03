import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
    SavedSearch,
    SavedSearchCreate,
    SavedSearchUpdate,
    SavedSearchListResponse,
} from '@/types/user-features';

export const useSavedSearches = (page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: ['saved-searches', page, pageSize],
        queryFn: async () => {
            const response = await api.get<SavedSearchListResponse>('/users/me/saved-searches', {
                params: { page, page_size: pageSize, sort: 'updated_at', order: 'desc' },
            });
            return response.data;
        },
    });
};

export const useCreateSavedSearch = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: SavedSearchCreate) => {
            const response = await api.post<SavedSearch>('/users/me/saved-searches', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
            toast({
                title: 'Search saved',
                description: 'Your search has been saved successfully.',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to save search. Please try again.',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateSavedSearch = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SavedSearchUpdate }) => {
            const response = await api.patch<SavedSearch>(`/users/me/saved-searches/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
            toast({
                title: 'Search updated',
                description: 'Your saved search has been updated.',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to update saved search.',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteSavedSearch = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/users/me/saved-searches/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
            toast({
                title: 'Search deleted',
                description: 'Your saved search has been removed.',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to delete saved search.',
                variant: 'destructive',
            });
        },
    });
};

export const useExecuteSavedSearch = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, page = 1, pageSize = 20 }: { id: string; page?: number; pageSize?: number }) => {
            const response = await api.post(`/users/me/saved-searches/${id}/execute`, null, {
                params: { page, page_size: pageSize },
            });
            return response.data;
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to execute search.',
                variant: 'destructive',
            });
        },
    });
};
