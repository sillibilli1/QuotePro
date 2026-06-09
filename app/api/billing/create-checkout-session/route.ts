import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import { getPricing } from '@/lib/pricing';
import type { PlanTier } from '@/types';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
    try {
        // ── 1. Authenticate ────────────────────────────────────────────────────
        const supabase = createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── 2. Parse request body ──────────────────────────────────────────────
        const body = (await request.json()) as { plan?: string };
        const planName = body.plan as PlanTier | undefined;

        if (!planName || (planName !== 'starter' && planName !== 'growth')) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "starter" or "growth".' },
                { status: 400 },
            );
        }

        // ── 3. Fetch user profile (untyped admin client avoids `never` inference) ─
        const admin = createAdminClient();
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('country_code, currency_code, stripe_customer_id, email')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const countryCode: string = profile.country_code ?? 'AE';
        const currencyCode: string = profile.currency_code ?? 'AED';

        // ── 4. Get the correct Stripe Price ID for this country ────────────────
        const pricing = getPricing(countryCode);
        const planInfo = pricing[planName];
        const priceId = planInfo.priceId;

        if (!priceId) {
            return NextResponse.json(
                { error: `Stripe Price ID not configured for ${planName} / ${currencyCode}` },
                { status: 500 },
            );
        }

        // ── 5. Resolve or create Stripe Customer ───────────────────────────────
        let stripeCustomerId: string | undefined = profile.stripe_customer_id ?? undefined;

        if (!stripeCustomerId) {
            const customer = await getStripeClient().customers.create({
                email: user.email ?? (profile.email as string),
                metadata: { userId: user.id, countryCode },
            });
            stripeCustomerId = customer.id;

            // Persist so future checkouts reuse the same customer
            await admin
                .from('profiles')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', user.id);
        }

        // ── 6. Create Stripe Checkout Session ──────────────────────────────────
        const session = await getStripeClient().checkout.sessions.create({
            mode: 'subscription',
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${APP_URL}/app/dashboard?upgrade=success&plan=${planName}`,
            cancel_url: `${APP_URL}/app/upgrade?upgrade=cancelled`,
            metadata: {
                userId: user.id,
                countryCode,
                plan: planName,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    countryCode,
                    plan: planName,
                },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error('[create-checkout-session]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
