import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email?.endsWith('@hq.com')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch approved manual payments
    const { data: manualPayments } = await supabase
        .from('manual_payment_requests')
        .select(`
            id,
            amount,
            currency,
            plan,
            processed_at,
            user_id,
            profiles!inner(email, full_name)
        `)
        .eq('status', 'approved')
        .order('processed_at', { ascending: false });

    // Fetch Stripe subscriptions (active paid users)
    const { data: stripeUsersData } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan, billing_interval, currency_code, created_at')
        .not('plan', 'is', null)
        .neq('plan', 'free')
        .not('stripe_subscription_id', 'is', null)
        .order('created_at', { ascending: false });

    const stripeUsers: any[] = stripeUsersData || [];

    const payments: any[] = [];

    // Add manual payments
    if (manualPayments) {
        manualPayments.forEach((mp: any) => {
            payments.push({
                id: `manual-${mp.id}`,
                date: mp.processed_at,
                user_name: mp.profiles.full_name || 'Unknown',
                user_email: mp.profiles.email,
                payment_method: 'Manual',
                plan: mp.plan,
                amount: mp.amount,
                currency: mp.currency,
            });
        });
    }

    // Add Stripe payments (simplified: one entry per subscription)
    if (stripeUsers.length > 0) {
        stripeUsers.forEach((user: any) => {
            // Calculate amount based on plan and billing interval
            const plans: any = { starter: 49, growth: 149 };
            let amount = plans[user.plan] || 0;
            if (user.billing_interval === 'annual') amount *= 10; // 10-month pricing

            payments.push({
                id: `stripe-${user.id}`,
                date: user.created_at,
                user_name: user.full_name || 'Unknown',
                user_email: user.email,
                payment_method: 'Stripe',
                plan: user.plan,
                amount,
                currency: user.currency_code,
            });
        });
    }

    // Sort by date descending
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate monthly total (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTotal = payments
        .filter(p => new Date(p.date) >= monthStart)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({ payments, monthlyTotal });
}
