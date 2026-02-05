import { FC, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const DebugAuthPage: FC = () => {
    const [envInfo, setEnvInfo] = useState<any>({});
    const [authCheck, setAuthCheck] = useState<any>({ status: 'running' });

    useEffect(() => {
        // Safe check of environment variables
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setEnvInfo({
            VITE_SUPABASE_URL: {
                exists: !!url,
                type: typeof url,
                length: url?.length,
                startsWithHttps: url?.startsWith('https://'),
                containsQuotes: url?.includes('"') || url?.includes("'"),
                hasWhitespace: url?.trim() !== url,
                // Show first 8 chars safely to verify correct project
                preview: url ? `${url.substring(0, 15)}...` : 'undefined'
            },
            VITE_SUPABASE_ANON_KEY: {
                exists: !!key,
                length: key?.length
            }
        });

        // Test Supabase Configuration
        try {
            // @ts-ignore - Accessing internal property for debugging
            const authUrl = supabase.auth.url;
            // OR checks generic supabase URL

            setAuthCheck(prev => ({
                ...prev,
                clientInitialized: true,
                // Check if we can get a session (even if null)
                sessionCheck: 'attempting...'
            }));

            supabase.auth.getSession().then(({ data, error }) => {
                setAuthCheck(prev => ({
                    ...prev,
                    sessionCheck: 'success',
                    hasSession: !!data.session,
                    error: error ? error.message : null
                }));
            }).catch(err => {
                setAuthCheck(prev => ({
                    ...prev,
                    sessionCheck: 'failed',
                    exception: err.message
                }));
            });

        } catch (err: any) {
            setAuthCheck({ status: 'crashed', error: err.message });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-mono text-sm">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-red-600">Auth Debugger</h1>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Environment Variables</h2>
                    <pre className="bg-gray-50 p-4 rounded overflow-auto">
                        {JSON.stringify(envInfo, null, 2)}
                    </pre>

                    <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded">
                        <h3 className="font-bold">Checklist:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>startsWithHttps</strong> must be <code>true</code></li>
                            <li><strong>containsQuotes</strong> must be <code>false</code> (Render sometimes includes quotes)</li>
                            <li><strong>hasWhitespace</strong> must be <code>false</code></li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Supabase Client Test</h2>
                    <pre className="bg-gray-50 p-4 rounded overflow-auto">
                        {JSON.stringify(authCheck, null, 2)}
                    </pre>
                </div>

                <div className="text-center">
                    <a href="/login" className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary/90">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};
