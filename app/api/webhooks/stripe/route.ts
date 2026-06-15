import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { STRIPE_PRICES } from '@/lib/stripe-config';

export const dynamic = 'force-dynamic';

// Map Stripe Price IDs to plan names (returns lowercase: 'starter' | 'growth')
function getPlanFromPriceId(priceId: string): 'starter' | 'growth' | null {
    for (const plans of Object.values(STRIPE_PRICES)) {
        for (const [planName, prices] of Object.entries(plans)) {
            if (prices.monthly === priceId || prices.annual === priceId) {
                return planName as 'starter' | 'growth';
            }
        }
    }
    return null;
}

/**
 * POST /api/webhooks/stripe
 *
 * IMPORTANT: Next.js 14 App Router — do NOT JSON.parse before verifying.
 * Read raw body via request.text(), then pass to stripe.webhooks.constructEvent().
 */
export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = getStripeClient().webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[stripe-webhook] Signature verification failed:', message);
        return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
    }

    const admin = createAdminClient();

    try {
        switch (event.type) {
            // ── Subscription created / payment succeeded ───────────────────────
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const userId = session.metadata?.userId;
                let plan = session.metadata?.plan;

                if (!userId) {
                    console.error('[stripe-webhook] Missing userId in session metadata', session.id);
                    break;
                }

                // If plan is missing, try to derive it from the subscription
                if (!plan && session.subscription) {
                    const stripe = getStripeClient();
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                    const priceId = subscription.items.data[0]?.price.id;
                    if (priceId) {
                        plan = getPlanFromPriceId(priceId) || undefined;
                    }
                }

                // Safety: Only update if we have a valid plan (never write null)
                if (!plan) {
                    console.error('[stripe-webhook] Could not determine plan for session', session.id, 'priceId may not match config');
                    break;
                }

                const { error } = await admin
                    .from('profiles')
                    .update({
                        is_subscribed: true,
                        plan: plan.toLowerCase(),
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[stripe-webhook] Database update failed:', error);
                } else {
                    console.log(`[stripe-webhook] checkout.session.completed — userId=${userId} plan=${plan} ✓`);
                }
                break;
            }

            // ── Subscription renewed / reactivated ─────────────────────────────
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                const userId = subscription.metadata?.userId;
                const plan = subscription.metadata?.plan;

                if (!userId) break;

                const isActive =
                    subscription.status === 'active' || subscription.status === 'trialing';

                await admin
                    .from('profiles')
                    .update({
                        is_subscribed: isActive,
                        plan: isActive && plan ? plan.toLowerCase() : null,
                        stripe_subscription_id: subscription.id,
                    })
                    .eq('id', userId);

                break;
            }

            // ── Subscription cancelled / expired ───────────────────────────────
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Look up the user by their subscription ID (metadata may not be set
                // if the subscription was created before we started storing it)
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await admin
                        .from('profiles')
                        .update({
                            is_subscribed: false,
                            plan: null,
                            stripe_subscription_id: null,
                        })
                        .eq('id', userId);
                } else {
                    // Fall back: find by stripe_subscription_id column
                    await admin
                        .from('profiles')
                        .update({
                            is_subscribed: false,
                            plan: null,
                            stripe_subscription_id: null,
                        })
                        .eq('stripe_subscription_id', subscription.id);
                }

                console.log(`[stripe-webhook] customer.subscription.deleted — subId=${subscription.id}`);
                break;
            }

            // ── Invoice payment failed ─────────────────────────────────────────
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.warn(`[stripe-webhook] invoice.payment_failed — customer=${invoice.customer}`);
                // Future: send a payment-failure email via Resend
                break;
            }

            default:
                // Unhandled event type — return 200 so Stripe doesn't retry
                break;
        }
    } catch (err) {
        console.error('[stripe-webhook] Handler error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
