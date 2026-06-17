import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Database, PublicQuoteResponse } from '@/types';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { PublicQuoteView } from '@/components/quotes/PublicQuoteView';

type QueryError = { message: string } | null;

type QuotePublicRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'user_id' | 'quote_number' | 'status' | 'project_title' | 'pdf_mode' | 'subtotal_aed' | 'vat_5_aed' | 'total_aed' | 'share_token' | 'created_at' | 'viewed_at' | 'currency' | 'tax_rate' | 'line_items'
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

type ProfilesTable = {
    select: (columns: 'company_name, phone, currency_code, company_logo_url') => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: { company_name: string; phone: string; currency_code: string; company_logo_url: string | null } | null; error: QueryError }>;
        };
    };
};

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function parseLineItemsFromJSONB(value: unknown): Array<{
    item_number: number;
    description: string;
    unit: string;
    quantity: number;
    unit_rate_aed: number;
    subtotal_aed: number;
}> {
    if (!Array.isArray(value)) return [];
    return value.map((item, index) => {
        const r = item as Record<string, unknown>;
        const qty = Number(r.quantity ?? 0);
        const rate = Number(r.unit_price_aed ?? r.unit_rate_aed ?? 0);
        const q = Number.isFinite(qty) ? qty : 0;
        const u = Number.isFinite(rate) ? rate : 0;
        return {
            item_number: index + 1,
            description: String(r.description ?? '').trim(),
            unit: String(r.title ?? r.unit ?? '').trim(),
            quantity: q,
            unit_rate_aed: u,
            subtotal_aed: roundCurrency(q * u),
        };
    });
}

function mapPublicQuoteResponse(
    quote: QuotePublicRow,
    profile: { company_name: string; phone: string; currency_code: string; company_logo_url: string | null } | null,
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
        company_logo_url: profile?.company_logo_url ?? null,
        pdf_mode: quote.pdf_mode,
        currency: quote.currency,
        tax_rate: quote.tax_rate,
        line_items: parseLineItemsFromJSONB(quote.line_items),
    };
}

async function getPublicQuote(token: string) {
    const supabase = createServiceRoleClient();
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;

    const { data: quote, error: quoteError } = await quotesTable
        .select('id, user_id, quote_number, status, project_title, pdf_mode, subtotal_aed, vat_5_aed, total_aed, share_token, created_at, viewed_at, currency, tax_rate, line_items, clients(name, company)')
        .eq('share_token', token)
        .maybeSingle();

    if (quoteError) {
        throw new Error(quoteError.message);
    }

    if (!quote) {
        return null;
    }

    const profilesClient = supabase.from('profiles') as unknown as ProfilesTable;
    const { data: profile } = await profilesClient.select('company_name, phone, currency_code, company_logo_url').eq('id', quote.user_id).maybeSingle();

    const currencyCode = quote.currency || profile?.currency_code || 'AED';

    return {
        quote: mapPublicQuoteResponse(quote, profile ?? null),
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

    return process.env.NEXT_PUBLIC_SITE_URL || '';
}

async function trackView(token: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/api/quotes/${token}/track-view`, {
            method: 'POST',
            cache: 'no-store',
        });

        const result = (await response.json().catch(() => null)) as { success?: boolean; quote_id?: string; email_sent?: boolean } | null;

        // Temporarily disabled to save email limits
        // if (response.ok && result?.success && result.quote_id && result.email_sent) {
        //     await fetch(`${getBaseUrl()}/api/email/quote-viewed`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ quoteId: result.quote_id }),
        //         cache: 'no-store',
        //     });
        // }
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
