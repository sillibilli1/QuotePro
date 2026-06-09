'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { MoreHorizontal, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { StatusBadge } from '@/components/ui/Badge';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { DashboardQuoteRecord } from '@/types';

interface QuoteListItemProps {
    quote: DashboardQuoteRecord;
    currencyCode: string;
    isUpdating: boolean;
    onStatusUpdate: (quoteId: string, status: 'won' | 'lost') => void;
}

function formatMono(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function relativeDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks < 5) return `${weeks}w ago`;
    return `${months}mo ago`;
}

export function QuoteListItem({
    quote,
    currencyCode,
    isUpdating,
    onStatusUpdate,
}: QuoteListItemProps) {
    const reduceMotion = useReducedMotion();
    const [justActioned, setJustActioned] = useState<'won' | 'lost' | null>(null);

    const handleAction = useCallback(
        (status: 'won' | 'lost') => {
            setJustActioned(status);
            onStatusUpdate(quote.id, status);
        },
        [onStatusUpdate, quote.id],
    );

    const canAction = quote.status !== 'won' && quote.status !== 'lost';

    return (
        <article className="group flex flex-col gap-3 px-5 py-4 text-slate-900 transition-colors hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Left: meta */}
            <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/quotes/${quote.id}`}
                        className="truncate text-sm font-semibold text-slate-900 transition hover:text-slate-700"
                    >
                        {quote.quote_number || quote.id}
                    </Link>
                    <StatusBadge status={quote.status} dot />
                    {quote.viewed_at && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            Viewed
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="truncate font-medium text-slate-700">
                        {quote.client_name || 'Unknown Client'}
                    </span>
                    {quote.client_company && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate text-slate-500">{quote.client_company}</span>
                        </>
                    )}
                    <span aria-hidden="true">·</span>
                    <time className="text-slate-500" dateTime={quote.created_at} title={new Date(quote.created_at).toLocaleDateString()}>
                        {relativeDate(quote.created_at)}
                    </time>
                </div>
            </div>

            {/* Right: amount + actions */}
            <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                    {formatMono(Number(quote.total_aed ?? 0), currencyCode)}
                </span>

                {canAction && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                aria-label="Quote actions"
                                disabled={isUpdating}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                )}
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={6}
                                className="z-50 min-w-[140px] overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-xl"
                            >
                                <AnimatePresence>
                                    <motion.div
                                        initial={reduceMotion ? {} : { opacity: 0, scale: 0.95, y: -4 }}
                                        animate={reduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                    >
                                        <DropdownMenu.Item
                                            onSelect={() => handleAction('won')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-300 outline-none hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                                            />
                                            Mark as Won
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            onSelect={() => handleAction('lost')}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-300 outline-none hover:bg-rose-500/10 focus:bg-rose-500/10"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="h-1.5 w-1.5 rounded-full bg-rose-400"
                                            />
                                            Mark as Lost
                                        </DropdownMenu.Item>
                                    </motion.div>
                                </AnimatePresence>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                )}

                {/* Success check after action */}
                {!canAction && justActioned && (
                    <AnimatePresence>
                        <motion.span
                            initial={reduceMotion ? {} : { opacity: 0, scale: 0.5 }}
                            animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
                            exit={reduceMotion ? {} : { opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20"
                        >
                            <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                        </motion.span>
                    </AnimatePresence>
                )}
            </div>
        </article>
    );
}
