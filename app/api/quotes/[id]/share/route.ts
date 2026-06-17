import { NextResponse } from 'next/server';
import type { Database, QuoteShareResponse } from '@/types';
import { createClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type QuoteRow = Pick<Database['public']['Tables']['quotes']['Row'], 'id' | 'user_id' | 'share_token'>;

type QuotesTable = {
    select: (columns: 'id, user_id, share_token') => {
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

function getBaseUrl() {
    const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (explicitUrl) {
        return explicitUrl.replace(/\/$/, '');
    }

    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();

    if (vercelUrl) {
        return `https://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
    }

    return process.env.NEXT_PUBLIC_SITE_URL || '';
}

export async function POST(_: Request, context: { params: { id: string } }) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json<QuoteShareResponse>({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
    const { data: quote, error } = await quotesTable
        .select('id, user_id, share_token')
        .eq('id', context.params.id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json<QuoteShareResponse>({ success: false, error: error.message }, { status: 500 });
    }

    if (!quote) {
        return NextResponse.json<QuoteShareResponse>({ success: false, error: 'Quote not found.' }, { status: 404 });
    }

    const shareToken = quote.share_token ?? crypto.randomUUID();

    if (!quote.share_token) {
        const { error: updateError } = await quotesTable
            .update({ share_token: shareToken })
            .eq('id', quote.id)
            .eq('user_id', user.id);

        if (updateError) {
            return NextResponse.json<QuoteShareResponse>({ success: false, error: updateError.message }, { status: 500 });
        }
    }

    return NextResponse.json<QuoteShareResponse>({
        success: true,
        share_token: shareToken,
        share_url: `${getBaseUrl()}/quote/${shareToken}`,
    });
}
