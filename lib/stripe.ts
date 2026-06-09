import Stripe from 'stripe';

/**
 * lib/stripe.ts
 * Returns a lazily-initialized Stripe client — server-side only.
 * Using a factory function prevents build-time failures when
 * STRIPE_SECRET_KEY is absent (e.g. in CI or during `next build`).
 */
export function getStripeClient(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
    }
    return new Stripe(key);
}
