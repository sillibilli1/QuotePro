import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify client ownership
    const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!client) {
        return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const { data: quotes, error } = await supabase
        .from('quotes')
        .select('id, quote_number, status, total_aed, currency, created_at')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quotes: quotes || [] });
}
