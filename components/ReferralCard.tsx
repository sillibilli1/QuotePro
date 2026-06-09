'use client';

import { useState, useCallback } from 'react';
import { Toast, useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

interface ReferralCardProps {
    referralCode: string;
    appUrl: string;
}

export function ReferralCard({ referralCode, appUrl }: ReferralCardProps) {
    const referralLink = `${appUrl}/?ref=${referralCode}`;
    const waText = encodeURIComponent(`Try QuotePro for free! ${referralLink}`);
    const waUrl = `https://wa.me/?text=${waText}`;

    const { toast, showToast, hideToast } = useToast();
    const [copying, setCopying] = useState(false);

    const handleCopy = useCallback(async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(referralLink);
            showToast('Referral link copied!', 'success');
        } catch {
            showToast('Could not copy. Please copy manually.', 'error');
        } finally {
            setCopying(false);
        }
    }, [referralLink, showToast]);

    return (
        <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                {/* Heading */}
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Give 2 bonus quotes. Get 2 bonus quotes.
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Share your link. When a friend creates their first quote,
                        you both get 2 extra quotes free.
                    </p>
                </div>

                {/* Link display */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Your referral link
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                        <span className="flex-1 truncate text-sm text-teal-300 select-all">
                            {referralLink}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        variant="secondary"
                        size="md"
                        fullWidthMobile
                        onClick={() => void handleCopy()}
                        loading={copying}
                        disabled={copying}
                        className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                        {copying ? 'Copying…' : '📋 Copy Link'}
                    </Button>
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] flex-1 flex items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    >
                        💬 Share on WhatsApp
                    </a>
                </div>

                {/* How it works */}
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        How it works
                    </p>
                    <ol className="space-y-1 text-sm text-slate-400 list-decimal list-inside">
                        <li>Share your link with a contractor friend</li>
                        <li>They sign up using your link</li>
                        <li>They create their first quote</li>
                        <li>You both get 2 bonus quotes instantly</li>
                    </ol>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}
