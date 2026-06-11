import { NextResponse } from 'next/server';
import type { DashboardQuoteRecord, Database, QuoteStatsApiResponse, QuoteStatsResponse } from '@/types';
import { createClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuoteStatsRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'quote_number' | 'status' | 'total_aed' | 'currency' | 'created_at' | 'viewed_at' | 'share_token'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name' | 'company'> | null;
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

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function getMonthBounds() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

function mapQuote(row: QuoteStatsRow): DashboardQuoteRecord {
    return {
        id: row.id,
        quote_number: row.quote_number,
        status: row.status,
        total_aed: row.total_aed,
        currency: row.currency ?? 'AED',
        created_at: row.created_at,
        viewed_at: row.viewed_at,
        share_token: row.share_token,
        client_name: row.clients?.name ?? null,
        client_company: row.clients?.company ?? null,
    };
}

function buildStats(rows: QuoteStatsRow[]) {
    const quotes = rows.map(mapQuote);
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

export async function GET() {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json<QuoteStatsApiResponse>({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { start, end } = getMonthBounds();
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const { data, error } = await quotesTable
        .select('id, quote_number, status, total_aed, currency, created_at, viewed_at, share_token, clients(name, company)')
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lt('created_at', end)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json<QuoteStatsApiResponse>({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json<QuoteStatsApiResponse>({
        success: true,
        data: buildStats(data ?? []),
    });
}
