'use client';

import { useCallback, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { QuoteListItem } from '@/components/quotes/QuoteListItem';
import type { QuoteStatsApiResponse, QuoteStatsResponse } from '@/types';

type DashboardClientProps = {
    initialData: QuoteStatsResponse;
    companyName?: string | null;
    currencyCode: string;
};

export function DashboardClient({ initialData, companyName, currencyCode }: DashboardClientProps) {
    const [data, setData] = useState(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
    const { toasts, addToast, removeToast } = useToasts();

    const sortedQuotes = useMemo(() => data.quotes, [data.quotes]);

    const refreshStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/quotes/stats', { method: 'GET', cache: 'no-store' });
            const result = (await res.json().catch(() => null)) as QuoteStatsApiResponse | null;
            if (!res.ok || !result?.success || !result.data) {
                throw new Error(result?.error ?? 'Unable to refresh dashboard data.');
            }
            setData(result.data);
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
                const result = (await res.json().catch(() => null)) as {
                    success?: boolean;
                    error?: string;
                } | null;
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
            {/* Toast stack — bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="space-y-4">
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
                                    currencyCode={currencyCode}
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
