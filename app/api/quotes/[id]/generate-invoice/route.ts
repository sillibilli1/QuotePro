'use server';

import { createElement } from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/lib/pdf/InvoiceDocument';
import { createClient } from '@/lib/supabase/server';
import type { QuoteLineItem } from '@/types';

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function formatDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
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

export async function POST(_: Request, context: { params: { id: string } }) {
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

        // Fetch quote with is_invoice check
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('id, user_id, status, is_invoice, invoice_number')
            .eq('id', quoteId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (quoteError || !quote) {
            return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
        }

        // Validation checks
        if ((quote as any).status !== 'accepted') {
            return NextResponse.json({
                success: false,
                error: 'Only accepted quotes can be converted to invoices.'
            }, { status: 400 });
        }

        if ((quote as any).is_invoice) {
            return NextResponse.json({
                success: false,
                error: 'This quote has already been converted to an invoice.',
                invoice_number: (quote as any).invoice_number
            }, { status: 400 });
        }

        // Fetch profile with new fields
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('trn, bank_details_structured')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
        }

        // Validate TRN
        if (!(profile as any)?.trn || (profile as any).trn.trim().length !== 15) {
            return NextResponse.json({
                success: false,
                error: 'Please add a valid 15-digit TRN in your account settings before generating invoices.'
            }, { status: 400 });
        }

        // Validate bank details
        const bankDetails = (profile as any).bank_details_structured;
        if (!bankDetails?.bank_name || !bankDetails?.account_number) {
            return NextResponse.json({
                success: false,
                error: 'Please complete your bank details in account settings before generating invoices.'
            }, { status: 400 });
        }

        // Generate invoice number
        const year = new Date().getFullYear();
        const { count } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('is_invoice', true)
            .gte('created_at', `${year}-01-01`)
            .lte('created_at', `${year}-12-31`);

        const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
        const invoiceDate = new Date();
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);

        // Update quote record
        const { error: updateError } = await (supabase as any)
            .from('quotes')
            .update({
                is_invoice: true,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate.toISOString(),
                due_date: dueDate.toISOString()
            })
            .eq('id', quoteId);

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDate.toISOString(),
            due_date: dueDate.toISOString()
        });
    } catch (error) {
        console.error('[Invoice Generation POST] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred.',
            },
            { status: 500 }
        );
    }
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

        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('id, user_id, client_id, quote_number, project_title, pdf_mode, subtotal_aed, vat_5_aed, total_aed, created_at, line_items, currency, tax_rate, is_invoice, invoice_number, invoice_date, due_date, clients(name, company)')
            .eq('id', quoteId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (quoteError || !quote) {
            return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_name, phone, currency_code, full_name, is_subscribed, company_logo_url, bank_details, trn, bank_details_structured')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
        }

        const lineItemsJson = (quote as any).line_items;
        const lineItemsArray = Array.isArray(lineItemsJson) ? lineItemsJson : [];

        if (lineItemsArray.length === 0) {
            return NextResponse.json({ success: false, error: 'No line items found.' }, { status: 400 });
        }

        const now = new Date();
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + 30);

        const currencyCode = (quote as any).currency || (profile as any)?.currency_code || 'AED';
        const taxRate = (quote as any).tax_rate ?? 5;
        const lineItems = lineItemsArray.map(mapJsonLineItemToQuoteLineItem);
        const subtotal = roundCurrency((quote as any).subtotal_aed ?? lineItems.reduce((sum, item) => sum + item.subtotal_aed, 0));
        const vat = roundCurrency((quote as any).vat_5_aed ?? subtotal * (taxRate / 100));
        const total = roundCurrency((quote as any).total_aed ?? subtotal + vat);
        const pdfMode = (quote as any).pdf_mode || 'bilingual';

        // Use invoice dates if available, otherwise current dates
        const invoiceDate = (quote as any).invoice_date ? new Date((quote as any).invoice_date) : now;
        const invoiceDueDate = (quote as any).due_date ? new Date((quote as any).due_date) : dueDate;
        const invoiceNumber = (quote as any).invoice_number || (quote as any).quote_number?.replace('QP-', 'INV-') || `INV-${now.getUTCFullYear()}-0001`;

        const pdfBuffer = await renderToBuffer(
            createElement(InvoiceDocument, {
                invoiceNumber,
                createdAt: formatDate(invoiceDate),
                dueDate: formatDate(invoiceDueDate),
                companyName: (profile as any)?.company_name || (profile as any)?.full_name || 'Your Company',
                companyAddress: 'Generated with QuotePro',
                companyPhone: (profile as any)?.phone || '',
                companyLogoUrl: (profile as any)?.company_logo_url || null,
                companyTrn: (profile as any)?.trn || null,
                isSubscribed: !!(profile as any)?.is_subscribed,
                clientName: (quote as any).clients?.name || 'Client',
                clientCompany: (quote as any).clients?.company ?? null,
                projectTitle: (quote as any).project_title || 'Invoice',
                pdfMode,
                lineItems,
                subtotal,
                vat,
                total,
                currencyCode,
                taxRate,
                bankDetails: (profile as any)?.bank_details_structured || null,
            }) as any,
        );

        const webBuffer = new Uint8Array(pdfBuffer);

        return new Response(webBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Invoice.pdf"',
                'Content-Length': webBuffer.byteLength.toString(),
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('[Invoice Generation] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred.',
            },
            { status: 500 }
        );
    }
}
