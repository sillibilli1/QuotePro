'use client';

import { Zap, FileText, Globe } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'AI-Generated in Seconds',
        description:
            'Describe the job in a sentence. QuotePro structures it into professional line items with accurate UAE market rates.',
        color: 'bg-amber-500/10 text-amber-400',
    },
    {
        icon: FileText,
        title: 'Branded PDF & Share Link',
        description:
            'Every quote gets a clean PDF and a public shareable link your clients can view on any device — no app needed.',
        color: 'bg-teal-500/10 text-teal-400',
    },
    {
        icon: Globe,
        title: 'Multi-Currency, Multi-Region',
        description:
            'Prices auto-adjust for UAE (AED), Pakistan (PKR), and international (USD) — the right price for every market.',
        color: 'bg-violet-500/10 text-violet-400',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="bg-slate-950 px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl">
                {/* Heading */}
                <div className="mb-14 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        Why QuotePro
                    </p>
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Everything you need to win work
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
                        Built for contractors, freelancers, and agencies in the UAE and beyond — from first
                        impression to signed agreement.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid gap-6 sm:grid-cols-3">
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={feat.title}
                                className="reveal-up group rounded-3xl border border-white/8 bg-slate-900/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/25 hover:shadow-xl hover:shadow-teal-500/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Icon */}
                                <div
                                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feat.color}`}
                                >
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>

                                <h3 className="mb-2 text-lg font-semibold text-white">{feat.title}</h3>
                                <p className="text-sm leading-relaxed text-slate-400">{feat.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
