import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { data: profile } = (await supabase
        .from('profiles')
        .select('full_name, company_name, phone, company_logo_url')
        .eq('id', user.id)
        .maybeSingle()) as { data: { full_name: string; company_name: string; phone: string; company_logo_url: string | null } | null };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-light">
                        Account setup
                    </p>
                    <h1 className="text-3xl font-semibold text-white">Complete your profile</h1>
                    <p className="text-base leading-7 text-slate-300">
                        Add your business details so QuotePro can personalize your workspace for UAE contracting quotes.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft md:p-8">
                    <ProfileForm
                        initialValues={{
                            full_name: profile?.full_name ?? user.user_metadata.full_name ?? '',
                            company_name: profile?.company_name ?? '',
                            phone: profile?.phone ?? '',
                        }}
                        userEmail={user.email ?? ''}
                        userId={user.id}
                        currentLogoUrl={profile?.company_logo_url}
                    />
                </div>
            </div>
        </main>
    );
}
