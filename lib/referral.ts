/**
 * lib/referral.ts
 * Referral system helpers — server-side only.
 */
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Look up a referrer by their public referral_code.
 * Returns the referrer's profile id, or null if not found.
 */
export async function getReferrerIdByCode(referralCode: string): Promise<string | null> {
    if (!referralCode) return null;

    const admin = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

    return (data as { id: string } | null)?.id ?? null;
}

/**
 * Record that newUserId was referred by referrerId.
 * Guards:
 *  - No self-referral
 *  - Does not overwrite an existing referred_by value
 */
export async function recordReferral(
    newUserId: string,
    referrerId: string,
): Promise<void> {
    if (!newUserId || !referrerId) return;
    if (newUserId === referrerId) return; // no self-referral

    const admin = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminAny = admin as any;

    // Only write if referred_by is still NULL
    const { data: profile } = await adminAny
        .from('profiles')
        .select('referred_by')
        .eq('id', newUserId)
        .maybeSingle();

    if (profile?.referred_by) return; // already set, don't overwrite

    await adminAny
        .from('profiles')
        .update({ referred_by: referrerId })
        .eq('id', newUserId);
}

/**
 * Credit 2 bonus quotes to the referrer when their referred user
 * completes their first quote. Call this from the quote-generate route.
 */
export async function creditReferrerBonus(newUserId: string): Promise<void> {
    if (!newUserId) return;

    const admin = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminAny = admin as any;

    // Get the referrer id for this user
    const { data: profile } = await adminAny
        .from('profiles')
        .select('referred_by')
        .eq('id', newUserId)
        .maybeSingle();

    const referrerId: string | null = profile?.referred_by ?? null;
    if (!referrerId) return;

    // Increment bonus_quotes by 2 for the referrer
    // Uses a raw RPC call to avoid read-modify-write race conditions
    await adminAny.rpc('increment_bonus_quotes', {
        p_user_id: referrerId,
        p_amount: 2,
    });
}

/**
 * Returns the total available quotes for a user:
 *   base (5 free or plan quota) + bonus_quotes
 *
 * Called from quote-usage checks.
 */
export async function getBonusQuotes(userId: string): Promise<number> {
    const admin = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
        .from('profiles')
        .select('bonus_quotes')
        .eq('id', userId)
        .maybeSingle();

    return (data as { bonus_quotes: number } | null)?.bonus_quotes ?? 0;
}
