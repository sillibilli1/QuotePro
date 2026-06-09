import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getReferrerIdByCode, recordReferral } from '@/lib/referral';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/app/dashboard';

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);

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
