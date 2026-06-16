import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { data: paymentRequest } = await supabase
        .from('manual_payment_requests')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!paymentRequest) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Calculate subscription end date based on billing interval
    const now = new Date();
    const billingInterval = paymentRequest.billing_interval || 'monthly';
    const subscriptionEndsAt = billingInterval === 'annual'
        ? new Date(now.setFullYear(now.getFullYear() + 1))
        : new Date(now.setMonth(now.getMonth() + 1));

    await supabase
        .from('profiles')
        .update({
            is_subscribed: true,
            plan: paymentRequest.plan,
            billing_interval: billingInterval,
            subscription_ends_at: subscriptionEndsAt.toISOString(),
        })
        .eq('id', paymentRequest.user_id);

    await supabase
        .from('manual_payment_requests')
        .update({
            status: 'approved',
            processed_at: new Date().toISOString(),
            processed_by: admin.email,
        })
        .eq('id', params.id);

    await supabase.from('admin_logs').insert({
        event_type: 'admin_action',
        details: {
            action: 'approve_payment',
            request_id: params.id,
            user_id: paymentRequest.user_id,
            plan: paymentRequest.plan,
            billing_interval: billingInterval,
            subscription_ends_at: subscriptionEndsAt.toISOString(),
        },
    });

    return NextResponse.json({ success: true });
}
