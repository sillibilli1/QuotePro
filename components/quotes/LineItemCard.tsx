'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { QuoteLineItem } from '@/types';

interface LineItemCardProps {
    item: QuoteLineItem;
    canRemove: boolean;
    disabled?: boolean;
    currencyCode: string;
    onChange: (
        itemNumber: number,
        field: keyof Pick<QuoteLineItem, 'description' | 'unit' | 'quantity' | 'unit_rate_aed'>,
        value: string,
    ) => void;
    onRemove: (itemNumber: number) => void;
}

function formatMono(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function LineItemCard({
    item,
    canRemove,
    disabled,
    currencyCode,
    onChange,
    onRemove,
}: LineItemCardProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            layout={!reduceMotion}
            initial={reduceMotion ? {} : { opacity: 0, height: 0 }}
            animate={reduceMotion ? {} : { opacity: 1, height: 'auto' }}
            exit={reduceMotion ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
        >
            {/* ── MOBILE: mini-card ─────────────────────────────────────────────── */}
            <div className="block rounded-2xl border border-slate-700 bg-slate-900/60 p-4 lg:hidden">
                <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-800">
                        #{item.item_number}
                    </span>
                    {canRemove && (
                        <button
                            type="button"
                            aria-label={`Remove line item ${item.item_number}`}
                            onClick={() => onRemove(item.item_number)}
                            disabled={disabled}
                            className="rounded-lg p-1 text-slate-500 transition hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="grid gap-3">
                    <Input
                        label="Description"
                        value={item.description}
                        onChange={(e) => onChange(item.item_number, 'description', e.target.value)}
                        disabled={disabled}
                        placeholder="Item description"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <Input
                            label="Unit"
                            value={item.unit}
                            onChange={(e) => onChange(item.item_number, 'unit', e.target.value)}
                            disabled={disabled}
                            placeholder="hrs"
                        />
                        <Input
                            label="Qty"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={item.quantity === 0 ? '' : String(item.quantity)}
                            onChange={(e) => onChange(item.item_number, 'quantity', e.target.value)}
                            disabled={disabled}
                            placeholder="1"
                        />
                        <Input
                            label="Rate"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={item.unit_rate_aed === 0 ? '' : String(item.unit_rate_aed)}
                            onChange={(e) => onChange(item.item_number, 'unit_rate_aed', e.target.value)}
                            disabled={disabled}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2">
                        <span className="text-xs text-slate-400">Subtotal</span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-white">
                            {formatMono(item.subtotal_aed, currencyCode)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP: grid row ──────────────────────────────────────────────── */}
            <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
                <Input
                    label={item.item_number === 1 ? 'Description' : undefined}
                    aria-label="Description"
                    value={item.description}
                    onChange={(e) => onChange(item.item_number, 'description', e.target.value)}
                    disabled={disabled}
                    placeholder="Item description"
                />
                <Input
                    label={item.item_number === 1 ? 'Unit' : undefined}
                    aria-label="Unit"
                    value={item.unit}
                    onChange={(e) => onChange(item.item_number, 'unit', e.target.value)}
                    disabled={disabled}
                    placeholder="hrs"
                />
                <Input
                    label={item.item_number === 1 ? 'Qty' : undefined}
                    aria-label="Quantity"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.quantity === 0 ? '' : String(item.quantity)}
                    onChange={(e) => onChange(item.item_number, 'quantity', e.target.value)}
                    disabled={disabled}
                    placeholder="1"
                />
                <Input
                    label={item.item_number === 1 ? `Rate (${currencyCode})` : undefined}
                    aria-label="Unit rate"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.unit_rate_aed === 0 ? '' : String(item.unit_rate_aed)}
                    onChange={(e) => onChange(item.item_number, 'unit_rate_aed', e.target.value)}
                    disabled={disabled}
                    placeholder="0.00"
                />
                <div className={item.item_number === 1 ? 'pt-[26px]' : ''}>
                    <div className="flex h-[42px] items-center rounded-xl border border-slate-700/60 bg-slate-950/50 px-3">
                        <span className="font-mono text-sm tabular-nums text-white">
                            {formatMono(item.subtotal_aed, currencyCode)}
                        </span>
                    </div>
                </div>
                <div className={item.item_number === 1 ? 'pt-[26px]' : ''}>
                    {canRemove ? (
                        <button
                            type="button"
                            aria-label={`Remove line item ${item.item_number}`}
                            onClick={() => onRemove(item.item_number)}
                            disabled={disabled}
                            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    ) : (
                        <div className="h-[42px] w-[42px]" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
