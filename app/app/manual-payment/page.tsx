import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPricing } from '@/lib/pricing';
import { BankTransferInstructions } from '@/components/BankTransferInstructions';
import type { ProfileRecord } from '@/types';

export const metadata = {
    title: 'Manual Payment — QuotePro',
};

interface PageProps {
    searchParams: { plan?: string };
}

export default async function ManualPaymentPage({ searchParams }: PageProps) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // ── Profile ───────────────────────────────────────────────────────────────
    const { data: profile } = (await supabase
        .from('profiles')
        .select('country_code, currency_code, plan, email')
        .eq('id', user.id)
        .maybeSingle()) as {
            data: Pick<ProfileRecord, 'country_code' | 'currency_code' | 'plan' | 'email'> | null;
        };

    const countryCode = profile?.country_code ?? 'AE';
    const pricing = getPricing(countryCode);

    // Determine selected plan — default to 'starter' if not specified or invalid
    const rawPlan = searchParams.plan;
    const selectedPlan: 'starter' | 'growth' =
        rawPlan === 'growth' ? 'growth' : 'starter';

    const userEmail = user.email ?? profile?.email ?? '';

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10">
            <div className="mx-auto w-full max-w-lg">
                {/* Back link */}
                <Link
                    href="/app/upgrade"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to plans
                </Link>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
                    <header className="mb-8">
                        <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
                            Bank Transfer
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-white">Pay via bank transfer</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Transfer the amount below to our UAE bank account. Once confirmed by our team,
                            your plan will be activated within 24 hours.
                        </p>
                    </header>

                    {/* Plan selector */}
                    <div className="mb-6 flex rounded-xl border border-white/10 p-1">
                        <Link
                            href="/app/manual-payment?plan=starter"
                            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${selectedPlan === 'starter'
                                    ? 'bg-brand text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Starter
                        </Link>
                        <Link
                            href="/app/manual-payment?plan=growth"
                            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${selectedPlan === 'growth'
                                    ? 'bg-brand text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Growth
                        </Link>
                    </div>

                    <BankTransferInstructions
                        pricing={pricing}
                        selectedPlan={selectedPlan}
                        userEmail={userEmail}
                    />
                </div>
            </div>
        </main>
    );
}
