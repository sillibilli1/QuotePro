import Link from 'next/link';
import type { PricingPlan } from '@/lib/pricing';
import { StripeButton } from '@/components/StripeButton';

interface PricingCardProps {
    pricing: PricingPlan;
    currentPlan?: string | null;
}

function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

function CheckIcon() {
    return (
        <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-light"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2 text-sm text-slate-300">
            <CheckIcon />
            <span>{text}</span>
        </li>
    );
}

export function PricingCards({ pricing, currentPlan }: PricingCardProps) {
    const { free, starter, growth } = pricing;
    const currency = starter.currency;
    const isOnStarter = currentPlan === 'starter';
    const isOnGrowth = currentPlan === 'growth';

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* ── FREE ── */}
            <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Free</p>
                    <div className="mt-3 flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">0</span>
                        <span className="mb-1 text-slate-400">/{currency}/mo</span>
                    </div>
                </div>

                <ul className="flex flex-col gap-3">
                    <FeatureItem text={`${free.quotes} quotes per month`} />
                    <FeatureItem text="PDF with watermark" />
                    <FeatureItem text="WhatsApp share" />
                    <FeatureItem text="Basic AI generation" />
                </ul>

                <div className="mt-auto">
                    {!currentPlan ? (
                        <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-400 cursor-default">
                            Current Plan
                        </span>
                    ) : (
                        <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400">
                            Included
                        </span>
                    )}
                </div>
            </div>

            {/* ── STARTER ── */}
            <div className="relative flex flex-1 flex-col gap-6 rounded-3xl border border-brand/40 bg-slate-900/80 p-6 shadow-lg shadow-brand/10 ring-1 ring-brand/20">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                        ★ Most Popular
                    </span>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">Starter</p>
                    <div className="mt-3 flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">
                            {formatPrice(starter.price, currency)}
                        </span>
                        <span className="mb-1 text-slate-400">/mo</span>
                    </div>
                </div>

                <ul className="flex flex-col gap-3">
                    <FeatureItem text={`${starter.quotes} quotes per month`} />
                    <FeatureItem text="PDF downloads (no watermark)" />
                    <FeatureItem text="WhatsApp share" />
                    <FeatureItem text="Client history" />
                    <FeatureItem text="Quote status tracking" />
                </ul>

                <div className="mt-auto">
                    {isOnStarter ? (
                        <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-brand/20 px-5 py-3 text-sm font-semibold text-brand-light cursor-default">
                            Current Plan
                        </span>
                    ) : isOnGrowth ? (
                        <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400">
                            Included in Growth
                        </span>
                    ) : (
                        <StripeButton plan="starter" label="Start Starter" />
                    )}
                </div>
            </div>

            {/* ── GROWTH ── */}
            <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Growth</p>
                    <div className="mt-3 flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">
                            {formatPrice(growth.price, currency)}
                        </span>
                        <span className="mb-1 text-slate-400">/mo</span>
                    </div>
                </div>

                <ul className="flex flex-col gap-3">
                    <FeatureItem text="Unlimited quotes" />
                    <FeatureItem text="Everything in Starter" />
                    <FeatureItem text="Quote templates" />
                    <FeatureItem text="Arabic UI" />
                    <FeatureItem text="Invoice generation" />
                    <FeatureItem text="Priority support" />
                </ul>

                <div className="mt-auto">
                    {isOnGrowth ? (
                        <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-brand/20 px-5 py-3 text-sm font-semibold text-brand-light cursor-default">
                            Current Plan
                        </span>
                    ) : (
                        <StripeButton
                            plan="growth"
                            label="Start Growth"
                            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-brand/40 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

/** FAQ accordion item (static — no JS needed) */
function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details className="group rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
                {question}
                <svg
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{answer}</p>
        </details>
    );
}

export function PricingFAQ({ currency }: { currency: string }) {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
            <FaqItem
                question="Can I cancel anytime?"
                answer="Yes, cancel anytime from your dashboard. You keep full access until the end of your current billing period — no pro-rated refunds, no surprises."
            />
            <FaqItem
                question={`What currency will I be charged in?`}
                answer={`You'll be charged in ${currency} based on your location. Pakistani users are charged in PKR via Stripe's native currency support — your Visa or Mastercard will work.`}
            />
            <FaqItem
                question="What payment methods work?"
                answer="Visa, Mastercard, and all major cards work through Stripe. If you prefer to pay by bank transfer, use the manual payment option below."
            />
            <FaqItem
                question="Can I upgrade or downgrade?"
                answer="Yes. Upgrades take effect immediately. Downgrades take effect at the next billing cycle."
            />
        </section>
    );
}

export function BankTransferCTA() {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
            <p className="text-sm text-slate-400">Prefer to pay by bank transfer?</p>
            <Link
                href="/app/manual-payment"
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
                Pay via Bank Transfer
            </Link>
        </div>
    );
}
