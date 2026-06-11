'use server';

import { createElement } from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuoteDocument } from '@/lib/pdf/QuoteDocument';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database, QuoteLineItem } from '@/types';

type QueryError = { message: string } | null;

type QuoteRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'user_id' | 'quote_number' | 'status' | 'project_title' | 'pdf_mode' | 'subtotal_aed' | 'vat_5_aed' | 'total_aed' | 'created_at' | 'currency' | 'tax_rate' | 'line_items'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name' | 'company'> | null;
};

type ProfileRow = Pick<Database['public']['Tables']['profiles']['Row'], 'company_name' | 'phone' | 'currency_code' | 'full_name' | 'is_subscribed'>;

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(value);
}

function mapJsonLineItemToQuoteLineItem(item: any, index: number): QuoteLineItem {
    const unitRate = Number(item.unit_rate_aed ?? item.unit_price_aed ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return {
        item_number: index + 1,
        description: item.description?.trim() || item.unit?.trim() || '',
        unit: item.unit?.trim() || '',
        quantity,
        unit_rate_aed: unitRate,
        subtotal_aed: roundCurrency(item.subtotal_aed ?? item.total_price_aed ?? (quantity * unitRate)),
    };
}

export async function GET(_: Request, context: { params: { token: string } }) {
    try {
        const supabase = createServiceRoleClient();
        const token = context.params.token;

        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('id, user_id, quote_number, status, project_title, pdf_mode, subtotal_aed, vat_5_aed, total_aed, created_at, currency, tax_rate, line_items, clients(name, company)')
            .eq('share_token', token)
            .maybeSingle() as { data: QuoteRow | null; error: QueryError };

        if (quoteError || !quote) {
            return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, phone, currency_code, full_name, is_subscribed')
            .eq('id', quote.user_id)
            .maybeSingle() as { data: ProfileRow | null; error: QueryError };

        const lineItemsArray = Array.isArray(quote.line_items) ? quote.line_items : [];

        if (lineItemsArray.length === 0) {
            return NextResponse.json({ success: false, error: 'No line items found.' }, { status: 400 });
        }

        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);

        const currencyCode = quote.currency || profile?.currency_code || 'AED';
        const taxRate = quote.tax_rate ?? 5;
        const lineItems = lineItemsArray.map(mapJsonLineItemToQuoteLineItem);
        const subtotal = roundCurrency(quote.subtotal_aed ?? lineItems.reduce((sum, item) => sum + item.subtotal_aed, 0));
        const vat = roundCurrency(quote.vat_5_aed ?? subtotal * (taxRate / 100));
        const total = roundCurrency(quote.total_aed ?? subtotal + vat);
        const pdfMode = quote.pdf_mode || 'bilingual';

        const pdfBuffer = await renderToBuffer(
            createElement(QuoteDocument, {
                quoteNumber: quote.quote_number ?? `QP-${now.getUTCFullYear()}-0001`,
                createdAt: formatDate(now),
                validUntil: formatDate(validUntil),
                companyName: profile?.company_name || profile?.full_name || 'Your Company',
                companyAddress: 'Generated with QuotePro',
                companyPhone: profile?.phone || '',
                isSubscribed: !!profile?.is_subscribed,
                clientName: quote.clients?.name || 'Client',
                clientCompany: quote.clients?.company ?? null,
                projectTitle: quote.project_title || 'Quotation',
                pdfMode,
                lineItems,
                subtotal,
                vat,
                total,
                estimatedDuration: 'To be confirmed',
                currencyCode,
                taxRate,
            }) as any,
        );

        const webBuffer = new Uint8Array(pdfBuffer);

        return new Response(webBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Quotation.pdf"',
                'Content-Length': webBuffer.byteLength.toString(),
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('[Public PDF Generation] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred.',
            },
            { status: 500 }
        );
    }
}
