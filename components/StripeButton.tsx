'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import type { PlanTier } from '@/types';

interface StripeButtonProps {
    plan: Exclude<PlanTier, 'free'>;
    label?: string;
    className?: string;
}

/**
 * Calls POST /api/billing/create-checkout-session and redirects to
 * the Stripe-hosted checkout page. Errors surface via Phase-B Toast.
 */
export function StripeButton({ plan, label, className }: StripeButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toasts, addToast, removeToast } = useToasts();
    const router = useRouter();

    async function handleClick() {
        setLoading(true);

        try {
            const res = await fetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });

            const data = (await res.json()) as { url?: string; error?: string };

            if (!res.ok || !data.url) {
                throw new Error(data.error ?? 'Something went wrong. Please try again.');
            }

            // Redirect to Stripe Checkout — don't reset loading; page navigates away
            router.push(data.url);
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
            setLoading(false);
        }
    }

    const defaultLabel = plan === 'starter' ? 'Start Starter' : 'Start Growth';

    return (
        <>
            {/* Toast stack — Phase-B, bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <button
                type="button"
                onClick={() => void handleClick()}
                disabled={loading}
                aria-busy={loading}
                className={
                    className ??
                    'inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2'
                }
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Redirecting…</span>
                    </>
                ) : (
                    label ?? defaultLabel
                )}
            </button>
        </>
    );
}
