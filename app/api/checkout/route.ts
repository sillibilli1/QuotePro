import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { STRIPE_PRICES, getPlanFromPriceId } from '@/lib/stripe-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
    try {
        const { priceId } = await request.json();

        console.log('=== CHECKOUT DEBUG ===');
        console.log('Received priceId:', priceId);
        console.log('Available STRIPE_PRICES:', JSON.stringify(STRIPE_PRICES, null, 2));

        if (!priceId) {
            console.error('❌ No priceId provided');
            return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('❌ Unauthorized - no user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const planInfo = getPlanFromPriceId(priceId);
        console.log('Plan lookup result:', planInfo);

        if (!planInfo) {
            console.error('❌ Invalid priceId - not found in STRIPE_PRICES config');
            return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
        }

        console.log('✅ Creating Stripe session for:', {
            plan: planInfo.plan,
            interval: planInfo.interval,
            priceId,
            userId: user.id,
            email: user.email
        });

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `http://localhost:3000/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/app/upgrade`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
                plan: planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1),
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    plan: planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1),
                },
            },
        });

        console.log('✅ Checkout session created:', session.id);
        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('❌ Checkout error:', error);
        if (error instanceof Stripe.errors.StripeError) {
            console.error('Stripe error details:', {
                type: error.type,
                message: error.message,
                code: error.code,
            });
        }
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
