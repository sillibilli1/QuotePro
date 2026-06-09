'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type UpgradeModalProps = {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
};

const STARTER_BENEFITS = [
    'Unlimited quotes',
    'PDF downloads',
    'WhatsApp tracking',
    'Priority support',
] as const;

export function UpgradeModal({
    isOpen,
    onClose,
    title = 'Upgrade to Continue',
    description = "You've reached your monthly free limit of 5 quotes. Upgrade to Starter to keep generating quotations without interruption.",
}: UpgradeModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl">
                <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-light">Starter Plan</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
                </div>

                <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                    <div className="rounded-3xl border border-brand/20 bg-brand/10 p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">Starter Plan: AED 299/month</p>
                        <ul className="mt-4 space-y-3 text-sm text-slate-200">
                            {STARTER_BENEFITS.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidthMobile
                            onClick={onClose}
                            className="border-slate-700 bg-transparent text-slate-100 hover:border-slate-500 hover:bg-slate-950"
                        >
                            Start Free Trial
                        </Button>
                        <Link
                            href="/app/upgrade"
                            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
