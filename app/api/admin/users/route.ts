import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';

    const supabase = createAdminClient();
    let query = supabase.from('profiles').select('*');

    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    if (filter === 'free') {
        query = query.eq('plan', 'free');
    } else if (filter === 'paid') {
        query = query.in('plan', ['starter', 'growth']);
    }

    const { data: users } = await query.order('created_at', { ascending: false });

    const usersWithStats = await Promise.all((users || []).map(async (user) => {
        const { count } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        return { ...user, quote_count: count };
    }));

    return NextResponse.json({ users: usersWithStats });
}
