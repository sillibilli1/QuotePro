import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import type { PlanTier } from '@/types';

/**
 * Authenticated app layout — wraps every /app/* page in the AppShell.
 * Auth guard is handled by middleware; this layout only adds the shell UI.
 * Fetches user + profile so the top bar can show email and plan badge.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Middleware already redirects unauthenticated requests; this is a safety net.
    if (!user) {
        redirect('/');
    }

    const { data: profile } = (await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()) as { data: Pick<import('@/types').ProfileRecord, 'plan'> | null };

    const plan: PlanTier = (profile?.plan as PlanTier | null) ?? 'free';

    return (
        <AppShell userEmail={user.email ?? ''} plan={plan}>
            {children}
        </AppShell>
    );
}
