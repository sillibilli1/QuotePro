'use client';

import { useCallback, useMemo, useState } from 'react';
import { FileText, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { QuoteListItem } from '@/components/quotes/QuoteListItem';
import { StatCard } from '@/components/dashboard/StatCard';
import type { DashboardQuoteRecord, SupportedCurrency } from '@/types';

type DashboardClientProps = {
    companyName?: string | null;
    pipelineByCurrency: Record<string, number>;
    wonByCurrency: Record<string, number>;
    quotesThisMonth: number;
    quotes: DashboardQuoteRecord[];
    defaultCurrency: SupportedCurrency;
};

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function DashboardClient({
    companyName,
    pipelineByCurrency,
    wonByCurrency,
    quotesThisMonth,
    quotes: initialQuotes,
    defaultCurrency,
}: DashboardClientProps) {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
    const { toasts, addToast, removeToast } = useToasts();

    // Get all currencies that have any value
    const activeCurrencies = useMemo(() => {
        const currencies = new Set<string>();
        Object.keys(pipelineByCurrency).forEach((c) => currencies.add(c));
        Object.keys(wonByCurrency).forEach((c) => currencies.add(c));
        quotes.forEach((q) => currencies.add(q.currency));
        return Array.from(currencies).sort();
    }, [pipelineByCurrency, wonByCurrency, quotes]);

    // Determine initial selected currency (highest pipeline value or default)
    const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
        if (activeCurrencies.length === 0) return defaultCurrency;
        const sorted = activeCurrencies.sort((a, b) => {
            const aVal = pipelineByCurrency[a] ?? 0;
            const bVal = pipelineByCurrency[b] ?? 0;
            return bVal - aVal;
        });
        return sorted[0] ?? defaultCurrency;
    });

    const pipelineValue = pipelineByCurrency[selectedCurrency] ?? 0;
    const wonValue = wonByCurrency[selectedCurrency] ?? 0;
    const wonCount = quotes.filter((q) => q.status === 'won' && q.currency === selectedCurrency).length;

    const sortedQuotes = useMemo(() => quotes, [quotes]);

    const refreshStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/quotes/stats', { method: 'GET', cache: 'no-store' });
            const result = await res.json().catch(() => null);
            if (!res.ok || !result?.success || !result.data) {
                throw new Error(result?.error ?? 'Unable to refresh dashboard data.');
            }
            setQuotes(result.data.quotes);
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsRefreshing(false);
        }
    }, [addToast]);

    const updateStatus = useCallback(
        async (quoteId: string, status: 'won' | 'lost') => {
            setStatusUpdatingId(quoteId);
            try {
                const res = await fetch(`/api/quotes/${quoteId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
                const result = await res.json().catch(() => null);
                if (!res.ok || !result?.success) {
                    throw new Error(result?.error ?? 'Unable to update quote status.');
                }
                await refreshStats();
                addToast(
                    `Quote marked as ${status === 'won' ? 'won 🎉' : 'lost'}.`,
                    status === 'won' ? 'success' : 'info',
                );
            } catch {
                addToast('Something went wrong. Please try again.', 'error');
            } finally {
                setStatusUpdatingId(null);
            }
        },
        [refreshStats, addToast],
    );

    return (
        <>
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="space-y-4">
                {/* Currency Selector Pills */}
                {activeCurrencies.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
                            Currency:
                        </span>
                        <div className="flex gap-1">
                            {activeCurrencies.map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => setSelectedCurrency(curr)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${selectedCurrency === curr
                                            ? 'bg-brand text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats row */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Quotes This Month"
                        value={String(quotesThisMonth)}
                        icon={<FileText className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Pipeline Value"
                        value={formatCurrency(pipelineValue, selectedCurrency)}
                        icon={<TrendingUp className="h-4 w-4" />}
                        accent
                    />
                    <StatCard
                        label="Won This Month"
                        value={`${wonCount} (${formatCurrency(wonValue, selectedCurrency)})`}
                        icon={<Trophy className="h-4 w-4" />}
                    />
                </div>

                {/* Quote list card */}
                <Card>
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-teal-700">Quote Pipeline</h2>
                            <p className="text-xs text-gray-500">
                                {companyName
                                    ? `${companyName} · current month`
                                    : 'Current month quotation activity'}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void refreshStats()}
                            loading={isRefreshing}
                            disabled={isRefreshing}
                            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                        >
                            Refresh
                        </Button>
                    </div>

                    {sortedQuotes.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            heading="No quotes yet"
                            description="Create your first quote to start building your pipeline."
                            action={{ label: 'Create New Quote', href: '/app/quotes/new' }}
                        />
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {sortedQuotes.map((quote) => (
                                <QuoteListItem
                                    key={quote.id}
                                    quote={quote}
                                    currencyCode={quote.currency}
                                    isUpdating={statusUpdatingId === quote.id}
                                    onStatusUpdate={updateStatus}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
