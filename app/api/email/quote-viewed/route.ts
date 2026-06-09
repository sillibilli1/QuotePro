import { NextResponse } from 'next/server';
import type { Database } from '@/types';
import { sendQuoteViewedEmail } from '@/lib/email';
import { createServiceRoleClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuoteEmailRow = Pick<
    Database['public']['Tables']['quotes']['Row'],
    'id' | 'quote_number' | 'total_aed' | 'viewed_at' | 'user_id'
> & {
    clients: Pick<Database['public']['Tables']['clients']['Row'], 'name'> | null;
};

type QuotesTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: QuoteEmailRow | null; error: QueryError }>;
        };
    };
};

type ProfilesTable = {
    select: (columns: 'email, full_name') => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{
                data: Pick<Database['public']['Tables']['profiles']['Row'], 'email' | 'full_name'> | null;
                error: QueryError;
            }>;
        };
    };
};

function formatViewedAt(viewedAt: string) {
    return new Intl.DateTimeFormat('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(viewedAt));
}

export async function POST(request: Request) {
    let requestBody: unknown;

    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid_body', message: 'Invalid request body.' }, { status: 400 });
    }

    const quoteId =
        typeof requestBody === 'object' && requestBody !== null && 'quoteId' in requestBody && typeof requestBody.quoteId === 'string'
            ? requestBody.quoteId.trim()
            : '';

    if (!quoteId) {
        return NextResponse.json({ error: 'invalid_quote_id', message: 'Quote ID is required.' }, { status: 400 });
    }

    try {
        const supabase = createServiceRoleClient();
        const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
        const profilesTable = supabase.from('profiles') as unknown as ProfilesTable;

        const { data: quote, error: quoteError } = await quotesTable
            .select('id, quote_number, total_aed, viewed_at, user_id, clients(name)')
            .eq('id', quoteId)
            .maybeSingle();

        if (quoteError) {
            throw new Error(quoteError.message);
        }

        if (!quote) {
            return NextResponse.json({ error: 'not_found', message: 'Quote not found.' }, { status: 404 });
        }

        const { data: profile, error: profileError } = await profilesTable
            .select('email, full_name')
            .eq('id', quote.user_id)
            .maybeSingle();

        if (profileError) {
            throw new Error(profileError.message);
        }

        if (!profile?.email) {
            return NextResponse.json({ error: 'recipient_missing', message: 'Quote owner email is not available.' }, { status: 400 });
        }

        await sendQuoteViewedEmail({
            userEmail: profile.email,
            userName: profile.full_name?.trim() || 'there',
            clientName: quote.clients?.name?.trim() || 'your client',
            quoteNumber: quote.quote_number?.trim() || quote.id,
            totalAed: Number(quote.total_aed ?? 0),
            viewedAt: formatViewedAt(quote.viewed_at || new Date().toISOString()),
            quoteId: quote.id,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send email.';
        return NextResponse.json({ error: 'email_send_failed', message }, { status: 500 });
    }
}
