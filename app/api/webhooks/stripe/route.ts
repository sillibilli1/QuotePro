import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { getPlanFromPriceId } from '@/lib/stripe-config';

export const dynamic = 'force-dynamic';

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
                console.log('[stripe-webhook] checkout.session.completed received:', {
                    sessionId: session.id,
                    customer: session.customer,
                    subscription: session.subscription,
                    metadata: session.metadata,
                });

                const userId = session.metadata?.userId;
                let plan = session.metadata?.plan;

                if (!userId) {
                    console.error('[stripe-webhook] ❌ CRITICAL: Missing userId in session metadata', {
                        sessionId: session.id,
                        metadata: session.metadata,
                        customer: session.customer,
                    });
                    break;
                }

                let billingInterval: 'monthly' | 'annual' | null = null;
                let subscriptionEndsAt: string | null = null;

                // Always retrieve subscription to get billing interval and period end
                if (session.subscription) {
                    const stripe = getStripeClient();
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                    const priceId = subscription.items.data[0]?.price.id;
                    console.log('[stripe-webhook] Retrieved priceId:', priceId);

                    if (priceId) {
                        const planInfo = getPlanFromPriceId(priceId);
                        console.log('[stripe-webhook] getPlanFromPriceId result:', planInfo);

                        if (planInfo) {
                            // Use metadata plan if available, otherwise derive from priceId
                            if (!plan) {
                                plan = planInfo.plan;
                            }
                            billingInterval = planInfo.interval;
                        } else {
                            console.error('[stripe-webhook] ❌ CRITICAL: getPlanFromPriceId returned null for priceId:', priceId);
                        }
                    }
                    // Convert Unix timestamp (seconds) to ISO string
                    subscriptionEndsAt = new Date(subscription.current_period_end * 1000).toISOString();
                }

                // Safety: Only update if we have a valid plan (never write null)
                if (!plan) {
                    console.error('[stripe-webhook] ❌ CRITICAL: Could not determine plan for session', {
                        sessionId: session.id,
                        metadata: session.metadata,
                        subscription: session.subscription,
                    });
                    break;
                }

                console.log('[stripe-webhook] Attempting database update:', {
                    userId,
                    plan: plan.toLowerCase(),
                    billingInterval,
                    subscriptionEndsAt,
                });

                const { error, data } = await admin
                    .from('profiles')
                    .update({
                        is_subscribed: true,
                        plan: plan.toLowerCase(),
                        billing_interval: billingInterval,
                        subscription_ends_at: subscriptionEndsAt,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                    })
                    .eq('id', userId)
                    .select();

                if (error) {
                    console.error('[stripe-webhook] ❌ Database update failed:', {
                        error,
                        userId,
                        plan,
                    });
                } else if (!data || data.length === 0) {
                    console.error('[stripe-webhook] ❌ CRITICAL: No rows updated - user not found?', {
                        userId,
                        plan,
                    });
                } else {
                    console.log(`[stripe-webhook] ✅ checkout.session.completed — userId=${userId} plan=${plan} billingInterval=${billingInterval}`);
                }
                break;
            }

            // ── Subscription renewed / reactivated ─────────────────────────────
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('[stripe-webhook] customer.subscription.updated received:', {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    metadata: subscription.metadata,
                    priceId: subscription.items.data[0]?.price.id,
                });

                const userId = subscription.metadata?.userId;
                let plan = subscription.metadata?.plan;

                if (!userId) {
                    console.error('[stripe-webhook] ❌ CRITICAL: Missing userId in subscription metadata', {
                        subscriptionId: subscription.id,
                        metadata: subscription.metadata,
                    });
                    break;
                }

                const isActive =
                    subscription.status === 'active' || subscription.status === 'trialing';

                let billingInterval: 'monthly' | 'annual' | null = null;
                let subscriptionEndsAt: string | null = null;

                // Derive plan and interval from price ID if not in metadata
                if (isActive && !plan) {
                    const priceId = subscription.items.data[0]?.price.id;
                    console.log('[stripe-webhook] Deriving plan from priceId:', priceId);

                    if (priceId) {
                        const planInfo = getPlanFromPriceId(priceId);
                        console.log('[stripe-webhook] getPlanFromPriceId result:', planInfo);

                        if (planInfo) {
                            plan = planInfo.plan;
                            billingInterval = planInfo.interval;
                        } else {
                            console.error('[stripe-webhook] ❌ CRITICAL: getPlanFromPriceId returned null for priceId:', priceId);
                        }
                    }
                }

                // Convert Unix timestamp (seconds) to ISO string
                if (isActive) {
                    subscriptionEndsAt = new Date(subscription.current_period_end * 1000).toISOString();
                }

                console.log('[stripe-webhook] Attempting database update:', {
                    userId,
                    isActive,
                    plan: isActive && plan ? plan.toLowerCase() : null,
                    billingInterval,
                    subscriptionEndsAt,
                });

                const { error, data } = await admin
                    .from('profiles')
                    .update({
                        is_subscribed: isActive,
                        plan: isActive && plan ? plan.toLowerCase() : null,
                        billing_interval: isActive ? billingInterval : null,
                        subscription_ends_at: subscriptionEndsAt,
                        stripe_subscription_id: subscription.id,
                    })
                    .eq('id', userId)
                    .select();

                if (error) {
                    console.error('[stripe-webhook] ❌ Database update failed:', {
                        error,
                        userId,
                    });
                } else if (!data || data.length === 0) {
                    console.error('[stripe-webhook] ❌ CRITICAL: No rows updated - user not found?', {
                        userId,
                    });
                } else {
                    console.log(`[stripe-webhook] ✅ customer.subscription.updated — userId=${userId} isActive=${isActive} plan=${plan}`);
                }

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
                            plan: 'free',
                            billing_interval: null,
                            subscription_ends_at: null,
                            stripe_subscription_id: null,
                        })
                        .eq('id', userId);
                } else {
                    // Fall back: find by stripe_subscription_id column
                    await admin
                        .from('profiles')
                        .update({
                            is_subscribed: false,
                            plan: 'free',
                            billing_interval: null,
                            subscription_ends_at: null,
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
