'use client';

import { Check, Minus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { PricingPlan } from '@/lib/pricing';
import { getStripePriceId, type BillingPeriod } from '@/lib/stripe-config';
import Link from 'next/link';

// ── helpers ────────────────────────────────────────────────────────────────────
function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

// ── FeatureRow ─────────────────────────────────────────────────────────────────
function FeatureRow({ text, included = true }: { text: string; included?: boolean }) {
    return (
        <li className="flex items-start gap-2.5">
            {included ? (
                <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
                    aria-hidden="true"
                />
            ) : (
                <Minus
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-600"
                    aria-hidden="true"
                />
            )}
            <span className={`text-sm ${included ? 'text-slate-300' : 'text-slate-500'}`}>
                {text}
            </span>
        </li>
    );
}

// ── PricingCard (single tier) ──────────────────────────────────────────────────
interface SingleCardProps {
    tier: 'free' | 'starter' | 'growth';
    pricing: PricingPlan;
    currentPlan?: string | null;
    isPublic?: boolean;
    billingPeriod: BillingPeriod;
    onUpgrade?: (priceId: string) => Promise<void>;
    isLoading?: boolean;
}

export function PricingCard({ tier, pricing, currentPlan, isPublic = false, billingPeriod, onUpgrade, isLoading }: SingleCardProps) {
    const { free, starter, growth } = pricing;
    const currency = starter.currency;

    const isStarter = tier === 'starter';
    const isGrowth = tier === 'growth';
    const isFree = tier === 'free';

    const isCurrent = currentPlan === tier || (!currentPlan && isFree);

    // Calculate annual prices (monthly * 10)
    const annualMultiplier = 10;
    const starterAnnual = starter.price * annualMultiplier;
    const growthAnnual = growth.price * annualMultiplier;

    // ── Tier metadata ──────────────────────────────────────────────────────────
    const meta = {
        free: {
            label: 'Free',
            priceDisplay: formatPrice(0, currency),
            period: '',
            features: [
                { text: `${free.quotes} quotes per month`, included: true },
                { text: 'PDF with watermark', included: true },
                { text: 'WhatsApp share link', included: true },
                { text: 'Basic AI generation', included: true },
                { text: 'Branded PDF (no watermark)', included: false },
                { text: 'Priority support', included: false },
            ],
        },
        starter: {
            label: 'Starter',
            priceDisplay: billingPeriod === 'annual'
                ? formatPrice(starterAnnual, currency)
                : formatPrice(starter.price, currency),
            period: billingPeriod === 'annual' ? '/year' : '/month',
            features: [
                { text: `${starter.quotes} quotes per month`, included: true },
                { text: 'Branded PDF (no watermark)', included: true },
                { text: 'WhatsApp share link', included: true },
                { text: 'Full AI generation', included: true },
                { text: 'Client view tracking', included: true },
                { text: 'Priority support', included: false },
            ],
        },
        growth: {
            label: 'Growth',
            priceDisplay: billingPeriod === 'annual'
                ? formatPrice(growthAnnual, currency)
                : formatPrice(growth.price, currency),
            period: billingPeriod === 'annual' ? '/year' : '/month',
            features: [
                { text: 'Unlimited quotes', included: true },
                { text: 'Branded PDF (no watermark)', included: true },
                { text: 'WhatsApp share link', included: true },
                { text: 'Full AI generation', included: true },
                { text: 'Client view tracking', included: true },
                { text: 'Priority support', included: true },
            ],
        },
    } as const;

    const current = meta[tier];

    const handleUpgrade = async () => {
        if (!onUpgrade || isFree) return;

        try {
            const priceId = getStripePriceId(currency, tier as 'starter' | 'growth', billingPeriod);
            await onUpgrade(priceId);
        } catch (error) {
            console.error('Upgrade error:', error);
        }
    };

    return (
        <div
            className={[
                'relative flex flex-col rounded-3xl border p-7 transition-all duration-300',
                'hover:shadow-xl motion-reduce:transition-none',
                isStarter
                    ? 'border-teal-500/50 bg-slate-900 ring-1 ring-teal-500/20 hover:shadow-teal-500/10 md:scale-[1.03]'
                    : 'border-white/10 bg-slate-900/60 hover:border-white/20',
            ].join(' ')}
        >
            {/* Most Popular pill */}
            {isStarter && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-slate-950">
                        Most Popular
                    </span>
                </div>
            )}

            {/* Teal top border accent for Starter */}
            {isStarter && (
                <div
                    className="absolute left-7 right-7 top-0 h-0.5 rounded-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600"
                    aria-hidden="true"
                />
            )}

            {/* Tier label */}
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {current.label}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-end gap-1">
                <span className="font-mono text-4xl font-bold tracking-tight text-white">
                    {current.priceDisplay}
                </span>
                {!isFree && (
                    <span className="mb-1 text-sm text-slate-400">{current.period}</span>
                )}
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-white/8" />

            {/* Features */}
            <ul className="flex flex-col gap-3">
                {current.features.map((f) => (
                    <FeatureRow key={f.text} text={f.text} included={f.included} />
                ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
                {isCurrent ? (
                    <span className="inline-flex min-h-[48px] w-full cursor-default items-center justify-center rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-400">
                        Current Plan
                    </span>
                ) : isPublic || isFree ? (
                    <Link
                        href="/auth"
                        className={[
                            'inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none',
                            isStarter
                                ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/20'
                                : 'border border-white/15 text-slate-200 hover:border-white/30 hover:text-white',
                        ].join(' ')}
                    >
                        Get Started Free
                    </Link>
                ) : (
                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className={[
                            'inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed',
                            isStarter
                                ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/20'
                                : 'border border-white/15 text-slate-200 hover:border-white/30 hover:text-white',
                        ].join(' ')}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Upgrade to ${current.label}`
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// ── PricingCards (three-up grid with toggle) ───────────────────────────────────
interface PricingCardsProps {
    pricing: PricingPlan;
    currentPlan?: string | null;
    isPublic?: boolean;
}

export function PricingCards({ pricing, currentPlan, isPublic = false }: PricingCardsProps) {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async (priceId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900/60 border border-white/10 p-1.5">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={[
                            'rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
                            billingPeriod === 'monthly'
                                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                                : 'text-slate-400 hover:text-white',
                        ].join(' ')}
                    >
                        Pay Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod('annual')}
                        className={[
                            'rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
                            billingPeriod === 'annual'
                                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                                : 'text-slate-400 hover:text-white',
                        ].join(' ')}
                    >
                        Pay Annually
                        <span className="ml-1.5 text-xs opacity-90">(Save ~17%)</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3 md:items-start">
                <PricingCard
                    tier="free"
                    pricing={pricing}
                    currentPlan={currentPlan}
                    isPublic={isPublic}
                    billingPeriod={billingPeriod}
                />
                <PricingCard
                    tier="starter"
                    pricing={pricing}
                    currentPlan={currentPlan}
                    isPublic={isPublic}
                    billingPeriod={billingPeriod}
                    onUpgrade={handleUpgrade}
                    isLoading={isLoading}
                />
                <PricingCard
                    tier="growth"
                    pricing={pricing}
                    currentPlan={currentPlan}
                    isPublic={isPublic}
                    billingPeriod={billingPeriod}
                    onUpgrade={handleUpgrade}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
