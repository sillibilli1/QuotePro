import type { PublicQuoteResponse } from '@/types';
import { QuoteActionButtons } from './QuoteActionButtons';
import { getStatusTokens } from '@/lib/ui/status';
import Image from 'next/image';

type QuoteData = NonNullable<PublicQuoteResponse['quote']>;

interface PublicQuoteViewProps {
    quote: QuoteData;
    currencyCode: string;
}

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateValue));
}

function formatCurrency(amount: number | null, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount ?? 0));
}

function MetaChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

export function PublicQuoteView({ quote, currencyCode }: PublicQuoteViewProps) {
    const taxRate = quote.tax_rate ?? 5;
    const statusTokens = getStatusTokens(quote.status);

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">

                {/* ── Company header ─────────────────────────────────────────────── */}
                <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-5 shadow-lg sm:px-8">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                            Quotation
                        </p>
                        {quote.company_logo_url ? (
                            <div className="relative mt-2 h-16 w-40">
                                <Image
                                    src={quote.company_logo_url}
                                    alt={quote.company_name || 'Company logo'}
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        ) : (
                            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                {quote.company_name || 'QuotePro'}
                            </h1>
                        )}
                        {quote.company_phone && (
                            <p className="mt-1 text-sm text-slate-400">📞 {quote.company_phone}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Status badge */}
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusTokens.borderClass} ${statusTokens.bgClass} ${statusTokens.textClass}`}>
                            {statusTokens.label}
                        </span>
                        {/* Download PDF button */}
                        <a
                            href={`/api/quotes/public/${quote.share_token}/generate-pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-teal-500/50 bg-teal-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-300 transition hover:bg-teal-500/30 hover:border-teal-500/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 motion-reduce:transition-none"
                        >
                            📥 Download PDF
                        </a>
                    </div>
                </header>

                {/* ── Meta chips ─────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetaChip label="Quote #" value={quote.quote_number ?? quote.id} />
                    <MetaChip label="Date" value={formatDate(quote.created_at)} />
                    <MetaChip label="Client" value={quote.client_name || 'Client'} />
                    <MetaChip label="Company" value={quote.client_company || '—'} />
                </div>

                {/* ── Project title ──────────────────────────────────────────────── */}
                <section className="rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-5 sm:px-8">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                        Project
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                        {quote.project_title || 'Quotation'}
                    </h2>
                </section>

                {/* ── Line items ─────────────────────────────────────────────────── */}
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90">
                    {/* Desktop header row */}
                    <div className="hidden grid-cols-[minmax(0,1fr)_80px_100px_110px] gap-3 bg-slate-950/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid">
                        <span>Description</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Rate</span>
                        <span className="text-right">Total</span>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {quote.line_items.map((item) => (
                            <div
                                key={`${item.item_number}-${item.description}`}
                                className="px-6 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_80px_100px_110px] sm:items-center sm:gap-3"
                            >
                                {/* Mobile: stacked card style */}
                                <div>
                                    <p className="text-sm font-medium text-white">{item.description}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{item.unit}</p>
                                </div>
                                <div className="mt-2 flex gap-4 sm:contents sm:mt-0">
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-600 sm:hidden">
                                            Qty
                                        </p>
                                        <p className="text-sm text-slate-300">{item.quantity}</p>
                                    </div>
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-600 sm:hidden">
                                            Rate
                                        </p>
                                        <p className="text-sm text-slate-300">
                                            {formatCurrency(item.unit_rate_aed, currencyCode)}
                                        </p>
                                    </div>
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-600 sm:hidden">
                                            Total
                                        </p>
                                        <p className="text-sm font-semibold text-white">
                                            {formatCurrency(item.subtotal_aed, currencyCode)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Totals + Terms ─────────────────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Terms */}
                    <section className="rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-6 sm:px-8">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                            Terms & Conditions
                        </p>
                        <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
                            <li>• This quotation is valid for 30 days from the issue date.</li>
                            <li>• Tax is calculated at {taxRate}% in accordance with applicable regulations.</li>
                            <li>• Please confirm acceptance to proceed with scheduling and execution.</li>
                        </ul>
                    </section>

                    {/* Totals */}
                    <section className="rounded-3xl border border-white/10 bg-slate-900/90 px-6 py-6 sm:px-8">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                            Summary
                        </p>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-400">Subtotal</dt>
                                <dd className="font-medium text-white">
                                    {formatCurrency(quote.subtotal_aed, currencyCode)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-400">Tax {taxRate}%</dt>
                                <dd className="font-medium text-white">
                                    {formatCurrency(quote.vat_5_aed, currencyCode)}
                                </dd>
                            </div>
                        </dl>

                        {/* Grand total — teal block */}
                        <div className="mt-4 rounded-2xl bg-teal-500/15 px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold text-teal-300">Grand Total</span>
                                <span className="font-mono text-xl font-bold text-teal-300">
                                    {formatCurrency(quote.total_aed, currencyCode)}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── Action buttons ─────────────────────────────────────────────── */}
                <QuoteActionButtons
                    token={quote.share_token || ''}
                    initialStatus={quote.status}
                />

                {/* ── Premium CTA Banner (viral loop) ────────────────────────────── */}
                <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 text-center shadow-xl">
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                        Create professional quotes like this in 60 seconds
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                        Join thousands of businesses using QuotePro to win more clients
                    </p>
                    <a
                        href="/"
                        className="mt-6 inline-block rounded-full bg-teal-500 px-8 py-3 font-bold text-slate-950 transition hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
                    >
                        Try QuotePro for Free
                    </a>
                </div>
            </div>
        </div>
    );
}
