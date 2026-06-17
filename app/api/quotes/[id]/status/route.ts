import { NextResponse } from 'next/server';
import type { Database, QuoteStatus } from '@/types';
import { createClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuotesTable = {
    update: (values: Database['public']['Tables']['quotes']['Update']) => {
        eq: (column: 'id', value: string) => {
            eq: (column: 'user_id', value: string) => Promise<{ error: QueryError }>;
        };
    };
};

function isAllowedStatus(value: unknown): value is Extract<QuoteStatus, 'won' | 'lost' | 'accepted' | 'declined'> {
    return value === 'won' || value === 'lost' || value === 'accepted' || value === 'declined';
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

    const status = (body as { status?: unknown })?.status;

    if (!isAllowedStatus(status)) {
        return NextResponse.json({ success: false, error: 'Status must be won, lost, accepted, or declined.' }, { status: 400 });
    }

    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const { error } = await quotesTable
        .update({ status })
        .eq('id', context.params.id)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
}
