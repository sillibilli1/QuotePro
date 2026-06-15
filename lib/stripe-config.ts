/**
 * Stripe Price IDs for monthly and annual subscriptions
 * Maps region and billing period to the correct Stripe Price ID
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
            monthly: 'price_1TihswGsKqflw0DCv9r5U32z',
            annual: 'price_1TihtqGsKqflw0DCcNjTyulW',
        },
        growth: {
            monthly: 'price_1TihuLGsKqflw0DC0UCNsqa1',
            annual: 'price_1TihucGsKqflw0DCjtcFURAR',
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
