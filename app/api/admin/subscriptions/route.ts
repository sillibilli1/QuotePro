import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: subscriptions } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_subscribed', true)
        .order('created_at', { ascending: false });

    return NextResponse.json({ subscriptions: subscriptions || [] });
}
