import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { getReferrerIdByCode, recordReferral } from '@/lib/referral';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/app/dashboard';

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);

        // ── Profile sync ───────────────────────────────────────────────────
        // Ensure profile exists in public.profiles for OAuth users
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const adminClient = createServiceRoleClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (adminClient.from('profiles') as any).upsert({
                    id: user.id,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                });
            }
        } catch {
            // Profile sync failure is non-fatal
        }

        // ── Referral tracking ──────────────────────────────────────────────
        // The ?ref= URL param is lost after magic-link redirect.
        // We stored it in the qp_referral cookie (set by middleware on landing page).
        try {
            const cookieStore = cookies();
            const referralCookie = cookieStore.get('qp_referral');

            if (referralCookie?.value) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    const referrerId = await getReferrerIdByCode(referralCookie.value);

                    if (referrerId) {
                        await recordReferral(user.id, referrerId);
                    }
                }

                // Delete the referral cookie regardless — prevents stale re-use
                const response = NextResponse.redirect(new URL(next, requestUrl.origin));
                response.cookies.set('qp_referral', '', {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 0, // delete immediately
                });
                return response;
            }
        } catch {
            // Referral tracking failure is non-fatal — user still logs in
        }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
}
