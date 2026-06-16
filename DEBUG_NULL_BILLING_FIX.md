# Debug Fix: Null Billing Interval and Expiry Date

## Root Cause Identified ✓

The issue was a **price ID mismatch** between two pricing configuration systems:

### The Problem

1. **[`lib/pricing.ts`](lib/pricing.ts)** - Used by checkout session creation
   - Reads price IDs from environment variables (e.g., `STRIPE_PRICE_AED_STARTER`)
   - Only defined **monthly** prices
   
2. **[`lib/stripe-config.ts`](lib/stripe-config.ts)** - Used by webhook to decode price IDs
   - Had hardcoded price IDs that didn't match the environment variables
   - Defined both monthly AND annual prices

### What Happened

1. User created a checkout session → used `getPricing()` → got a monthly price ID from env vars
2. Stripe webhook received the `checkout.session.completed` event
3. Webhook called `getPlanFromPriceId(priceId)` → searched hardcoded STRIPE_PRICES object
4. **Price ID not found** → returned `null`
5. `billing_interval` and `subscription_ends_at` remained `null` in database

### Investigation Results

✓ **Issue #1 - Admin UI Query**: Not the problem - uses `.select('*')` correctly  
✓ **Issue #2 - Webhook Logic**: Correct implementation, but `getPlanFromPriceId()` couldn't find the price ID  
✓ **Issue #3 - RLS/Admin Access**: Not the problem - uses `createAdminClient()` correctly  

**Real Issue**: Price ID lookup table mismatch

## Fix Applied ✓

Updated [`lib/stripe-config.ts`](lib/stripe-config.ts) to:
1. Read price IDs from environment variables (matching `lib/pricing.ts`)
2. Support both monthly AND annual billing intervals
3. Added PKR and USD configurations (was AED-only)

Updated [`.env.local.example`](.env.local.example) to document all 12 required price IDs (3 currencies × 2 plans × 2 intervals)

## Action Required

You need to add the actual annual price IDs to your `.env.local` file:

```env
# Add these 6 new lines to your .env.local:
STRIPE_PRICE_AED_STARTER_ANNUAL=price_YOUR_ACTUAL_ANNUAL_STARTER_AED_ID
STRIPE_PRICE_AED_GROWTH_ANNUAL=price_YOUR_ACTUAL_ANNUAL_GROWTH_AED_ID
STRIPE_PRICE_PKR_STARTER_ANNUAL=price_YOUR_ACTUAL_ANNUAL_STARTER_PKR_ID
STRIPE_PRICE_PKR_GROWTH_ANNUAL=price_YOUR_ACTUAL_ANNUAL_GROWTH_PKR_ID
STRIPE_PRICE_USD_STARTER_ANNUAL=price_YOUR_ACTUAL_ANNUAL_STARTER_USD_ID
STRIPE_PRICE_USD_GROWTH_ANNUAL=price_YOUR_ACTUAL_ANNUAL_GROWTH_USD_ID
```

After adding these:
1. Restart your dev server
2. Complete a new test checkout (Yearly Starter)
3. The webhook will now correctly identify the price ID and set `billing_interval: 'annual'` and `subscription_ends_at`
