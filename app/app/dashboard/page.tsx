import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMonthlyQuoteUsage } from '@/lib/quote-usage';
import type { DashboardQuoteRecord, Database, ProfileRecord, SupportedCurrency } from '@/types';
import { UpgradeSuccessToast } from '@/components/UpgradeSuccessToast';
import { UsageBanner } from '@/components/dashboard/UsageBanner';
import { DashboardClient } from '@/components/DashboardClient';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileText } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

type QueryError = { message: string } | null;
type QuoteStatsRow = Database['public']['Tables']['quotes']['Row'];

type QuoteWithClient = QuoteStatsRow & {
    clients?: {
        name: string | null;
        company: string | null;
    } | null;
};

type QuotesTable = {
    select: (columns: string) => {
        eq: (column: 'user_id', value: string) => {
            gte: (column: 'created_at', value: string) => {
                lt: (column: 'created_at', value: string) => {
                    order: (
                        column: 'created_at',
                        config: { ascending: boolean },
                    ) => Promise<{ data: QuoteStatsRow[] | null; error: QueryError }>;
                };
            };
        };
    };
};

function getMonthBounds() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { start: start.toISOString(), end: end.toISOString() };
}

function mapQuote(row: QuoteWithClient): DashboardQuoteRecord {
    return {
        id: row.id,
        quote_number: row.quote_number,
        status: row.status,
        total_aed: row.total_aed,
        currency: row.currency ?? 'AED',
        created_at: row.created_at,
        viewed_at: row.viewed_at,
        share_token: row.share_token,
        client_name: row.clients?.name ?? 'Unknown Client',
        client_company: row.clients?.company ?? null,
    };
}

async function getDashboardStats(userId: string) {
    const supabase = createClient();
    const { start, end } = getMonthBounds();
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const { data, error } = await quotesTable
        .select('*, clients(name, company)')
        .eq('user_id', userId)
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const quotes = (data ?? []).map((row) => mapQuote(row as QuoteWithClient));

    const pipelineByCurrency: Record<string, number> = {};
    const wonByCurrency: Record<string, number> = {};

    quotes.forEach((q) => {
        const curr = q.currency;
        if (q.status === 'sent' || q.status === 'pending') {
            pipelineByCurrency[curr] = (pipelineByCurrency[curr] ?? 0) + Number(q.total_aed ?? 0);
        }
        if (q.status === 'won') {
            wonByCurrency[curr] = (wonByCurrency[curr] ?? 0) + Number(q.total_aed ?? 0);
        }
    });

    Object.keys(pipelineByCurrency).forEach((k) => {
        pipelineByCurrency[k] = roundCurrency(pipelineByCurrency[k]);
    });
    Object.keys(wonByCurrency).forEach((k) => {
        wonByCurrency[k] = roundCurrency(wonByCurrency[k]);
    });

    return {
        quotes_this_month: quotes.length,
        pipeline_by_currency: pipelineByCurrency,
        won_by_currency: wonByCurrency,
        quotes,
    };
}

function getPlanBadge(plan: string | null, isSubscribed: boolean) {
    if (!isSubscribed || !plan) {
        return { label: 'Free', classes: 'border-slate-600 bg-slate-800 text-slate-400' };
    }
    if (plan === 'growth') {
        return { label: 'Growth', classes: 'border-purple-500/30 bg-purple-500/10 text-purple-300' };
    }
    return { label: 'Starter', classes: 'border-brand/30 bg-brand/10 text-brand-light' };
}

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface DashboardPageProps {
    searchParams: { upgrade?: string; plan?: string };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const { data: profile } = (await supabase
        .from('profiles')
        .select('full_name, company_name, plan, is_subscribed, currency_code')
        .eq('id', user.id)
        .maybeSingle()) as {
            data: Pick<
                ProfileRecord,
                'full_name' | 'company_name' | 'plan' | 'is_subscribed' | 'currency_code'
            > | null;
        };

    const [stats, usage] = await Promise.all([
        getDashboardStats(user.id),
        getMonthlyQuoteUsage(user.id, profile?.is_subscribed ?? false, profile?.plan ?? null),
    ]);

    const planBadge = getPlanBadge(profile?.plan ?? null, profile?.is_subscribed ?? false);
    const upgradeSuccess = searchParams.upgrade === 'success';
    const upgradedPlan = searchParams.plan ?? profile?.plan ?? 'starter';
    const defaultCurrency = (profile?.currency_code ?? 'AED') as SupportedCurrency;

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 md:py-10">
            {upgradeSuccess && <UpgradeSuccessToast plan={upgradedPlan} />}

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <PageHeader
                        title={`Your Quotes${profile?.full_name ? `, ${profile.full_name}` : ''}`}
                        subtitle="Track sent quotations, monitor pipeline value, and update outcomes as deals close."
                    />
                    <div className="flex shrink-0 items-center gap-2">
                        {/* Plan badge */}
                        <Link
                            href="/app/upgrade"
                            className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition hover:opacity-80 ${planBadge.classes}`}
                            title="View plans"
                        >
                            {planBadge.label}
                        </Link>
                        {/* Quotes-this-month chip */}
                        <span className="inline-flex h-8 items-center rounded-full border border-brand/30 bg-brand/10 px-3 text-xs font-semibold text-brand-light">
                            {stats.quotes_this_month} this month
                        </span>
                    </div>
                </div>

                {/* ── Usage banner (slim) ───────────────────────────────────── */}
                <UsageBanner
                    count={usage.count}
                    limit={usage.limit}
                    remaining={usage.remaining}
                    isLimitReached={usage.is_limit_reached}
                />

                {/* ── Dashboard client with stats & quote list ────────────── */}
                <DashboardClient
                    companyName={profile?.company_name ?? null}
                    pipelineByCurrency={stats.pipeline_by_currency}
                    wonByCurrency={stats.won_by_currency}
                    quotesThisMonth={stats.quotes_this_month}
                    quotes={stats.quotes}
                    defaultCurrency={defaultCurrency}
                />

                {/* ── Create new quote CTA ─────────────────────────────────── */}
                <div className="flex justify-start">
                    <Link
                        href="/app/quotes/new"
                        className={[
                            'inline-flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition',
                            usage.is_limit_reached
                                ? 'pointer-events-none cursor-not-allowed bg-slate-700'
                                : 'bg-brand hover:bg-brand-dark',
                        ].join(' ')}
                        aria-disabled={usage.is_limit_reached}
                    >
                        {usage.is_limit_reached ? 'Upgrade to Create More Quotes' : 'Create New Quote'}
                    </Link>
                </div>
            </div>
        </main>
    );
}
