'use client';

import { useState } from 'react';
import type { PricingPlan } from '@/lib/pricing';
import type { PlanTier } from '@/types';
import { ToastContainer, useToasts } from '@/components/ui/Toast';

interface BankTransferInstructionsProps {
    pricing: PricingPlan;
    selectedPlan: Exclude<PlanTier, 'free'>;
    userEmail: string;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 transition hover:border-brand/40 hover:text-white"
            aria-label={`Copy ${text}`}
        >
            {copied ? '✓ Copied' : 'Copy'}
        </button>
    );
}

function BankRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
            <span className="min-w-[140px] shrink-0 text-sm text-slate-400">{label}</span>
            <span className="flex-1 break-all text-right text-sm font-mono text-white">
                {value}
            </span>
            <CopyButton text={value} />
        </div>
    );
}

export function BankTransferInstructions({
    pricing,
    selectedPlan,
    userEmail,
}: BankTransferInstructionsProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
    const { toasts, addToast, removeToast } = useToasts();

    const plan = pricing[selectedPlan];
    const basePrice = plan.price;
    const displayPrice = billingInterval === 'annual' ? basePrice * 10 : basePrice;
    const priceDisplay = `${plan.currency} ${displayPrice.toLocaleString()}`;
    const reference = `QuotePro - ${userEmail} - ${selectedPlan} - ${billingInterval}`;

    const bankName = process.env.NEXT_PUBLIC_BANK_NAME ?? 'Mashreq Bank';
    const iban = process.env.NEXT_PUBLIC_BANK_IBAN ?? 'AE360330000019102074289';
    const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? '019102074289';
    const accountHolder = process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER ?? 'Jamal Khan';

    async function handleIvePaid() {
        setSubmitting(true);

        try {
            const res = await fetch('/api/billing/manual-payment-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selectedPlan, amount: priceDisplay, reference, billingInterval }),
            });

            if (!res.ok) {
                throw new Error('Something went wrong. Please try again.');
            }

            setSubmitted(true);
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Payment notification sent!</h3>
                <p className="mt-2 text-sm text-slate-400">
                    Our team will verify your transfer and activate your {selectedPlan} plan within 24 hours.
                    We&apos;ll email you at <span className="text-white">{userEmail}</span> once confirmed.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Billing Interval Toggle */}
            <div className="flex rounded-xl border border-white/10 p-1">
                <button
                    onClick={() => setBillingInterval('monthly')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${billingInterval === 'monthly' ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setBillingInterval('annual')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${billingInterval === 'annual' ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Annual (10 months)
                </button>
            </div>

            {/* Amount */}
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
                    Amount to transfer
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                    {priceDisplay}
                    <span className="ml-2 text-base font-normal text-slate-400">/{billingInterval === 'annual' ? 'year' : 'month'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400 capitalize">Plan: {selectedPlan} ({billingInterval})</p>
            </div>

            {/* Bank details */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-2">
                <BankRow label="Bank" value={bankName} />
                <BankRow label="Account Holder" value={accountHolder} />
                <BankRow label="IBAN" value={iban} />
                <BankRow label="Account Number" value={accountNumber} />
                <BankRow label="Reference" value={reference} />
            </div>

            <p className="text-xs text-slate-500">
                Please include the reference exactly as shown so we can identify your payment quickly.
            </p>

            {/* Toast stack — Phase-B, bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* CTA */}
            <button
                type="button"
                onClick={() => void handleIvePaid()}
                disabled={submitting}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
                {submitting ? 'Sending…' : "I've Paid — Notify the Team"}
            </button>
        </div>
    );
}
