import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPricing } from '@/lib/pricing';
import { PricingCards } from '@/components/pricing/PricingCard';
import { UpgradeSheetClient } from '@/components/pricing/UpgradeSheetClient';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { BankTransferCTA } from '@/components/PricingCard';
import type { ProfileRecord } from '@/types';

export const metadata = {
    title: 'Upgrade — QuotePro',
};

export default async function UpgradePage() {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // ── Profile (country + plan) ───────────────────────────────────────────
    const { data: profile } = (await supabase
        .from('profiles')
        .select('country_code, currency_code, plan, is_subscribed')
        .eq('id', user.id)
        .maybeSingle()) as {
            data: Pick<ProfileRecord, 'country_code' | 'currency_code' | 'plan' | 'is_subscribed'> | null;
        };

    const countryCode = profile?.country_code ?? 'AE';
    // STRICT CHECK: If not subscribed, always show 'free' regardless of plan column
    const currentPlan = profile?.is_subscribed ? profile.plan : 'free';

    // ── Pricing for this user's region ────────────────────────────────────
    const pricing = getPricing(countryCode);

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10">
            {/*
              Mobile bottom-sheet: auto-opens when ?sheet=1 is in the URL.
              UsageBanner / limit-wall components should link to /app/upgrade?sheet=1.
              Wrapped in Suspense because UpgradeSheetClient calls useSearchParams().
            */}
            <Suspense fallback={null}>
                <UpgradeSheetClient pricing={pricing} currentPlan={currentPlan} />
            </Suspense>

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
                {/* Header */}
                <header className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
                        QuotePro Plans
                    </p>
                    <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                        Choose the right plan
                    </h1>
                    <p className="mt-3 text-base text-slate-400">
                        Prices shown in{' '}
                        <span className="font-semibold text-white">{pricing.starter.currency}</span>.
                        Cancel anytime.
                    </p>
                </header>

                {/* Pricing cards — shared component, geo-correct prices, checkout logic unchanged */}
                <PricingCards pricing={pricing} currentPlan={currentPlan} isPublic={false} />

                {/* Bank transfer CTA — positioned after pricing cards */}
                <div className="mt-12">
                    <BankTransferCTA />
                </div>

                {/* FAQ — reused accordion from landing */}
                <div className="mt-16">
                    <FAQAccordion className="bg-transparent py-4" />
                </div>
            </div>
        </main>
    );
}
