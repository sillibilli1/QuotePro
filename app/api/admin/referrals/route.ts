import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name, referral_code');

    const referralStats = await Promise.all(
        (users || []).map(async (user) => {
            const { count: totalReferrals } = await supabase
                .from('referrals')
                .select('*', { count: 'exact', head: true })
                .eq('referrer_id', user.id);

            const { data: referredUsers } = await supabase
                .from('referrals')
                .select('referred_id')
                .eq('referrer_id', user.id);

            const referredIds = referredUsers?.map(r => r.referred_id) || [];

            let paidReferrals = 0;
            if (referredIds.length > 0) {
                const { count } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .in('id', referredIds)
                    .eq('is_subscribed', true);
                paidReferrals = count || 0;
            }

            const conversionRate = totalReferrals ? ((paidReferrals / totalReferrals) * 100).toFixed(1) : '0';

            return {
                ...user,
                total_referrals: totalReferrals || 0,
                paid_referrals: paidReferrals,
                conversion_rate: conversionRate,
            };
        })
    );

    const sorted = referralStats.sort((a, b) => b.total_referrals - a.total_referrals);

    return NextResponse.json({ referrals: sorted });
}
