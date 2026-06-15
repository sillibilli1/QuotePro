import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { STRIPE_PRICES } from '@/lib/stripe-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

// Map Stripe Price IDs to plan names
function getPlanFromPriceId(priceId: string): string | null {
    for (const [currency, plans] of Object.entries(STRIPE_PRICES)) {
        for (const [planName, prices] of Object.entries(plans)) {
            if (prices.monthly === priceId || prices.annual === priceId) {
                return planName.charAt(0).toUpperCase() + planName.slice(1); // "starter" -> "Starter"
            }
        }
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plan = getPlanFromPriceId(priceId);
        if (!plan) {
            return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `http://localhost:3000/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/app/upgrade`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
                plan: plan,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
