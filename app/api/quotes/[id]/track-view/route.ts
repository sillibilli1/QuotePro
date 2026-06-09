import { NextResponse } from 'next/server';
import type { Database } from '@/types';
import { createServiceRoleClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuoteTrackRow = Pick<Database['public']['Tables']['quotes']['Row'], 'id' | 'viewed_at'>;

type QuotesTable = {
    select: (columns: 'id, viewed_at') => {
        eq: (column: 'share_token', value: string) => {
            maybeSingle: () => Promise<{ data: QuoteTrackRow | null; error: QueryError }>;
        };
    };
    update: (values: Database['public']['Tables']['quotes']['Update']) => {
        eq: (column: 'share_token', value: string) => {
            select: (columns: 'id') => {
                maybeSingle: () => Promise<{ data: Pick<Database['public']['Tables']['quotes']['Row'], 'id'> | null; error: QueryError }>;
            };
        };
    };
};

export async function POST(_: Request, context: { params: { id: string } }) {
    const supabase = createServiceRoleClient();
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;

    const { data: existingQuote, error: fetchError } = await quotesTable
        .select('id, viewed_at')
        .eq('share_token', context.params.id)
        .maybeSingle();

    if (fetchError) {
        return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!existingQuote) {
        return NextResponse.json({ success: false, error: 'Quote not found.' }, { status: 404 });
    }

    if (existingQuote.viewed_at) {
        return NextResponse.json({ success: true, quote_id: existingQuote.id, already_viewed: true, email_sent: false });
    }

    const { data: updatedQuote, error } = await quotesTable
        .update({ viewed_at: new Date().toISOString() })
        .eq('share_token', context.params.id)
        .select('id')
        .maybeSingle();

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quote_id: updatedQuote?.id ?? existingQuote.id, already_viewed: false, email_sent: true });
}
