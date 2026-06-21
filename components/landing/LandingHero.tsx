'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Play } from 'lucide-react';

const trustItems = [
    'No credit card required',
    'Free forever tier',
    'UAE & GCC pricing',
];

export function LandingHero() {
    return (
        <section className="relative overflow-hidden bg-slate-950 px-4 pb-20 pt-24 sm:pb-28 sm:pt-32">
            {/* Enhanced radial gradient glow */}
            <div
                className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-radial from-teal-600/20 via-teal-600/10 to-transparent blur-[140px]"
                aria-hidden="true"
            />

            <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {/* ── Left: copy ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-6 reveal-up">
                    {/* Eyebrow */}
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                        QuotePro — Quote-to-Payment Suite
                    </div>

                    {/* Heading */}
                    <h1 className="text-display font-extrabold leading-[1.1] tracking-tight text-white">
                        Win More Jobs.{' '}
                        <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                            Turn Quotes into Invoices in Seconds.
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg leading-relaxed text-slate-400 sm:text-xl">
                        Stop juggling Excel and messy paper receipts. Let AI write your quotes, track client views,
                        and convert them to professional invoices instantly. Built for modern contractors.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link
                            href="/auth"
                            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-400 hover:shadow-teal-400/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none"
                        >
                            Start Free
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border border-white/15 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none"
                        >
                            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                            See How It Works
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="pt-2">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                            Trusted by Service Professionals globally
                        </p>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2">
                            {trustItems.map((item) => (
                                <li key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Right: phone mockup ─────────────────────────────────────── */}
                <div className="flex justify-center reveal-up" style={{ animationDelay: '120ms' }}>
                    <div className="relative w-[280px] sm:w-[320px]">
                        {/* Phone frame */}
                        <div className="relative rounded-[2.5rem] border-[6px] border-slate-700 bg-slate-900 shadow-2xl shadow-black/60">
                            {/* Notch */}
                            <div className="mx-auto mb-2 mt-3 h-5 w-24 rounded-full bg-slate-700" />

                            {/* Screen content — quote to invoice mockup */}
                            <div className="overflow-hidden rounded-[1.8rem] bg-slate-950 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-teal-400">Quote → Invoice</span>
                                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                        ACCEPTED
                                    </span>
                                </div>
                                <p className="mb-1 text-[11px] text-slate-500">Client</p>
                                <p className="mb-3 text-sm font-semibold text-white">Apartment Renovation</p>

                                {/* Line items */}
                                {[
                                    { label: 'Demolition work', amount: '2,500' },
                                    { label: 'Plastering & paint', amount: '4,800' },
                                    { label: 'Flooring tiles', amount: '6,200' },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="mb-1.5 flex justify-between rounded-lg bg-slate-800/80 px-3 py-1.5"
                                    >
                                        <span className="text-[11px] text-slate-300">{row.label}</span>
                                        <span className="text-[11px] font-medium text-white">
                                            AED {row.amount}
                                        </span>
                                    </div>
                                ))}

                                {/* Total */}
                                <div className="mt-3 rounded-xl bg-teal-500/15 px-3 py-2.5">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-semibold text-teal-300">Grand Total</span>
                                        <span className="text-sm font-bold text-teal-300">AED 14,227</span>
                                    </div>
                                </div>

                                {/* Convert to Invoice button */}
                                <div className="mt-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-2 text-center">
                                    <span className="text-xs font-bold text-slate-950">Convert to Invoice →</span>
                                </div>
                            </div>

                            {/* Home bar */}
                            <div className="mx-auto mb-2 mt-3 h-1 w-20 rounded-full bg-slate-700" />
                        </div>

                        {/* Glow under phone */}
                        <div
                            className="absolute -bottom-6 left-1/2 h-20 w-48 -translate-x-1/2 rounded-full bg-teal-600/20 blur-2xl"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
