'use client';

import { Sparkles, Eye, CheckCircle, Receipt } from 'lucide-react';

const steps = [
    {
        icon: Sparkles,
        title: 'AI Smart Quotes',
        description:
            'Type a basic request, AI generates detailed line items with professional descriptions and pricing.',
    },
    {
        icon: Eye,
        title: 'Share & Track',
        description:
            'Send via WhatsApp or email, get notified instantly when your client opens it.',
    },
    {
        icon: CheckCircle,
        title: 'Client Accepts',
        description:
            'One-click approval from the client — no back-and-forth, no confusion.',
    },
    {
        icon: Receipt,
        title: 'Instant Invoice',
        description:
            'Convert the quote to an invoice with your bank details auto-filled. Done.',
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-slate-900 px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-6xl">
                {/* Heading */}
                <div className="mb-16 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        The Workflow
                    </p>
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        From Quote to Payment in 4 Steps
                    </h2>
                </div>

                {/* Horizontal 4-Column Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.title}
                                className="reveal-up flex flex-col items-center text-center gap-4"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* Icon Circle */}
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10">
                                    <Icon className="h-9 w-9 text-teal-400" aria-hidden="true" />
                                    <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-slate-950">
                                        {i + 1}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white">{step.title}</h3>

                                {/* Description */}
                                <p className="text-sm leading-relaxed text-slate-400">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
