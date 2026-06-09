'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type BrowserSupabaseClient = ReturnType<typeof createClient>;

type AuthContextValue = {
    supabase: BrowserSupabaseClient;
    session: Session | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [supabase] = useState(() => createClient());
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        supabase.auth
            .getSession()
            .then(({ data }: { data: { session: Session | null } }) => {
                if (!mounted) {
                    return;
                }

                setSession(data.session);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }

                setLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, nextSession: Session | null) => {
            setSession(nextSession);
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    return <AuthContext.Provider value={{ supabase, session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
