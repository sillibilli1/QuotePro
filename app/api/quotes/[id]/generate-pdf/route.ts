'use server';

import { createElement } from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuoteDocument } from '@/lib/pdf/QuoteDocument';
import { createClient } from '@/lib/supabase/server';
import type { Database, QuoteLineItem } from '@/types';

type QueryError = { message: string } | null;

type QuoteRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'user_id' | 'client_id' | 'quote_number' | 'status' | 'project_title' | 'subtotal_aed' | 'vat_5_aed' | 'total_aed' | 'created_at' | 'pdf_url' | 'line_items'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name' | 'company'> | null;
};

type ProfileRow = Pick<Database['public']['Tables']['profiles']['Row'], 'company_name' | 'phone' | 'currency_code' | 'full_name' | 'is_subscribed'>;

type QuotesSelectTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            eq: (column: 'user_id', value: string) => {
                maybeSingle: () => Promise<{ data: QuoteRow | null; error: QueryError }>;
            };
        };
    };
    update: (values: Database['public']['Tables']['quotes']['Update']) => {
        eq: (column: 'id', value: string) => {
            eq: (column: 'user_id', value: string) => Promise<{ error: QueryError }>;
        };
    };
};

type ProfilesTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: ProfileRow | null; error: QueryError }>;
        };
    };
};

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
    // Handle both possible key names from JSONB
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

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const supabase = createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
        }

        const quoteId = context.params.id;
        const quotesTable = supabase.from('quotes') as unknown as QuotesSelectTable;
        const profilesTable = supabase.from('profiles') as unknown as ProfilesTable;

        const { data: quote, error: quoteError } = await quotesTable
            .select(
                'id, user_id, client_id, quote_number, status, project_title, subtotal_aed, vat_5_aed, total_aed, created_at, pdf_url, line_items, clients(name, company)',
            )
            .eq('id', quoteId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (quoteError) {
            console.error('[PDF Generation] Quote fetch error:', quoteError);
            return NextResponse.json({ success: false, error: quoteError.message }, { status: 500 });
        }

        if (!quote) {
            console.error('[PDF Generation] Quote not found:', quoteId);
            return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
        }

        const { data: profile, error: profileError } = await profilesTable
            .select('company_name, phone, currency_code, full_name, is_subscribed')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[PDF Generation] Profile fetch error:', profileError);
            return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
        }

        // Parse line_items from JSONB column
        const lineItemsJson = quote.line_items;
        const lineItemsArray = Array.isArray(lineItemsJson) ? lineItemsJson : [];

        if (lineItemsArray.length === 0) {
            console.error('[PDF Generation] No line items found for quote:', quoteId);
            return NextResponse.json({ success: false, error: 'No line items found for this quote.' }, { status: 400 });
        }

        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);

        const currencyCode = profile?.currency_code || 'AED';
        const lineItems = lineItemsArray.map(mapJsonLineItemToQuoteLineItem);
        const subtotal = roundCurrency(quote.subtotal_aed ?? lineItems.reduce((sum, item) => sum + item.subtotal_aed, 0));
        const vat = roundCurrency(quote.vat_5_aed ?? subtotal * 0.05);
        const total = roundCurrency(quote.total_aed ?? subtotal + vat);

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
                lineItems,
                subtotal,
                vat,
                total,
                estimatedDuration: 'To be confirmed',
                currencyCode,
            }) as any,
        );

        const bucketName = 'quotes-pdfs';
        const filePath = `${user.id}/${quote.id}.pdf`;

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
        });

        if (uploadError) {
            console.error('[PDF Generation] Storage upload error:', uploadError);
            return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath);

        const { error: updateError } = await quotesTable
            .update({
                pdf_url: publicUrl,
                status: 'sent',
            })
            .eq('id', quote.id)
            .eq('user_id', user.id);

        if (updateError) {
            console.error('[PDF Generation] Quote update error:', updateError);
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

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
        console.error('[PDF Generation] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred while generating the PDF.',
            },
            { status: 500 }
        );
    }
}
