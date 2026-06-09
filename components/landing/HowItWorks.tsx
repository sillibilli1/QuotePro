'use client';

import { MessageSquare, Sparkles, Share2 } from 'lucide-react';

const steps = [
    {
        icon: MessageSquare,
        number: '01',
        title: 'Describe',
        description:
            'Type a short project brief in plain language — scope, materials, or job type. No forms to fill.',
    },
    {
        icon: Sparkles,
        number: '02',
        title: 'Generate',
        description:
            'AI builds a professional, itemised quote with quantities, rates, and VAT — ready in seconds.',
    },
    {
        icon: Share2,
        number: '03',
        title: 'Share',
        description:
            'Send a branded link via WhatsApp or email. Clients see a clean, read-only document — no login needed.',
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-slate-900 px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl">
                {/* Heading */}
                <div className="mb-16 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        Simple process
                    </p>
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Three steps to a sent quote
                    </h2>
                </div>

                {/* Steps grid */}
                <div className="relative grid gap-8 md:grid-cols-3">
                    {/* Connector line — desktop only */}
                    <div
                        className="pointer-events-none absolute inset-x-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-teal-600/40 to-transparent md:block"
                        aria-hidden="true"
                    />

                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="reveal-up flex flex-col items-center gap-5 text-center"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* Icon circle */}
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10">
                                    <Icon className="h-8 w-8 text-teal-400" aria-hidden="true" />
                                    {/* Step number badge */}
                                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-slate-950">
                                        {i + 1}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
