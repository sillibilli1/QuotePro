import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const supabase = createAdminClient();
    let query = supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (type && type !== 'all') {
        query = query.eq('event_type', type);
    }

    const { data: logs } = await query;

    return NextResponse.json({ logs: logs || [] });
}
