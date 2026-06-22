'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, Play } from 'lucide-react';

const trustItems = [
    'No credit card required',
    'Free forever tier',
    'UAE & GCC pricing',
];

export function LandingHero() {
    return (
        <section className="relative overflow-x-hidden bg-slate-950 px-4 py-24 md:py-32">
            {/* Enhanced radial gradient glow */}
            <div
                className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-radial from-teal-600/20 via-teal-600/10 to-transparent blur-[140px]"
                aria-hidden="true"
            />

            <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {/* ── Left: copy ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-6 reveal-up">
                    {/* Heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white">
                        Win More Jobs.{' '}
                        <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                            Turn Quotes into Invoices in Seconds.
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg md:text-xl leading-relaxed text-slate-400">
                        Stop juggling Excel and messy paper receipts. Let AI write your quotes, track client views,
                        and convert them to professional invoices instantly. Built for modern contractors.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link
                            href="/auth"
                            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.4)] transition hover:bg-teal-400 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950 motion-reduce:transition-none"
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

                    {/* Trust text below CTAs */}
                    <p className="text-sm text-slate-500">
                        No credit card required • Cancel anytime
                    </p>

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

                {/* ── Right: Product Screenshot ─────────────────────────────── */}
                <div className="flex justify-center lg:justify-end reveal-up" style={{ animationDelay: '120ms' }}>
                    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(20,184,166,0.2)] z-10 transform scale-[1.1] lg:scale-[1.35] origin-center lg:origin-left">
                        <Image
                            src="/images/hero-dashboard.png"
                            alt="QuotePro Dashboard"
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
