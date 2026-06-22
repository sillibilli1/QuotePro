'use client';

import { X, CheckCircle2 } from 'lucide-react';

export function BeforeAfterSection() {
    return (
        <section className="bg-slate-950 px-4 py-24 md:py-32">
            <div className="mx-auto max-w-6xl">
                {/* Heading */}
                <div className="mb-16 text-center reveal-up">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Why Switch to QuotePro?
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                        Stop wasting hours on manual work. Let automation handle the heavy lifting.
                    </p>
                </div>

                {/* Split comparison */}
                <div className="grid gap-8 md:grid-cols-2 reveal-up" style={{ animationDelay: '120ms' }}>
                    {/* Left: The Old Way */}
                    <div className="rounded-3xl border border-red-900/30 bg-slate-900/40 p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/30">
                                <X className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-300">The Old Way</h3>
                        </div>

                        <ul className="space-y-4">
                            {[
                                'Messy Excel sheets',
                                'Manual VAT calculations',
                                'Lost WhatsApp messages',
                                'Guessing if clients viewed the quote',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                                    <span className="text-slate-400">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: The QuotePro Way */}
                    <div className="rounded-3xl border-2 border-teal-500/40 bg-slate-900 p-8 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20">
                                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">The QuotePro Way</h3>
                        </div>

                        <ul className="space-y-4">
                            {[
                                'AI-generated line items',
                                'Automated taxes',
                                'One-click PDF invoices',
                                'Live view tracking',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                                    <span className="text-white font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
