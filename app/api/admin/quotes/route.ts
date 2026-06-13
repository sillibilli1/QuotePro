import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = createAdminClient();

    // Step 1: Fetch quotes with clients only
    let query = supabase
        .from('quotes')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })
        .limit(100);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data: quotes, error: quotesError } = await query;

    if (quotesError) {
        console.error('QUOTES API ERROR:', quotesError);
        return NextResponse.json({ quotes: [], error: quotesError.message }, { status: 500 });
    }

    // Step 2: Fetch profiles manually
    const userIds = [...new Set(quotes?.map(q => q.user_id).filter(Boolean))];
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name')
            .in('id', userIds);

        profilesMap = (profiles || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
        }, {} as Record<string, any>);
    }

    // Step 3: Map data together
    const mappedQuotes = quotes?.map((quote: any) => ({
        ...quote,
        client: quote.clients,
        user: profilesMap[quote.user_id] || null
    })) || [];

    return NextResponse.json({ quotes: mappedQuotes });
}
