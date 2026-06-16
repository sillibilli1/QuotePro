/**
 * Stripe Price IDs for monthly and annual subscriptions
 * Reads from environment variables to match lib/pricing.ts configuration
 */

export type BillingPeriod = 'monthly' | 'annual';
export type PlanTier = 'starter' | 'growth';

interface StripePriceConfig {
    monthly: string;
    annual: string;
}

export const STRIPE_PRICES: Record<string, Record<PlanTier, StripePriceConfig>> = {
    AED: {
        starter: {
            monthly: process.env.STRIPE_PRICE_AED_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_AED_STARTER || '',
            annual: process.env.STRIPE_PRICE_AED_STARTER_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_AED_STARTER_ANNUAL || '',
        },
        growth: {
            monthly: process.env.STRIPE_PRICE_AED_GROWTH || process.env.NEXT_PUBLIC_STRIPE_PRICE_AED_GROWTH || '',
            annual: process.env.STRIPE_PRICE_AED_GROWTH_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_AED_GROWTH_ANNUAL || '',
        },
    },
    PKR: {
        starter: {
            monthly: process.env.STRIPE_PRICE_PKR_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_PKR_STARTER || '',
            annual: process.env.STRIPE_PRICE_PKR_STARTER_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_PKR_STARTER_ANNUAL || '',
        },
        growth: {
            monthly: process.env.STRIPE_PRICE_PKR_GROWTH || process.env.NEXT_PUBLIC_STRIPE_PRICE_PKR_GROWTH || '',
            annual: process.env.STRIPE_PRICE_PKR_GROWTH_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_PKR_GROWTH_ANNUAL || '',
        },
    },
    USD: {
        starter: {
            monthly: process.env.STRIPE_PRICE_USD_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_USD_STARTER || '',
            annual: process.env.STRIPE_PRICE_USD_STARTER_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_USD_STARTER_ANNUAL || '',
        },
        growth: {
            monthly: process.env.STRIPE_PRICE_USD_GROWTH || process.env.NEXT_PUBLIC_STRIPE_PRICE_USD_GROWTH || '',
            annual: process.env.STRIPE_PRICE_USD_GROWTH_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_USD_GROWTH_ANNUAL || '',
        },
    },
};

/**
 * Get Stripe Price ID for a given currency, plan, and billing period
 */
export function getStripePriceId(
    currency: string,
    plan: PlanTier,
    period: BillingPeriod
): string {
    const priceConfig = STRIPE_PRICES[currency]?.[plan];
    if (!priceConfig) {
        throw new Error(`No Stripe price configuration found for ${currency} ${plan}`);
    }
    return priceConfig[period];
}

/**
 * Get plan and billing interval from Stripe Price ID
 */
export function getPlanFromPriceId(priceId: string): { plan: PlanTier; interval: BillingPeriod } | null {
    for (const [currency, plans] of Object.entries(STRIPE_PRICES)) {
        for (const [planName, prices] of Object.entries(plans)) {
            if (prices.monthly === priceId) {
                return { plan: planName as PlanTier, interval: 'monthly' };
            }
            if (prices.annual === priceId) {
                return { plan: planName as PlanTier, interval: 'annual' };
            }
        }
    }
    return null;
}
