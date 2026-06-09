import { NextResponse } from 'next/server';
import type { Database, QuoteLineItem } from '@/types';
import { createClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuoteWithClientRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'user_id' | 'client_id' | 'quote_number' | 'status' | 'project_title' | 'line_items' | 'subtotal_aed' | 'vat_5_aed' | 'total_aed' | 'created_at' | 'share_token' | 'pdf_url' | 'viewed_at'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name' | 'company'> | null;
};

type ProfileCurrencyRow = { currency_code: string };

type ProfilesTable = {
    select: (columns: 'currency_code') => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: ProfileCurrencyRow | null; error: QueryError }>;
        };
    };
};

type QuotesTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            eq: (column: 'user_id', value: string) => {
                maybeSingle: () => Promise<{ data: QuoteWithClientRow | null; error: QueryError }>;
            };
        };
    };
    update: (values: Database['public']['Tables']['quotes']['Update']) => {
        eq: (column: 'id', value: string) => {
            eq: (column: 'user_id', value: string) => Promise<{ error: QueryError }>;
        };
    };
};

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function normalizeLineItems(lineItems: QuoteLineItem[]) {
    return lineItems.map((item, index) => {
        const quantity = Number(item.quantity);
        const unitRate = Number(item.unit_rate_aed);

        return {
            item_number: index + 1,
            description: String(item.description ?? '').trim(),
            unit: String(item.unit ?? '').trim(),
            quantity: Number.isFinite(quantity) && quantity >= 0 ? roundCurrency(quantity) : 0,
            unit_rate_aed: Number.isFinite(unitRate) && unitRate >= 0 ? roundCurrency(unitRate) : 0,
            subtotal_aed: roundCurrency(
                (Number.isFinite(quantity) && quantity >= 0 ? quantity : 0) *
                (Number.isFinite(unitRate) && unitRate >= 0 ? unitRate : 0),
            ),
        } satisfies QuoteLineItem;
    });
}

function parseLineItemsFromJSONB(value: unknown): QuoteLineItem[] {
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

function buildQuoteResponse(row: QuoteWithClientRow, currencyCode: string) {
    const lineItems = parseLineItemsFromJSONB(row.line_items);

    return {
        id: row.id,
        user_id: row.user_id,
        client_id: row.client_id,
        quote_number: row.quote_number,
        status: row.status,
        project_title: row.project_title,
        subtotal_aed: row.subtotal_aed,
        vat_5_aed: row.vat_5_aed,
        total_aed: row.total_aed,
        created_at: row.created_at,
        share_token: row.share_token,
        pdf_url: row.pdf_url,
        viewed_at: row.viewed_at,
        client_name: row.clients?.name ?? null,
        client_company: row.clients?.company ?? null,
        currency_code: currencyCode,
        line_items: lineItems,
    };
}

export async function GET(_: Request, context: { params: { id: string } }) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const quoteId = context.params.id;
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const profilesTable = supabase.from('profiles') as unknown as ProfilesTable;

    const { data, error } = await quotesTable
        .select(
            'id, user_id, client_id, quote_number, status, project_title, line_items, subtotal_aed, vat_5_aed, total_aed, created_at, share_token, pdf_url, viewed_at, clients(name, company)',
        )
        .eq('id', quoteId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
    }

    const { data: profileData } = await profilesTable
        .select('currency_code')
        .eq('id', user.id)
        .maybeSingle();
    const currencyCode = profileData?.currency_code || 'AED';

    return NextResponse.json({ success: true, quote: buildQuoteResponse(data, currencyCode) });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const payload = body as {
        line_items?: QuoteLineItem[];
        subtotal_aed?: number;
        vat_5_aed?: number;
        total_aed?: number;
    };

    if (!Array.isArray(payload.line_items) || payload.line_items.length === 0) {
        return NextResponse.json({ success: false, error: 'At least one line item is required.' }, { status: 400 });
    }

    const lineItems = normalizeLineItems(payload.line_items);
    const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.subtotal_aed, 0));
    const vat = roundCurrency(subtotal * 0.05);
    const total = roundCurrency(subtotal + vat);

    // Convert line items to JSONB format
    const lineItemsJson = lineItems.map((item, index) => ({
        item_order: index,
        title: item.unit.trim() || `Item ${index + 1}`,
        description: item.description.trim(),
        quantity: item.quantity,
        unit_price_aed: item.unit_rate_aed,
        total_price_aed: item.subtotal_aed,
    }));

    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;

    const { error: updateError } = await quotesTable
        .update({
            line_items: lineItemsJson as any,
            subtotal_aed: subtotal,
            vat_5_aed: vat,
            total_aed: total,
            status: 'review',
        })
        .eq('id', context.params.id)
        .eq('user_id', user.id);

    if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        line_items: lineItems,
        subtotal_aed: subtotal,
        vat_5_aed: vat,
        total_aed: total,
    });
}
