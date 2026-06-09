// Server Component — receives pricing from getPricing(), no hardcoded prices

import type { PricingPlan } from '@/lib/pricing';

interface PricingSectionProps {
    pricing: PricingPlan;
}

function formatPrice(price: number, currency: string): string {
    if (currency === 'USD') return `$${price}`;
    return `${currency} ${price.toLocaleString()}`;
}

export function PricingSection({ pricing }: PricingSectionProps) {
    const { starter, growth } = pricing;

    return (
        <section id="pricing" className="bg-slate-900 px-4 py-20">
            <div className="mx-auto max-w-5xl">
                {/* Section heading */}
                <div className="mb-14 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-slate-400">Prices shown in your local currency.</p>
                </div>

                {/* Pricing cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Free */}
                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6">
                            <h3 className="mb-1 text-lg font-semibold text-white">Free</h3>
                            <p className="text-slate-400 text-sm">Get started at no cost</p>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">
                                    {starter.currency === 'USD' ? '$' : starter.currency + ' '}0
                                </span>
                                <span className="ml-1 text-slate-400">/month</span>
                            </div>
                        </div>
                        <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> 5 quotes per month
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> PDF with watermark
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> WhatsApp sharing
                            </li>
                        </ul>
                        <a
                            href="#sign-in"
                            className="block min-h-[48px] w-full rounded-xl border border-white/20 bg-white/5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                        >
                            Start Free
                        </a>
                    </div>

                    {/* Starter — highlighted */}
                    <div className="relative flex flex-col rounded-2xl border-2 border-teal-500 bg-teal-500/10 p-6 shadow-lg shadow-teal-500/10">
                        {/* Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="rounded-full bg-teal-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                Most Popular
                            </span>
                        </div>
                        <div className="mb-6">
                            <h3 className="mb-1 text-lg font-semibold text-white">Starter</h3>
                            <p className="text-slate-400 text-sm">For growing contractors</p>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">
                                    {formatPrice(starter.price, starter.currency)}
                                </span>
                                <span className="ml-1 text-slate-400">/month</span>
                            </div>
                        </div>
                        <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> 30 quotes per month
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> PDF without watermark
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> WhatsApp sharing + view tracking
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Client history
                            </li>
                        </ul>
                        <a
                            href="#sign-in"
                            className="block min-h-[48px] w-full rounded-xl bg-teal-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-400 active:scale-95"
                        >
                            Start Starter
                        </a>
                    </div>

                    {/* Growth */}
                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="mb-6">
                            <h3 className="mb-1 text-lg font-semibold text-white">Growth</h3>
                            <p className="text-slate-400 text-sm">For established businesses</p>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-white">
                                    {formatPrice(growth.price, growth.currency)}
                                </span>
                                <span className="ml-1 text-slate-400">/month</span>
                            </div>
                        </div>
                        <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Unlimited quotes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Everything in Starter
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Quote templates
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Arabic UI
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-400">✓</span> Invoice generation
                            </li>
                        </ul>
                        <a
                            href="#sign-in"
                            className="block min-h-[48px] w-full rounded-xl border border-white/20 bg-white/5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                        >
                            Start Growth
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
