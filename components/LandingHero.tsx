'use client';

import { type FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/Button';

export function LandingHero() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        setError(null);

        const { error: signInError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (signInError) {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
            return;
        }

        setMessage('Check your email — your secure magic link is on its way.');
        setSubmitting(false);
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 px-4 py-20 md:py-32">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-600/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl text-center">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-300">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                    AI-Powered Quote Generation
                </div>

                {/* Heading */}
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
                    Generate professional quotes{' '}
                    <span className="text-teal-400">in 60 seconds</span>
                </h1>

                {/* Subheading */}
                <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
                    Built for UAE contractors, maintenance companies, and fit-out specialists.
                    Win more business with bilingual Arabic + English PDFs — ready to share on WhatsApp.
                </p>

                {/* CTAs */}
                {!showForm && !message ? (
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => setShowForm(true)}
                            className="min-h-[48px] w-full rounded-xl bg-teal-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-400 active:scale-95 sm:w-auto"
                        >
                            Start Free
                        </button>
                        <a
                            href="#features"
                            className="min-h-[48px] w-full rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10 active:scale-95 sm:w-auto flex items-center justify-center"
                        >
                            See How It Works
                        </a>
                    </div>
                ) : null}

                {/* Auth form */}
                {showForm && !message ? (
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto mt-2 flex max-w-md flex-col gap-3"
                        id="sign-in"
                    >
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your work email"
                            className="min-h-[48px] w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {error && (
                            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="min-h-[48px] w-full rounded-xl bg-teal-500 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Sending magic link…' : 'Send Magic Link'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="text-sm text-slate-400 hover:text-slate-300"
                        >
                            Cancel
                        </button>
                    </form>
                ) : null}

                {/* Success message */}
                {message && (
                    <div className="mx-auto mt-2 max-w-md rounded-xl border border-teal-500/30 bg-teal-500/10 px-6 py-4 text-center text-teal-300">
                        ✉️ {message}
                    </div>
                )}

                {/* Trust line */}
                <p className="mt-6 text-sm text-slate-500">
                    No credit card required • 5 free quotes per month
                </p>
            </div>
        </section>
    );
}
