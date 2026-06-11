'use client';

import { useState } from 'react';

interface QuoteActionButtonsProps {
    token: string;
    initialStatus: string;
}

export function QuoteActionButtons({ token, initialStatus }: QuoteActionButtonsProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: 'Accepted' | 'Declined') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/quotes/public/${token}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setStatus(newStatus);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'Accepted') {
        return (
            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 px-6 py-5 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-2 text-lg font-semibold text-green-300">
                    You have accepted this quote
                </p>
                <p className="mt-1 text-sm text-green-400/70">
                    We'll be in touch shortly to proceed.
                </p>
            </div>
        );
    }

    if (status === 'Declined') {
        return (
            <div className="rounded-3xl border border-slate-600/30 bg-slate-800/50 px-6 py-5 text-center">
                <p className="text-lg font-medium text-slate-400">
                    This quote was declined
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-5">
            <p className="mb-4 text-center text-sm text-slate-400">
                Please respond to this quotation:
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                    onClick={() => handleStatusUpdate('Accepted')}
                    disabled={isLoading}
                    className="rounded-full bg-green-500 px-8 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                    ✅ Accept Quote
                </button>
                <button
                    onClick={() => handleStatusUpdate('Declined')}
                    disabled={isLoading}
                    className="rounded-full border border-slate-600 bg-transparent px-8 py-3 font-semibold text-slate-400 transition hover:border-slate-500 hover:text-slate-300 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                    ❌ Decline
                </button>
            </div>
        </div>
    );
}
