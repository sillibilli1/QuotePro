import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: requests } = await supabase
        .from('manual_payment_requests')
        .select(`
      *,
      user:profiles!user_id(email, full_name, company_name)
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    return NextResponse.json({ requests: requests || [] });
}
