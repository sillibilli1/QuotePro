import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Database, LineItemRecord, PublicQuoteResponse } from '@/types';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { PublicQuoteView } from '@/components/quotes/PublicQuoteView';

type QueryError = { message: string } | null;

type QuotePublicRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'quote_number' | 'status' | 'project_title' | 'subtotal_aed' | 'vat_5_aed' | 'total_aed' | 'share_token' | 'created_at' | 'viewed_at'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name' | 'company'> | null;
};

type QuotesTable = {
    select: (columns: string) => {
        eq: (column: 'share_token', value: string) => {
            maybeSingle: () => Promise<{ data: QuotePublicRow | null; error: QueryError }>;
        };
    };
};

type LineItemsTable = {
    select: (columns: string) => {
        eq: (column: 'quote_id', value: string) => {
            order: (column: 'item_order', config: { ascending: boolean }) => Promise<{ data: LineItemRecord[] | null; error: QueryError }>;
        };
    };
};

type ProfilesTable = {
    select: (columns: 'company_name, phone, currency_code') => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: { company_name: string; phone: string; currency_code: string } | null; error: QueryError }>;
        };
    };
};

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function mapPublicQuoteResponse(
    quote: QuotePublicRow,
    lineItems: LineItemRecord[],
    profile: { company_name: string; phone: string; currency_code: string } | null,
): NonNullable<PublicQuoteResponse['quote']> {
    return {
        id: quote.id,
        quote_number: quote.quote_number,
        status: quote.status,
        project_title: quote.project_title,
        subtotal_aed: quote.subtotal_aed,
        vat_5_aed: quote.vat_5_aed,
        total_aed: quote.total_aed,
        share_token: quote.share_token,
        created_at: quote.created_at,
        viewed_at: quote.viewed_at,
        client_name: quote.clients?.name ?? null,
        client_company: quote.clients?.company ?? null,
        company_name: profile?.company_name ?? null,
        company_phone: profile?.phone ?? null,
        line_items: lineItems.map((item, index) => ({
            item_number: index + 1,
            description: item.description?.trim() || item.title.trim(),
            unit: item.title.trim(),
            quantity: Number(item.quantity ?? 0),
            unit_rate_aed: Number(item.unit_price_aed ?? 0),
            subtotal_aed: roundCurrency(Number(item.total_price_aed ?? 0)),
        })),
    };
}

async function getPublicQuote(token: string) {
    const supabase = createServiceRoleClient();
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const lineItemsTable = supabase.from('line_items') as unknown as LineItemsTable;

    const { data: quote, error: quoteError } = await quotesTable
        .select('id, quote_number, status, project_title, subtotal_aed, vat_5_aed, total_aed, share_token, created_at, viewed_at, clients(name, company)')
        .eq('share_token', token)
        .maybeSingle();

    if (quoteError) {
        throw new Error(quoteError.message);
    }

    if (!quote) {
        return null;
    }

    const { data: lineItems, error: lineItemsError } = await lineItemsTable
        .select('*')
        .eq('quote_id', quote.id)
        .order('item_order', { ascending: true });

    if (lineItemsError) {
        throw new Error(lineItemsError.message);
    }

    const profilesClient = supabase.from('profiles') as unknown as ProfilesTable;
    const ownerId = (lineItems?.[0]?.user_id ?? null) as string | null;
    const { data: profile } = ownerId
        ? await profilesClient.select('company_name, phone, currency_code').eq('id', ownerId).maybeSingle()
        : { data: null };

    const currencyCode = profile?.currency_code || 'AED';

    return {
        quote: mapPublicQuoteResponse(quote, lineItems ?? [], profile ?? null),
        currencyCode,
    };
}

function getBaseUrl() {
    const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (explicitUrl) {
        return explicitUrl.replace(/\/$/, '');
    }

    const host = headers().get('host');

    if (host) {
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${host}`;
    }

    return 'http://localhost:3000';
}

async function trackView(token: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/api/quotes/${token}/track-view`, {
            method: 'POST',
            cache: 'no-store',
        });

        const result = (await response.json().catch(() => null)) as { success?: boolean; quote_id?: string; email_sent?: boolean } | null;

        if (response.ok && result?.success && result.quote_id && result.email_sent) {
            await fetch(`${getBaseUrl()}/api/email/quote-viewed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quoteId: result.quote_id }),
                cache: 'no-store',
            });
        }
    } catch {
        // Tracking should not block rendering.
    }
}

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
    const result = await getPublicQuote(params.token);

    if (!result) {
        notFound();
    }

    const { quote, currencyCode } = result;

    // Keep existing view-tracking — logic unchanged
    await trackView(params.token);

    return <PublicQuoteView quote={quote} currencyCode={currencyCode} />;
}
