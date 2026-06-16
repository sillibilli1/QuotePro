# Debug: 400 Bad Request on /api/checkout

## Root Cause Analysis

The checkout is failing because of a **mismatch between environment variable expectations and what's actually configured**.

## The Flow

1. User clicks "Upgrade to Starter" (Monthly or Annual)
2. [`PricingCard.tsx`](components/pricing/PricingCard.tsx:120) calls `getStripePriceId(currency, tier, billingPeriod)`
3. [`stripe-config.ts`](lib/stripe-config.ts:50) looks up: `STRIPE_PRICES[currency][plan][period]`
4. Returns `process.env.STRIPE_PRICE_AED_STARTER` or `process.env.STRIPE_PRICE_AED_STARTER_ANNUAL`
5. Sends that priceId to `/api/checkout`
6. [`checkout/route.ts`](app/api/checkout/route.ts:24) validates the priceId
7. Creates Stripe checkout session

## What's Breaking

**Most likely scenario:** Your `.env.local` contains placeholder values like:
```
STRIPE_PRICE_AED_STARTER=price_test_starter_monthly
STRIPE_PRICE_AED_STARTER_ANNUAL=price_test_starter_annual
```

These are **NOT valid Stripe Price IDs**. Stripe rejects them with a 400 error.

## Expected Environment Variables

Your `.env.local` needs these **12 variables** with **real Stripe Price IDs**:

```bash
# AED (UAE Dirham)
STRIPE_PRICE_AED_STARTER=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_AED_STARTER_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_AED_GROWTH=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_AED_GROWTH_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx

# PKR (Pakistani Rupee)
STRIPE_PRICE_PKR_STARTER=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PKR_STARTER_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PKR_GROWTH=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PKR_GROWTH_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx

# USD (US Dollar)
STRIPE_PRICE_USD_STARTER=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_USD_STARTER_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_USD_GROWTH=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_USD_GROWTH_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
```

## How to Fix

### Step 1: Get Real Stripe Price IDs

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Create products for each plan (Starter, Growth) in each currency (AED, PKR, USD)
3. For each product, create TWO prices:
   - **Monthly recurring** (e.g., 299 AED/month)
   - **Annual recurring** (e.g., 2990 AED/year - which is 10 months)
4. Copy each Price ID (starts with `price_`)

### Step 2: Update Your `.env.local`

Replace the placeholder values with real Price IDs from Step 1.

### Step 3: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Changes Made

I've added comprehensive debugging to help identify the exact issue:

1. **[`app/api/checkout/route.ts`](app/api/checkout/route.ts:12)** - Logs received priceId and all available STRIPE_PRICES
2. **[`components/pricing/PricingCard.tsx`](components/pricing/PricingCard.tsx:119)** - Logs upgrade attempts with tier, currency, and priceId
3. **[`components/pricing/PricingCard.tsx`](components/pricing/PricingCard.tsx:237)** - Shows user-friendly error alerts

## How to Debug

1. Open your browser console
2. Click an upgrade button
3. Look for logs starting with `🔍 Upgrade attempt:`
4. Check if `priceId` is a valid Stripe Price ID (starts with `price_`)
5. Check the server terminal for `=== CHECKOUT DEBUG ===` logs

## Quick Test Without Real Stripe

If you want to test the flow without creating real Stripe prices:

1. Use Stripe's test mode Price IDs from existing test products
2. Or temporarily add a bypass in [`checkout/route.ts`](app/api/checkout/route.ts:42) to skip the Stripe call and return a mock URL

## Expected Behavior After Fix

✅ Browser console shows: `priceIdValid: true`  
✅ Server logs: `✅ Creating Stripe session for: { plan: 'starter', interval: 'monthly', priceId: 'price_...' }`  
✅ Browser redirects to Stripe Checkout page  
✅ After payment, redirects to `/app/dashboard?session_id=...`
