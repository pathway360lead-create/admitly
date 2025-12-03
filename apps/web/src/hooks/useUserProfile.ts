import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
    UserProfile,
    UserProfileUpdate,
    UserPreferencesUpdate,
} from '@/types/user-features';

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await api.get<UserProfile>('/users/me');
            return response.data;
        },
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: UserProfileUpdate) => {
            const response = await api.patch<UserProfile>('/users/me', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast({
                title: 'Profile updated',
                description: 'Your personal information has been updated successfully.',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateUserPreferences = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: UserPreferencesUpdate) => {
            const response = await api.patch<UserProfile>('/users/me/preferences', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast({
                title: 'Preferences updated',
                description: 'Your preferences have been saved.',
            });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to update preferences. Please try again.',
                variant: 'destructive',
            });
        },
    });
};
