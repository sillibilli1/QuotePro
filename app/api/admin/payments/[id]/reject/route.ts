import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin();
    const supabase = await createClient();

    await (supabase as any)
        .from('manual_payment_requests')
        .update({
            status: 'rejected',
            processed_at: new Date().toISOString(),
            processed_by: admin.email,
        })
        .eq('id', params.id);

    await (supabase as any).from('admin_logs').insert({
        event_type: 'admin_action',
        details: {
            action: 'reject_payment',
            request_id: params.id,
        },
    });

    return NextResponse.json({ success: true });
}
