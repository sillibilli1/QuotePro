'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { LineItemRow } from '@/components/LineItemRow';
import { TotalsDisplay } from '@/components/TotalsDisplay';
import type { QuoteLineItem } from '@/types';

type EditableQuoteProps = {
    quoteId: string;
    projectTitle: string;
    initialLineItems: QuoteLineItem[];
    initialSubtotal: number;
    initialVat: number;
    initialTotal: number;
    currencyCode: string;
    taxRate: number;
};

type SaveResponse = {
    success?: boolean;
    error?: string;
};

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function parseNumericInput(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeLineItems(lineItems: QuoteLineItem[]) {
    return lineItems.map((item, index) => {
        const quantity = roundCurrency(Number.isFinite(item.quantity) ? item.quantity : 0);
        const unitRate = roundCurrency(Number.isFinite(item.unit_rate_aed) ? item.unit_rate_aed : 0);

        return {
            item_number: index + 1,
            description: item.description ?? '',
            unit: item.unit ?? '',
            quantity,
            unit_rate_aed: unitRate,
            subtotal_aed: roundCurrency(quantity * unitRate),
        } satisfies QuoteLineItem;
    });
}

function createEmptyLineItem(itemNumber: number): QuoteLineItem {
    return {
        item_number: itemNumber,
        description: '',
        unit: '',
        quantity: 0,
        unit_rate_aed: 0,
        subtotal_aed: 0,
    };
}

export function EditableQuote({
    quoteId,
    projectTitle,
    initialLineItems,
    initialSubtotal,
    initialVat,
    initialTotal,
    currencyCode,
    taxRate,
}: EditableQuoteProps) {
    const { toasts, addToast, removeToast } = useToasts();

    const [lineItems, setLineItems] = useState<QuoteLineItem[]>(() =>
        normalizeLineItems(initialLineItems.length > 0 ? initialLineItems : [createEmptyLineItem(1)]),
    );
    const [saving, setSaving] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const totals = useMemo(() => {
        const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.subtotal_aed, 0));
        const vat = roundCurrency(subtotal * (taxRate / 100));
        const total = roundCurrency(subtotal + vat);
        return { subtotal, vat, total };
    }, [lineItems, taxRate]);

    const hasChanges =
        roundCurrency(initialSubtotal) !== totals.subtotal ||
        roundCurrency(initialVat) !== totals.vat ||
        roundCurrency(initialTotal) !== totals.total ||
        JSON.stringify(normalizeLineItems(initialLineItems)) !== JSON.stringify(lineItems);

    function updateLineItems(nextItems: QuoteLineItem[]) {
        setLineItems(normalizeLineItems(nextItems));
    }

    function handleLineItemChange(
        itemNumber: number,
        field: keyof Pick<QuoteLineItem, 'description' | 'unit' | 'quantity' | 'unit_rate_aed'>,
        value: string,
    ) {
        updateLineItems(
            lineItems.map((item) => {
                if (item.item_number !== itemNumber) return item;
                if (field === 'description' || field === 'unit') return { ...item, [field]: value };
                return { ...item, [field]: parseNumericInput(value) };
            }),
        );
    }

    function handleAddLineItem() {
        updateLineItems([...lineItems, createEmptyLineItem(lineItems.length + 1)]);
    }

    function handleRemoveLineItem(itemNumber: number) {
        if (lineItems.length <= 1) return;
        updateLineItems(lineItems.filter((item) => item.item_number !== itemNumber));
    }

    async function handleSaveChanges() {
        setSaving(true);
        try {
            const response = await fetch(`/api/quotes/${quoteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    line_items: lineItems,
                    subtotal_aed: totals.subtotal,
                    vat_5_aed: totals.vat,
                    total_aed: totals.total,
                }),
            });

            const result = (await response.json().catch(() => null)) as SaveResponse | null;

            if (!response.ok || !result?.success) {
                throw new Error(result?.error ?? 'Unable to save quote changes.');
            }

            addToast('Quote saved successfully.', 'success');
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleGeneratePdf() {
        setIsGeneratingPdf(true);
        try {
            const pdfUrl = `/api/quotes/${quoteId}/generate-pdf`;
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.setAttribute('download', 'Quotation.pdf');
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
            }, 1000); // 1-second delay
            addToast('PDF downloaded successfully.', 'success');
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsGeneratingPdf(false);
        }
    }

    const busy = saving || isGeneratingPdf;

    return (
        <>
            {/* Toast stack — Phase-B, bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft md:p-8">
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-brand-light">Editable quote</p>
                    <h2 className="text-2xl font-semibold text-white">{projectTitle}</h2>
                    <p className="text-sm leading-6 text-slate-400">
                        Update the AI-generated line items below. Totals recalculate instantly as you edit
                        quantity and rate values.
                    </p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <div className="space-y-4">
                        {lineItems.map((item) => (
                            <LineItemRow
                                key={item.item_number}
                                item={item}
                                canRemove={lineItems.length > 1}
                                onChange={handleLineItemChange}
                                onRemove={handleRemoveLineItem}
                                disabled={busy}
                                currencyCode={currencyCode}
                            />
                        ))}

                        <button
                            type="button"
                            className={[
                                'inline-flex min-h-[44px] items-center justify-center',
                                'rounded-2xl border border-dashed border-brand/40 px-4 py-2.5',
                                'text-sm font-medium text-brand-light transition',
                                'hover:border-brand hover:text-white',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                'disabled:cursor-not-allowed disabled:opacity-60',
                            ].join(' ')}
                            onClick={handleAddLineItem}
                            disabled={busy}
                        >
                            Add Line Item
                        </button>
                    </div>

                    <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quote ID</p>
                            <p className="mt-2 break-all text-sm font-medium text-white">{quoteId}</p>
                        </div>

                        <TotalsDisplay
                            subtotal={totals.subtotal}
                            vat={totals.vat}
                            total={totals.total}
                            currencyCode={currencyCode}
                            taxRate={taxRate}
                        />

                        <Button
                            type="button"
                            onClick={() => void handleSaveChanges()}
                            loading={saving}
                            disabled={!hasChanges || isGeneratingPdf}
                            className="bg-slate-700 hover:bg-slate-600 focus:ring-slate-300"
                        >
                            Save Changes
                        </Button>

                        <Button
                            type="button"
                            onClick={() => void handleGeneratePdf()}
                            loading={isGeneratingPdf}
                            disabled={saving}
                            className="bg-teal-600 py-4 text-lg hover:bg-teal-500 focus:ring-teal-300"
                        >
                            Generate PDF
                        </Button>
                    </aside>
                </div>
            </section>
        </>
    );
}
