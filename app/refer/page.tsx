// Server Component — reads user session + referral_code from profile
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReferralCard } from '@/components/ReferralCard';

export default async function ReferPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('referral_code, bonus_quotes')
        .eq('id', user.id)
        .maybeSingle();

    const referralCode: string = profile?.referral_code ?? '';
    const bonusQuotes: number = profile?.bonus_quotes ?? 0;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quotepro.app';

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10">
            <div className="mx-auto max-w-xl space-y-6">
                {/* Back link */}
                <a
                    href="/app/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                    ← Back to dashboard
                </a>

                {/* Bonus balance */}
                {bonusQuotes > 0 && (
                    <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-300">
                        🎉 You have <strong>{bonusQuotes} bonus quote{bonusQuotes !== 1 ? 's' : ''}</strong> from referrals.
                    </div>
                )}

                <ReferralCard referralCode={referralCode} appUrl={appUrl} />
            </div>
        </main>
    );
}
