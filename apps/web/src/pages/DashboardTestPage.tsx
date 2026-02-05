import { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const DashboardTestPage: FC = () => {
    const { user, profile, isLoading, isAuthenticated, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Dashboard Diagnostic Test</h1>

                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
                    <div className="space-y-2">
                        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                        <p><strong>User ID:</strong> {user?.id || 'null'}</p>
                        <p><strong>User Email:</strong> {user?.email || 'null'}</p>
                        <p><strong>Profile:</strong> {profile ? JSON.stringify(profile, null, 2) : 'null'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Component Import Test</h2>
                    <p className="text-green-600">✅ DashboardTestPage rendered successfully</p>
                    <p className="text-sm text-gray-600 mt-2">
                        If you can see this page, routing and basic component rendering work.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Test Logout
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Click to test if logout function works
                    </p>
                </div>
            </div>
        </div>
    );
};

DashboardTestPage.displayName = 'DashboardTestPage';
