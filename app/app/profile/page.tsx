import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileSettings } from '@/components/ProfileSettings';
import type { PlanTier, ProfileRecord } from '@/types';

export const metadata = {
    title: 'Account — QuotePro',
};

/**
 * /app/profile — Account settings page.
 * UI redesigned with sectioned Cards (Personal, Company, Plan).
 * All Supabase fetch + save logic is unchanged; only the presentation is new.
 */
export default async function ProfilePage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // Fetch profile fields needed by the settings sections
    const { data: profile } = (await supabase
        .from('profiles')
        .select('full_name, company_name, phone, plan')
        .eq('id', user.id)
        .maybeSingle()) as {
            data: Pick<ProfileRecord, 'full_name' | 'company_name' | 'phone' | 'plan'> | null;
        };

    const plan: PlanTier = (profile?.plan as PlanTier | null) ?? 'free';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Account"
                subtitle="Manage your personal details, company information, and subscription."
            />

            <div className="mx-auto max-w-2xl">
                <ProfileSettings
                    initialValues={{
                        full_name: profile?.full_name ?? '',
                        company_name: profile?.company_name ?? '',
                        phone: profile?.phone ?? '',
                    }}
                    userEmail={user.email ?? ''}
                    plan={plan}
                />
            </div>
        </div>
    );
}
