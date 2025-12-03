import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardDescription, Separator, Switch } from '@admitly/ui';
import { useUserProfile, useUpdateUserProfile, useUpdateUserPreferences } from '@/hooks/useUserProfile';

const profileSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    phone_number: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
});

const preferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        deadline_alerts: z.boolean().optional(),
        new_programs: z.boolean().optional(),
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export const UserProfileForm: FC = () => {
    const { data: user, isLoading } = useUserProfile();
    const updateProfile = useUpdateUserProfile();
    const updatePreferences = useUpdateUserPreferences();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: '',
            phone_number: '',
            state: '',
            lga: '',
        },
    });

    const preferencesForm = useForm<PreferencesFormValues>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            theme: 'system',
            notifications: {
                email: true,
                push: true,
                deadline_alerts: true,
                new_programs: true,
            },
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                full_name: user.full_name,
                phone_number: user.phone_number || '',
                state: user.state || '',
                lga: user.lga || '',
            });
            preferencesForm.reset({
                theme: user.preferences.theme || 'system',
                notifications: {
                    email: user.preferences.notifications?.email ?? true,
                    push: user.preferences.notifications?.push ?? true,
                    deadline_alerts: user.preferences.notifications?.deadline_alerts ?? true,
                    new_programs: user.preferences.notifications?.new_programs ?? true,
                },
            });
        }
    }, [user, profileForm, preferencesForm]);

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfile.mutate(data);
    };

    const onPreferencesSubmit = (data: PreferencesFormValues) => {
        updatePreferences.mutate({
            theme: data.theme,
            notifications: data.notifications,
        });
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" {...profileForm.register('full_name')} />
                            {profileForm.formState.errors.full_name && (
                                <p className="text-sm text-destructive">{profileForm.formState.errors.full_name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input id="phone_number" {...profileForm.register('phone_number')} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" {...profileForm.register('state')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lga">LGA</Label>
                                <Input id="lga" {...profileForm.register('lga')} />
                            </div>
                        </div>
                        <Button type="submit" disabled={updateProfile.isPending}>
                            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your app settings and notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Notifications</h3>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_notif">Email Notifications</Label>
                                <Switch
                                    id="email_notif"
                                    checked={preferencesForm.watch('notifications.email')}
                                    onCheckedChange={(checked) => preferencesForm.setValue('notifications.email', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push_notif">Push Notifications</Label>
                                <Switch
                                    id="push_notif"
                                    checked={preferencesForm.watch('notifications.push')}
                                    onCheckedChange={(checked) => preferencesForm.setValue('notifications.push', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label htmlFor="deadline_alerts">Deadline Alerts</Label>
                                <Switch
                                    id="deadline_alerts"
                                    checked={preferencesForm.watch('notifications.deadline_alerts')}
                                    onCheckedChange={(checked) => preferencesForm.setValue('notifications.deadline_alerts', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="new_programs">New Programs</Label>
                                <Switch
                                    id="new_programs"
                                    checked={preferencesForm.watch('notifications.new_programs')}
                                    onCheckedChange={(checked) => preferencesForm.setValue('notifications.new_programs', checked)}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={updatePreferences.isPending}>
                            {updatePreferences.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Preferences
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
