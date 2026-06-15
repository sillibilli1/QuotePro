'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Save, FileDown, Check, Share2, MessageCircle, Copy } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/ui/cn';
import { LineItemCard } from '@/components/quotes/LineItemCard';
import { TotalsSummary } from '@/components/quotes/TotalsSummary';
import { useAuth } from '@/components/AuthProvider';
import type { QuoteLineItem } from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────
type QuoteDetailPayload = {
    success: boolean;
    quote?: {
        id: string;
        quote_number: string | null;
        status: string;
        project_title: string | null;
        pdf_mode: 'bilingual' | 'english_only';
        line_items: unknown;
        subtotal_aed: number | null;
        vat_5_aed: number | null;
        total_aed: number | null;
        client_name?: string | null;
        client_company?: string | null;
        company_name?: string | null;
        currency_code?: string | null;
        tax_rate?: number;
        share_token?: string | null;
    };
    error?: string;
};

type SaveResponse = { success?: boolean; error?: string };

// ── Helpers ──────────────────────────────────────────────────────────────────
function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function formatMono(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function normalizeLineItems(value: unknown): QuoteLineItem[] {
    if (!Array.isArray(value)) return [];
    return value.map((item, index) => {
        const r = item as Record<string, unknown>;
        const qty = Number(r.quantity ?? 0);
        const rate = Number(r.unit_rate_aed ?? 0);
        const q = Number.isFinite(qty) ? qty : 0;
        const u = Number.isFinite(rate) ? rate : 0;
        return {
            item_number: index + 1,
            description: String(r.description ?? '').trim(),
            unit: String(r.unit ?? '').trim(),
            quantity: q,
            unit_rate_aed: u,
            subtotal_aed: roundCurrency(q * u),
        };
    });
}

function parseNum(v: string) {
    const t = v.trim();
    if (!t) return 0;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeItems(items: QuoteLineItem[]): QuoteLineItem[] {
    return items.map((item, i) => {
        const qty = roundCurrency(Number.isFinite(item.quantity) ? item.quantity : 0);
        const rate = roundCurrency(Number.isFinite(item.unit_rate_aed) ? item.unit_rate_aed : 0);
        return {
            item_number: i + 1,
            description: item.description ?? '',
            unit: item.unit ?? '',
            quantity: qty,
            unit_rate_aed: rate,
            subtotal_aed: roundCurrency(qty * rate),
        };
    });
}

function emptyItem(n: number): QuoteLineItem {
    return { item_number: n, description: '', unit: '', quantity: 0, unit_rate_aed: 0, subtotal_aed: 0 };
}

// ── Skeleton loading state ───────────────────────────────────────────────────
function QuoteDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Card className="p-6 md:p-8">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24 rounded-full bg-slate-800" />
                    <Skeleton className="h-7 w-48 rounded-xl bg-slate-800" />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
                            <Skeleton className="h-3 w-16 rounded-full bg-slate-800" />
                            <Skeleton className="h-5 w-32 rounded-lg bg-slate-800" />
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="p-6 md:p-8">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                        <Skeleton className="h-4 w-full rounded-lg bg-slate-800" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-16 rounded-lg bg-slate-800" />
                            <Skeleton className="h-4 w-16 rounded-lg bg-slate-800" />
                            <Skeleton className="h-4 w-20 rounded-lg bg-slate-800" />
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function QuoteDetailPage() {
    return <QuoteDetailPageContent />;
}

function QuoteDetailPageContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { session, loading } = useAuth();
    const reduceMotion = useReducedMotion();
    const quoteId = typeof params?.id === 'string' ? params.id : '';

    const [quoteState, setQuoteState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [quoteData, setQuoteData] = useState<QuoteDetailPayload['quote'] | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);

    // Editable line items
    const [lineItems, setLineItems] = useState<QuoteLineItem[]>([emptyItem(1)]);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfSuccess, setPdfSuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!loading && !session) router.replace('/');
    }, [loading, router, session]);

    useEffect(() => {
        if (loading || !session || !quoteId) return;
        let active = true;

        async function loadQuote() {
            setQuoteState('loading');
            setPageError(null);
            try {
                const res = await fetch(`/api/quotes/${quoteId}`, { method: 'GET', cache: 'no-store' });
                const result = (await res.json().catch(() => null)) as QuoteDetailPayload | null;
                if (!active) return;
                if (!res.ok || !result?.success || !result.quote) {
                    setQuoteState('error');
                    setPageError(result?.error ?? 'Unable to load quote details.');
                    return;
                }
                setQuoteData(result.quote);
                const items = normalizeLineItems(result.quote.line_items);
                setLineItems(normalizeItems(items.length > 0 ? items : [emptyItem(1)]));
                setQuoteState('ready');
            } catch {
                if (!active) return;
                setQuoteState('error');
                setPageError('Unable to load quote details.');
            }
        }

        void loadQuote();
        return () => { active = false; };
    }, [loading, quoteId, session]);

    const totals = useMemo(() => {
        const taxRate = (quoteData?.tax_rate ?? 5) / 100;
        const subtotal = roundCurrency(lineItems.reduce((s, i) => s + i.subtotal_aed, 0));
        const vat = roundCurrency(subtotal * taxRate);
        return { subtotal, vat, total: roundCurrency(subtotal + vat) };
    }, [lineItems, quoteData?.tax_rate]);

    const currencyCode = quoteData?.currency_code ?? 'AED';
    const taxRatePercent = quoteData?.tax_rate ?? 5;

    const initialSubtotal = roundCurrency(quoteData?.subtotal_aed ?? totals.subtotal);
    const initialVat = roundCurrency(quoteData?.vat_5_aed ?? totals.vat);
    const initialTotal = roundCurrency(quoteData?.total_aed ?? totals.total);

    const hasChanges =
        initialSubtotal !== totals.subtotal ||
        initialVat !== totals.vat ||
        initialTotal !== totals.total;

    function updateItems(next: QuoteLineItem[]) {
        setLineItems(normalizeItems(next));
        setSaveState('idle');
        setSaveMessage(null);
    }

    function handleItemChange(
        num: number,
        field: keyof Pick<QuoteLineItem, 'description' | 'unit' | 'quantity' | 'unit_rate_aed'>,
        value: string,
    ) {
        updateItems(
            lineItems.map((item) => {
                if (item.item_number !== num) return item;
                if (field === 'description' || field === 'unit') return { ...item, [field]: value };
                return { ...item, [field]: parseNum(value) };
            }),
        );
    }

    function handleAdd() {
        updateItems([...lineItems, emptyItem(lineItems.length + 1)]);
    }

    function handleRemove(num: number) {
        if (lineItems.length <= 1) return;
        updateItems(lineItems.filter((i) => i.item_number !== num));
    }

    async function handleSave() {
        setSaveState('saving');
        setSaveMessage(null);
        try {
            const res = await fetch(`/api/quotes/${quoteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    line_items: lineItems,
                    subtotal_aed: totals.subtotal,
                    vat_5_aed: totals.vat,
                    total_aed: totals.total,
                    pdf_mode: quoteData?.pdf_mode ?? 'bilingual',
                }),
            });
            const result = (await res.json().catch(() => null)) as SaveResponse | null;
            if (!res.ok || !result?.success) {
                setSaveState('error');
                setSaveMessage(result?.error ?? 'Unable to save changes.');
                return;
            }
            setSaveState('saved');
            setSaveMessage('Changes saved successfully.');
        } catch {
            setSaveState('error');
            setSaveMessage('Unable to save changes.');
        }
    }

    async function handleGeneratePdf() {
        setIsGeneratingPdf(true);
        setSaveMessage(null);
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
            setSaveState('saved');
            setSaveMessage('PDF generated successfully.');
            setPdfSuccess(true);
        } catch {
            setSaveState('error');
            setSaveMessage('Unable to generate PDF.');
        } finally {
            setIsGeneratingPdf(false);
        }
    }

    async function ensureShareToken(): Promise<string | null> {
        if (quoteData?.share_token) return quoteData.share_token;

        try {
            const res = await fetch(`/api/quotes/${quoteId}/share`, { method: 'POST' });
            const result = await res.json();
            if (result?.success && result?.share_token) {
                setQuoteData(prev => prev ? { ...prev, share_token: result.share_token } : prev);
                return result.share_token;
            }
        } catch (err) {
            console.error('Failed to generate share token:', err);
        }
        return null;
    }

    async function handleCopyLink() {
        const token = await ensureShareToken();
        if (!token) return;
        const url = `${window.location.origin}/quote/${token}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("🚨 Clipboard copy failed:", err);
            alert("Could not copy link automatically. Please check browser permissions.");
        }
    }

    async function handleWhatsApp() {
        const token = await ensureShareToken();
        if (!token) return;
        const url = `${window.location.origin}/quote/${token}`;
        const clientName = quoteData?.client_name ?? 'Client';
        const projectType = quoteData?.project_title ?? 'your project';
        const text = encodeURIComponent(
            `Hi ${clientName}, here is the quotation for ${projectType}. You can view and download the PDF here: ${url}`,
        );
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    }

    // ── Loading / error states ───────────────────────────────────────────────
    if (loading || (session && quoteState === 'loading')) {
        return (
            <main className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 md:pb-16 md:pt-10">
                <div className="mx-auto w-full max-w-4xl">
                    <QuoteDetailSkeleton />
                </div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="min-h-screen bg-slate-950 px-4 py-10">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
                    <p className="text-sm text-slate-400">Redirecting to sign in…</p>
                </div>
            </main>
        );
    }

    if (quoteState === 'error' || !quoteData) {
        return (
            <main className="min-h-screen bg-slate-950 px-4 py-10">
                <div className="mx-auto w-full max-w-4xl">
                    <Card className="border-rose-500/20 p-6 md:p-8">
                        <p className="text-sm font-semibold uppercase tracking-widest text-rose-300">Error</p>
                        <h1 className="mt-2 text-2xl font-semibold text-white">Unable to load quotation</h1>
                        <p className="mt-2 text-sm text-slate-300">
                            {pageError ?? 'The requested quote could not be loaded.'}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/app/dashboard"
                                className={cn(
                                    buttonVariants({ variant: 'secondary', size: 'md' }),
                                    'border-slate-700 bg-transparent text-slate-200 hover:border-slate-500',
                                )}
                            >
                                Back to Dashboard
                            </Link>
                            <Link
                                href="/app/quotes/new"
                                className={cn(
                                    buttonVariants({ variant: 'secondary', size: 'md' }),
                                    'border-slate-700 bg-transparent text-slate-200 hover:border-slate-500',
                                )}
                            >
                                New Quote
                            </Link>
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

    const isBusy = saveState === 'saving' || isGeneratingPdf;

    return (
        <>
            <main className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 md:pb-16 md:pt-10">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                    {/* ── Document header card ──────────────────────────────────────── */}
                    <Card className="p-6 md:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                    {quoteData.company_name ?? 'Quotation'}
                                </p>
                                <h1 className="mt-1 text-2xl font-bold text-white">
                                    {quoteData.project_title || 'Quotation'}
                                </h1>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <Link
                                    href="/app/quotes/new"
                                    className={cn(
                                        buttonVariants({ variant: 'secondary', size: 'sm' }),
                                        'border-slate-700 bg-transparent text-slate-300 hover:border-slate-500',
                                    )}
                                >
                                    New Quote
                                </Link>
                                <Link
                                    href="/app/dashboard"
                                    className={cn(
                                        buttonVariants({ variant: 'secondary', size: 'sm' }),
                                        'border-slate-700 bg-transparent text-slate-300 hover:border-slate-500',
                                    )}
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PDF Template Language</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setQuoteData((current) => current ? { ...current, pdf_mode: 'bilingual' } : current)}
                                    className={cn(
                                        'rounded-2xl border px-4 py-4 text-left transition',
                                        quoteData.pdf_mode === 'bilingual'
                                            ? 'border-teal-500 bg-teal-500/10 text-white'
                                            : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-600',
                                    )}
                                >
                                    <div className="text-sm font-semibold">Bilingual (English + Arabic)</div>
                                    <div className="mt-1 text-xs text-slate-400">Ideal for UAE/GCC & Pakistan clients.</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuoteData((current) => current ? { ...current, pdf_mode: 'english_only' } : current)}
                                    className={cn(
                                        'rounded-2xl border px-4 py-4 text-left transition',
                                        quoteData.pdf_mode === 'english_only'
                                            ? 'border-teal-500 bg-teal-500/10 text-white'
                                            : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-600',
                                    )}
                                >
                                    <div className="text-sm font-semibold">Standard (English Only)</div>
                                    <div className="mt-1 text-xs text-slate-400">Ideal for International / Western clients.</div>
                                </button>
                            </div>
                        </div>

                        {/* Meta grid */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-4">
                            {[
                                { label: 'Quote #', value: quoteData.quote_number || quoteId },
                                {
                                    label: 'Status',
                                    value: null,
                                    node: <StatusBadge status={quoteData.status} dot />,
                                },
                                {
                                    label: 'PDF Template',
                                    value: quoteData.pdf_mode === 'english_only' ? 'Standard (English Only)' : 'Bilingual (English + Arabic)',
                                },
                                {
                                    label: 'Client',
                                    value: `${quoteData.client_name || 'Client'}${quoteData.client_company ? ` · ${quoteData.client_company}` : ''}`,
                                },
                            ].map(({ label, value, node }) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                                >
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                        {label}
                                    </p>
                                    <div className="mt-1.5">
                                        {node ?? (
                                            <p className="text-sm font-medium text-slate-200 break-all">{value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* ── Line items ────────────────────────────────────────────────── */}
                    <Card className="p-6 md:p-8">
                        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Line Items
                            </p>
                            <p className="text-xs text-slate-500">
                                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Desktop header row */}
                        <div className="mb-2 hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:gap-3">
                            <span>Description</span>
                            <span>Unit</span>
                            <span>Qty</span>
                            <span>Rate ({currencyCode})</span>
                            <span className="text-right">Subtotal</span>
                            <span />
                        </div>

                        <div className="flex flex-col gap-3">
                            <AnimatePresence initial={false}>
                                {lineItems.map((item) => (
                                    <LineItemCard
                                        key={item.item_number}
                                        item={item}
                                        canRemove={lineItems.length > 1}
                                        disabled={isBusy}
                                        currencyCode={currencyCode}
                                        onChange={handleItemChange}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={isBusy}
                            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 text-sm font-medium text-brand-light transition hover:border-brand hover:bg-brand/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add Line Item
                        </button>

                        {/* Totals summary — right-aligned */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-xs">
                                <TotalsSummary
                                    subtotal={totals.subtotal}
                                    vat={totals.vat}
                                    total={totals.total}
                                    currencyCode={currencyCode}
                                    taxRate={taxRatePercent}
                                />
                            </div>
                        </div>

                        {/* Inline save/error feedback */}
                        {saveMessage && (
                            <p
                                className={cn(
                                    'mt-4 rounded-xl border px-4 py-3 text-sm',
                                    saveState === 'error'
                                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                                )}
                            >
                                {saveMessage}
                            </p>
                        )}
                    </Card>

                    {/* ── Share section (revealed after PDF success) ─────────────── */}
                    <AnimatePresence>
                        {pdfSuccess && (
                            <motion.div
                                initial={reduceMotion ? {} : { opacity: 0, height: 0 }}
                                animate={reduceMotion ? {} : { opacity: 1, height: 'auto' }}
                                exit={reduceMotion ? {} : { opacity: 0, height: 0 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                            >
                                <Card className="p-5">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                                            <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                        </span>
                                        <p className="text-sm font-semibold text-emerald-300">
                                            PDF ready — share with your client
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => void handleWhatsApp()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#25D366] transition hover:bg-[#25D366]/20"
                                        >
                                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                            WhatsApp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleCopyLink()}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                                        >
                                            {copySuccess ? (
                                                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                            ) : (
                                                <Copy className="h-4 w-4" aria-hidden="true" />
                                            )}
                                            {copySuccess ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPdfSuccess(false)}
                                            className="text-xs text-slate-500 underline-offset-2 hover:underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Sticky action bar ────────────────────────────────────────────── */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-end gap-3 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-sm md:px-8">
                <Button
                    variant="secondary"
                    size="md"
                    onClick={() => void handleSave()}
                    loading={saveState === 'saving'}
                    disabled={!hasChanges || isBusy}
                    className="border-slate-700 bg-transparent text-slate-200 hover:border-slate-500 hover:bg-slate-900"
                >
                    <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Save
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => void handleGeneratePdf()}
                    loading={isGeneratingPdf}
                    disabled={isBusy}
                    className="bg-teal-600 hover:bg-teal-500 focus:ring-teal-400"
                >
                    <FileDown className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Generate PDF
                </Button>
                {pdfSuccess && (
                    <button
                        type="button"
                        onClick={() => void handleWhatsApp()}
                        aria-label="Share via WhatsApp"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] transition hover:bg-[#25D366]/20"
                    >
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>
        </>
    );
}
