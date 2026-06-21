'use client';

import { Users, Sparkles, Eye, Receipt, MessageCircle, Banknote } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Mini-CRM',
        description: 'Save client details once, reuse them forever. No more copy-pasting contact info.',
    },
    {
        icon: Sparkles,
        title: 'AI Line-Item Generation',
        description: 'AI writes professional descriptions with estimated pricing. You just review and send.',
    },
    {
        icon: Eye,
        title: 'Live Tracking',
        description: 'Know exactly when your client views your document. Follow up at the perfect moment.',
    },
    {
        icon: Receipt,
        title: 'One-Click Invoicing',
        description: 'Seamlessly convert accepted quotes to invoices. No re-entering data.',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp Ready',
        description: 'Generate secure links optimized for mobile sharing. Your clients love it.',
    },
    {
        icon: Banknote,
        title: 'Multi-Currency',
        description: 'Dynamic pricing for AED, PKR, USD, and more. Serve clients anywhere.',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="bg-slate-950 px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-6xl">
                {/* Heading */}
                <div className="mb-14 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        The Arsenal
                    </p>
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Everything you need to win work
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
                        A complete Quote-to-Payment suite. Not just an AI wrapper — a real CRM built for modern contractors.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={feat.title}
                                className="reveal-up group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                {/* Icon */}
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>

                                <h3 className="mb-2 text-base font-semibold text-white">{feat.title}</h3>
                                <p className="text-sm leading-relaxed text-slate-400">{feat.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
