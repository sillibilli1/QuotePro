import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const { status } = await request.json();

        if (!['Accepted', 'Declined'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const dbStatus = status === 'Accepted' ? 'accepted' : 'declined';
        const supabase = createAdminClient();

        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('id, status')
            .eq('share_token', params.token)
            .single();

        if (fetchError || !quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        }

        const { error: updateError } = await supabase
            .from('quotes')
            .update({ status: dbStatus })
            .eq('id', quote.id);

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Status update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
