import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPricing } from '@/lib/pricing';

export async function GET() {
    await requireAdmin();
    const supabase = createAdminClient();

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: activeSubscriptions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_subscribed', true);

    const { data: subs } = await supabase
        .from('profiles')
        .select('plan, currency_code, country')
        .eq('is_subscribed', true);

    let mrrAED = 0;
    subs?.forEach(sub => {
        const pricing = getPricing(sub.country || 'US');
        const price = sub.plan === 'starter' ? pricing.starter.price : sub.plan === 'growth' ? pricing.growth.price : 0;
        mrrAED += price;
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: quotesThisMonth } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

    return NextResponse.json({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        mrrAED: mrrAED.toFixed(0),
        quotesThisMonth: quotesThisMonth || 0,
    });
}
