'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ImpersonatePage() {
    const [error, setError] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let timeoutId: NodeJS.Timeout;

        // Manual hash extraction for access_token
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                }).then(({ error }) => {
                    if (!error) {
                        window.location.href = '/app/dashboard';
                    }
                });
                return;
            }
        }

        // Check for PKCE code
        const query = new URLSearchParams(window.location.search);
        const code = query.get('code');
        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (!error) window.location.href = '/app/dashboard';
            });
            return;
        }

        // Immediate session check on mount
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                window.location.href = '/app/dashboard';
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                window.location.href = '/app/dashboard';
            }
        });

        // Timeout fallback
        timeoutId = setTimeout(() => {
            setError(true);
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <p className="text-red-400 text-lg mb-6">Link expired or invalid</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-300 text-lg">Logging you in securely... Please wait.</p>
            </div>
        </div>
    );
}
