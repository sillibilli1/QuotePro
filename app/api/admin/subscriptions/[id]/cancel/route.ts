import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin();
    const supabase = await createClient();

    await supabase
        .from('profiles')
        .update({
            is_subscribed: false,
            plan: 'free',
            stripe_subscription_id: null,
        })
        .eq('id', params.id);

    await supabase.from('admin_logs').insert({
        event_type: 'admin_action',
        details: {
            action: 'cancel_subscription',
            user_id: params.id,
            admin_email: admin.email,
        },
    });

    return NextResponse.json({ success: true });
}
