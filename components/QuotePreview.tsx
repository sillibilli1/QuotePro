'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RevisionChat } from '@/components/RevisionChat';
import type { GeneratedQuoteData, QuoteDraftContext, RevisionEntry, QuoteReviseResponse, QuoteConfirmResponse } from '@/types';

interface QuotePreviewProps {
    quoteData: GeneratedQuoteData;
    context: QuoteDraftContext;
    revisions: RevisionEntry[];
    revisionsRemaining: number;
    isRevising: boolean;
    isSaving: boolean;
    errorMessage: string | null;
    currencyCode: string;
    onRevise: (instruction: string) => Promise<void>;
    onConfirm: () => Promise<void>;
    onReset: () => void;
}

function getTaxLabel(taxRate: number): string {
    return `Tax (${taxRate}%)`;
}

function formatCurrency(value: number, currencyCode: string) {
    return `${currencyCode} ${Number(value).toFixed(2)}`;
}

export function QuotePreview({
    quoteData,
    context,
    revisions,
    revisionsRemaining,
    isRevising,
    isSaving,
    errorMessage,
    currencyCode,
    onRevise,
    onConfirm,
    onReset,
}: QuotePreviewProps) {
    // Bulletproof null checks
    if (!quoteData || !quoteData.line_items || !Array.isArray(quoteData.line_items)) return null;
    if (!context) return null;

    const router = useRouter();
    const [reviseError, setReviseError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    // Add beforeunload warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleRevise = async (instruction: string) => {
        setReviseError(null);
        setConfirmError(null);

        try {
            const response = await fetch('/api/quotes/revise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quote_data: quoteData,
                    instruction,
                    context: {
                        project_type: context.project_type,
                        brief_text: context.brief_text,
                        client_name: context.client_name,
                        client_company: context.client_company,
                        approx_value: context.approx_value,
                        pdf_mode: context.pdf_mode,
                        currency: context.currency,
                        tax_rate: context.tax_rate,
                    },
                }),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errMsg = `Server Error: ${response.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errData = await response.json().catch(() => ({}));
                    errMsg = errData.message || errMsg;
                }
                throw new Error(errMsg);
            }

            const result = (await response.json().catch(() => null)) as QuoteReviseResponse | null;

            if (!result || !result.success) {
                const message = result && 'message' in result ? result.message : "Couldn't apply that change. Try rephrasing.";
                setReviseError(message);
                throw new Error(message);
            }

            await onRevise(instruction);
        } catch (error) {
            // Error is already set above
            throw error;
        }
    };

    const handleConfirm = async () => {
        setReviseError(null);
        setConfirmError(null);

        console.log("👉 [PREVIEW CONFIRM] Context pdf_mode:", context.pdf_mode);

        const confirmPayload = {
            quote_data: quoteData,
            context: {
                project_type: context.project_type,
                brief_text: context.brief_text,
                client_name: context.client_name,
                client_company: context.client_company,
                approx_value: context.approx_value,
                pdf_mode: context.pdf_mode,
                currency: context.currency,
                tax_rate: context.tax_rate,
            },
        };

        console.log("👉 [PREVIEW CONFIRM] Sending pdf_mode:", confirmPayload.context.pdf_mode);

        try {
            const response = await fetch('/api/quotes/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(confirmPayload),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errMsg = `Server Error: ${response.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errData = await response.json().catch(() => ({}));
                    errMsg = errData.error || errMsg;
                }
                throw new Error(errMsg);
            }

            const result = (await response.json().catch(() => null)) as QuoteConfirmResponse | null;

            if (!result || !result.success) {
                const message = result && 'error' in result ? result.error : 'Unable to save quote. Please try again.';
                setConfirmError(message);
                return;
            }

            // Success - navigate to the editable quote view
            await onConfirm();
            router.push(`/quotes/${result.quote_id}`);
        } catch (error) {
            setConfirmError('Unable to save quote. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Preview badge */}
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Not saved yet — preview
                </span>
            </div>

            {/* Quote details */}
            <Card className="p-6 md:p-8">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-light">
                        Generated Quote
                    </p>
                    <h2 className="text-2xl font-semibold text-white">{quoteData.project_title}</h2>
                    <p className="text-sm text-slate-400">
                        Client:{' '}
                        <span className="font-medium text-slate-200">
                            {quoteData.client_name || context.client_name}
                            {(quoteData.client_company || context.client_company) ? `, ${quoteData.client_company || context.client_company}` : ''}
                        </span>
                    </p>
                </div>

                {/* Line items table */}
                <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-slate-400">
                                <th className="pb-2 pr-3 font-medium">#</th>
                                <th className="pb-2 pr-3 font-medium">Description</th>
                                <th className="pb-2 pr-3 font-medium">Unit</th>
                                <th className="pb-2 pr-3 font-medium">Qty</th>
                                <th className="pb-2 pr-3 font-medium">Rate</th>
                                <th className="pb-2 text-right font-medium">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {quoteData.line_items?.map((item) => (
                                <tr key={item.item_number} className="align-top">
                                    <td className="py-2 pr-3 text-slate-400">{item.item_number}</td>
                                    <td className="py-2 pr-3 text-slate-200">{item.description || 'No description'}</td>
                                    <td className="py-2 pr-3 text-slate-200">{item.unit || '-'}</td>
                                    <td className="py-2 pr-3 font-mono tabular-nums text-slate-200">
                                        {item.quantity ?? 0}
                                    </td>
                                    <td className="py-2 pr-3 font-mono tabular-nums text-slate-200">
                                        {formatCurrency(item.unit_rate_aed ?? 0, currencyCode)}
                                    </td>
                                    <td className="py-2 text-right font-mono tabular-nums text-white">
                                        {formatCurrency(item.subtotal_aed ?? 0, currencyCode)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-5 flex flex-col gap-1.5 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
                    {[
                        { label: 'Subtotal', val: quoteData.subtotal_aed ?? 0 },
                        { label: getTaxLabel(context.tax_rate ?? 5), val: quoteData.vat_5_percent_aed ?? 0 },
                    ].map(({ label, val }) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">{label}</span>
                            <span className="font-mono tabular-nums text-white font-semibold">
                                {formatCurrency(val, currencyCode)}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 border-t border-brand/20 pt-2 text-base">
                        <span className="font-semibold text-slate-400">Total</span>
                        <span className="font-mono font-bold tabular-nums text-white">
                            {formatCurrency(quoteData.total_aed ?? 0, currencyCode)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Revision chat */}
            <Card className="p-6 md:p-8">
                <RevisionChat
                    revisions={revisions}
                    revisionsRemaining={revisionsRemaining}
                    isRevising={isRevising}
                    errorMessage={reviseError || errorMessage}
                    onRevise={handleRevise}
                />
            </Card>

            {/* Confirm error */}
            {confirmError && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {confirmError}
                </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => void handleConfirm()}
                    disabled={isRevising || isSaving}
                    loading={isSaving}
                    className="w-full bg-teal-600 hover:bg-teal-500 focus:ring-teal-400 sm:flex-1"
                >
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Confirm & Save
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={onReset}
                    disabled={isRevising || isSaving}
                    className="w-full border-slate-700 bg-transparent text-slate-200 hover:border-slate-500 hover:bg-slate-900 sm:w-auto"
                >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Start Over
                </Button>
            </div>
        </div>
    );
}
