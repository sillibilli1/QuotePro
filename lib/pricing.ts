/**
 * lib/pricing.ts
 * Single source of truth for all pricing tiers and geo detection.
 * Never hardcode prices anywhere else in the app — always call getPricing().
 */

export type PlanTier = 'free' | 'starter' | 'growth';

export interface PaidPlanInfo {
    price: number;
    currency: string;
    /** Lowercase Stripe currency code, e.g. 'aed', 'pkr', 'usd' */
    stripeCurrency: string;
    priceId: string;
    quotes: number | 'unlimited';
}

export interface PricingPlan {
    free: { quotes: number };
    starter: PaidPlanInfo;
    growth: PaidPlanInfo;
}

const GCC_COUNTRIES = ['AE', 'SA', 'OM', 'QA', 'BH', 'KW'] as const;

/** Returns the currency code for a given country. */
export function getCurrencyForCountry(countryCode: string): string {
    if (countryCode === 'PK') return 'PKR';
    if ((GCC_COUNTRIES as readonly string[]).includes(countryCode)) return 'AED';
    return 'USD';
}

/**
 * Returns the full pricing structure for the given ISO 3166-1 alpha-2 country code.
 * This is the ONLY place prices are defined — never duplicate them.
 */
export function getPricing(countryCode: string): PricingPlan {
    if (countryCode === 'PK') {
        return {
            free: { quotes: 5 },
            starter: {
                price: 2500,
                currency: 'PKR',
                stripeCurrency: 'pkr',
                priceId: process.env.STRIPE_PRICE_PKR_STARTER!,
                quotes: 30,
            },
            growth: {
                price: 5999,
                currency: 'PKR',
                stripeCurrency: 'pkr',
                priceId: process.env.STRIPE_PRICE_PKR_GROWTH!,
                quotes: 'unlimited',
            },
        };
    }

    if ((GCC_COUNTRIES as readonly string[]).includes(countryCode)) {
        return {
            free: { quotes: 5 },
            starter: {
                price: 299,
                currency: 'AED',
                stripeCurrency: 'aed',
                priceId: process.env.STRIPE_PRICE_AED_STARTER!,
                quotes: 30,
            },
            growth: {
                price: 599,
                currency: 'AED',
                stripeCurrency: 'aed',
                priceId: process.env.STRIPE_PRICE_AED_GROWTH!,
                quotes: 'unlimited',
            },
        };
    }

    // Rest of World → USD
    return {
        free: { quotes: 5 },
        starter: {
            price: 29,
            currency: 'USD',
            stripeCurrency: 'usd',
            priceId: process.env.STRIPE_PRICE_USD_STARTER!,
            quotes: 30,
        },
        growth: {
            price: 59,
            currency: 'USD',
            stripeCurrency: 'usd',
            priceId: process.env.STRIPE_PRICE_USD_GROWTH!,
            quotes: 'unlimited',
        },
    };
}

/**
 * Fetches the country code for a given IP address using ipapi.co.
 * SERVER-SIDE ONLY. Never call from client — would expose the IP.
 * Throws on network failure or non-OK response so callers can catch and fall back.
 */
export async function getCountryFromIP(ip: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
        const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
            signal: controller.signal,
            headers: { 'User-Agent': 'QuotePro/1.0' },
            // No caching — result changes per IP
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`ipapi.co returned ${res.status}`);
        }

        const data = (await res.json()) as { country_code?: string; error?: boolean };

        if (data.error || !data.country_code) {
            throw new Error('ipapi.co returned an error or empty country_code');
        }

        return data.country_code.toUpperCase();
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Detects the country from an incoming HTTP request.
 * Priority order:
 *   1. CF-IPCountry header (Cloudflare — no API call, no rate limit)
 *   2. x-forwarded-for → ipapi.co lookup (3 s timeout)
 *   3. Fallback: 'AE'
 *
 * SERVER-SIDE ONLY.
 */
export async function detectCountryFromRequest(request: Request): Promise<string> {
    // Priority 1: Cloudflare CF-IPCountry (free, instant, no quota)
    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry && cfCountry !== 'XX' && cfCountry.length === 2) {
        return cfCountry.toUpperCase();
    }

    // Priority 2: x-forwarded-for → ipapi.co
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // May be comma-separated list; take the first (client IP)
        const ip = forwardedFor.split(',')[0].trim();
        // Skip private/loopback IPs — ipapi.co can't resolve them
        if (ip && !isPrivateIP(ip)) {
            try {
                return await getCountryFromIP(ip);
            } catch {
                // ipapi.co failed — fall through to default
            }
        }
    }

    // Fallback
    return 'AE';
}

/** Returns true for RFC-1918 / loopback addresses that ipapi.co cannot resolve. */
function isPrivateIP(ip: string): boolean {
    return (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
    );
}
