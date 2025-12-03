import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserProfileForm } from './UserProfileForm';
import { useUserProfile, useUpdateUserProfile, useUpdateUserPreferences } from '@/hooks/useUserProfile';

// Mock the hooks
vi.mock('@/hooks/useUserProfile');

const mockUser = {
    id: '123',
    email: 'test@example.com',
    full_name: 'John Doe',
    phone_number: '1234567890',
    state: 'Lagos',
    lga: 'Ikeja',
    role: 'student',
    preferences: {
        theme: 'light',
        notifications: {
            email: true,
            push: false,
            deadline_alerts: true,
            new_programs: false,
        },
    },
};

describe('UserProfileForm', () => {
    const mockUpdateProfile = { mutate: vi.fn(), isPending: false };
    const mockUpdatePreferences = { mutate: vi.fn(), isPending: false };

    beforeEach(() => {
        vi.clearAllMocks();
        (useUserProfile as any).mockReturnValue({ data: mockUser, isLoading: false });
        (useUpdateUserProfile as any).mockReturnValue(mockUpdateProfile);
        (useUpdateUserPreferences as any).mockReturnValue(mockUpdatePreferences);
    });

    it('renders with initial data', () => {
        render(<UserProfileForm />);
        expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('1234567890');
        expect(screen.getByLabelText(/state/i)).toHaveValue('Lagos');
    });

    it('validates required fields', async () => {
        render(<UserProfileForm />);
        const nameInput = screen.getByLabelText(/full name/i);
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        });
    });

    it('calls updateProfile mutation on submission', async () => {
        render(<UserProfileForm />);
        const nameInput = screen.getByLabelText(/full name/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(mockUpdateProfile.mutate).toHaveBeenCalledWith(expect.objectContaining({
                full_name: 'Jane Doe',
            }));
        });
    });

    it('calls updatePreferences mutation on submission', async () => {
        render(<UserProfileForm />);
        const emailSwitch = screen.getByLabelText(/email notifications/i);
        fireEvent.click(emailSwitch); // Toggle off
        fireEvent.click(screen.getByText('Save Preferences'));

        await waitFor(() => {
            expect(mockUpdatePreferences.mutate).toHaveBeenCalledWith(expect.objectContaining({
                notifications: expect.objectContaining({
                    email: false,
                }),
            }));
        });
    });

    it('shows loading state', () => {
        (useUserProfile as any).mockReturnValue({ data: null, isLoading: true });
        render(<UserProfileForm />);
        expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });
});
