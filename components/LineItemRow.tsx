'use client';

import { Input } from '@/components/Input';
import type { QuoteLineItem } from '@/types';

type LineItemRowProps = {
    item: QuoteLineItem;
    canRemove: boolean;
    disabled?: boolean;
    currencyCode: string;
    onChange: (itemNumber: number, field: keyof Pick<QuoteLineItem, 'description' | 'unit' | 'quantity' | 'unit_rate_aed'>, value: string) => void;
    onRemove: (itemNumber: number) => void;
};

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function LineItemRow({ item, canRemove, disabled = false, currencyCode, onChange, onRemove }: LineItemRowProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-white">Line Item {item.item_number}</p>
                    <p className="text-xs text-slate-400">Subtotal: {formatCurrency(item.subtotal_aed, currencyCode)}</p>
                </div>

                {canRemove ? (
                    <button
                        type="button"
                        className="rounded-xl border border-rose-500/30 px-3 py-2 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => onRemove(item.item_number)}
                        disabled={disabled}
                    >
                        Remove
                    </button>
                ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <Input
                        label="Description"
                        value={item.description}
                        onChange={(event) => onChange(item.item_number, 'description', event.target.value)}
                        placeholder="Describe the scope of work"
                        disabled={disabled}
                    />
                </div>

                <Input
                    label="Unit"
                    value={item.unit}
                    onChange={(event) => onChange(item.item_number, 'unit', event.target.value)}
                    placeholder="e.g. lot, sqm, unit"
                    disabled={disabled}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={String(item.quantity)}
                        onChange={(event) => onChange(item.item_number, 'quantity', event.target.value)}
                        disabled={disabled}
                    />

                    <Input
                        label={`Unit Rate (${currencyCode})`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={String(item.unit_rate_aed)}
                        onChange={(event) => onChange(item.item_number, 'unit_rate_aed', event.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}
