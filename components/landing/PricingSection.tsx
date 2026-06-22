import type { PricingPlan } from '@/lib/pricing';
import { PricingCards } from '@/components/pricing/PricingCard';

interface PricingSectionProps {
    pricing: PricingPlan;
}

export function PricingSection({ pricing }: PricingSectionProps) {
    return (
        <section id="pricing" className="bg-slate-900 px-4 py-24 md:py-32">
            <div className="mx-auto max-w-5xl">
                {/* Heading */}
                <div className="mb-14 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        Pricing
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Simple, honest pricing
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
                        Prices shown in{' '}
                        <span className="font-semibold text-white">{pricing.starter.currency}</span>.
                        Upgrade or cancel anytime.
                    </p>
                </div>

                {/* Cards — prices from getPricing(), never hardcoded */}
                <div className="reveal-up">
                    <PricingCards pricing={pricing} currentPlan={null} isPublic={true} />
                </div>
            </div>
        </section>
    );
}
