import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { detectCountryFromRequest, getCurrencyForCountry } from '@/lib/pricing';
import type { Database } from '@/types';

/**
 * middleware.ts
 * Runs on requests matching /app/* and / (landing page).
 *
 * Responsibilities:
 *  1. Refresh Supabase auth session (standard SSR pattern).
 *  2. Redirect unauthenticated /app/* requests to home.
 *  3. For authenticated users whose country_code is still the default 'AE',
 *     detect the real country and update profiles.
 *  4. On landing page (/): set qp_country cookie for geo caching,
 *     and set qp_referral cookie if ?ref= param is present.
 */
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const pathname = request.nextUrl.pathname;
    const isLandingPage = pathname === '/';

    // ── Landing page only: handle ?ref= and qp_country cookie ────────────────
    if (isLandingPage) {
        // Set qp_referral cookie if ?ref= is present (30-day expiry)
        const refCode = request.nextUrl.searchParams.get('ref');
        if (refCode && refCode.length > 0) {
            response.cookies.set('qp_referral', refCode, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
        }

        // Set qp_country cookie for geo caching if not already set (24 h)
        const existingCountryCookie = request.cookies.get('qp_country');
        if (!existingCountryCookie) {
            try {
                const cfCountry = request.headers.get('cf-ipcountry');
                const detectedCountry =
                    cfCountry && cfCountry !== 'XX' && cfCountry.length === 2
                        ? cfCountry.toUpperCase()
                        : await detectCountryFromRequest(request);

                response.cookies.set('qp_country', detectedCountry, {
                    httpOnly: false, // Readable by Server Components via cookies()
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24, // 24 hours
                });
            } catch {
                // Geo detection failure is non-fatal
            }
        }

        return response;
    }

    // ── /app/* routes: auth session refresh + geo update ─────────────────────

    // 1. Supabase SSR client (reads/refreshes session cookies)
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request: { headers: request.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // 2. Refresh session + get user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Geo detection — only when country is still the default
    const geoDoneCookie = request.cookies.get('qp_geo_done');

    if (!geoDoneCookie) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profileRow } = (await supabase
                .from('profiles')
                .select('country_code')
                .eq('id', user.id)
                .maybeSingle()) as {
                    data: { country_code: string } | null;
                    error: unknown;
                };

            if (profileRow?.country_code === 'AE') {
                const detectedCountry = await detectCountryFromRequest(request);

                if (detectedCountry !== 'AE') {
                    const detectedCurrency = getCurrencyForCountry(detectedCountry);

                    const { createClient: rawCreate } = await import('@supabase/supabase-js');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const admin = rawCreate<any>(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!,
                        { auth: { persistSession: false, autoRefreshToken: false } },
                    );

                    await admin
                        .from('profiles')
                        .update({ country_code: detectedCountry, currency_code: detectedCurrency })
                        .eq('id', user.id);
                }
            }
        } catch {
            // Geo detection failure is non-fatal
        }

        response.cookies.set('qp_geo_done', '1', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });
    }

    return response;
}

export const config = {
    matcher: ['/', '/app/:path*'],
};
