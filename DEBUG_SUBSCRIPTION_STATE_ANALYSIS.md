# Debug Report: Inconsistent Subscription State Across UI

## Executive Summary
The user's plan is correctly set to `'growth'` in the database, but three different UI locations are showing inconsistent information due to **case-sensitivity mismatches** in the code logic.

---

## Root Cause Analysis

### Issue #1: Dashboard Shows "0 of 5 quotes" Instead of Unlimited ❌

**Location**: [`app/app/dashboard/page.tsx:165`](app/app/dashboard/page.tsx:165)

**Problem**: Dashboard shows "0 of 5 quotes used" despite Growth plan subscription.

**Root Cause**:
The dashboard calls `getMonthlyQuoteUsage()` which uses `getPlanLimit()`:

```typescript
// lib/quote-usage.ts:44-45
if (plan === 'growth') {
    return GROWTH_QUOTE_LIMIT; // 999999
}
```

This comparison is **case-sensitive** and expects exactly `'growth'` (lowercase). If the database contains any variation, the comparison fails and falls through to:

```typescript
// lib/quote-usage.ts:53
return FREE_QUOTE_LIMIT; // 5 quotes
```

**Evidence**: The function has NO normalization, unlike `getPlanBadge()`.

---

### Issue #2: Account Page Shows Dash (-) Instead of "Growth" ❌

**Location**: [`app/app/profile/page.tsx:34`](app/app/profile/page.tsx:34) → [`components/ProfileSettings.tsx:193-194`](components/ProfileSettings.tsx:193-194)

**Problem**: The Plan badge shows `-` instead of "Growth".

**Root Cause**:
```typescript
// app/app/profile/page.tsx:34
const plan: PlanTier = (profile?.plan as PlanTier | null) ?? 'free';
```

The `PLAN_LABEL` mapping in ProfileSettings expects exact TypeScript enum values:
```typescript
// components/ProfileSettings.tsx:16-20
const PLAN_LABEL: Record<PlanTier, string> = {
    free: 'Free',
    starter: 'Starter',
    growth: 'Growth',
};
```

**Critical Issue**: TypeScript's `PlanTier` type is defined in TWO different places:

1. `types/index.ts`: `type PlanTier = 'free' | 'starter' | 'growth';`
2. `lib/stripe-config.ts`: `type PlanTier = 'starter' | 'growth';` (no 'free')

The Account page imports from `types/index.ts`, but if the database value doesn't match exactly (case-sensitive), the Record lookup fails:
- `PLAN_LABEL['growth']` → ✓ Returns `'Growth'`
- `PLAN_LABEL['Growth']` → ❌ Returns `undefined` → Badge renders `-`

---

### Issue #3: Header Badge Shows "Growth" Correctly ✅

**Location**: [`app/app/dashboard/page.tsx:117-131`](app/app/dashboard/page.tsx:117-131)

**Why It Works**:
```typescript
function getPlanBadge(plan: string | null, isSubscribed: boolean) {
    // ...
    // Normalize to lowercase for case-insensitive matching
    const normalizedPlan = plan.toLowerCase();
    if (normalizedPlan === 'growth') {
        return { label: 'Growth', classes: '...' };
    }
}
```

This function explicitly **normalizes to lowercase** before comparison, making it resilient to case variations.

---

## Stripe Webhook Analysis

**Webhook Handler**: [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts)

### How Plan Values Are Set

```typescript
// route.ts:10-19
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
```

**Key Findings**:

1. ✅ The webhook correctly returns lowercase `'starter'` or `'growth'`
2. ✅ It doesn't differentiate between monthly/annual (both map to same plan name)
3. ✅ The webhook writes lowercase plan values to the database (line 85)

**However**:

- Line 58: `let plan = session.metadata?.plan;` — If metadata contains capitalized values, it's used directly
- Line 104: `const plan = subscription.metadata?.plan;` — Same issue in update handler

---

## Likely Scenario

Based on the symptoms, here's what probably happened:

1. ✅ User subscribed via Stripe Checkout
2. ❌ The checkout session metadata contained `plan: 'Growth'` (capitalized)
3. ❌ Webhook wrote `'Growth'` to database (bypassed `getPlanFromPriceId()` because metadata was present)
4. Result:
   - Header badge works (normalizes to lowercase) ✅
   - Dashboard quota breaks (case-sensitive check) ❌
   - Account page breaks (Record lookup fails) ❌

---

## Missing Logic: No Database Constraints

**Current Schema**:
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT;
```

**Problems**:
- No CHECK constraint to enforce valid values
- No normalization trigger
- Values can be NULL, uppercase, mixed-case, or invalid strings

---

## The Fix Required

### 1. Normalize All Case-Sensitive Comparisons

**Files to Fix**:
- [`lib/quote-usage.ts`](lib/quote-usage.ts:44) — Add `.toLowerCase()` to plan comparison
- Any other location doing exact string matches on `plan`

### 2. Normalize Database Value

Run SQL to ensure lowercase:
```sql
UPDATE profiles 
SET plan = LOWER(plan) 
WHERE plan IS NOT NULL AND plan != LOWER(plan);
```

### 3. Add Database Constraint (Optional but Recommended)

```sql
ALTER TABLE profiles
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IS NULL OR plan IN ('starter', 'growth'));
```

### 4. Fix Webhook Metadata Handling

Ensure webhooks always normalize:
```typescript
let plan = session.metadata?.plan?.toLowerCase();
```

---

## Verification Steps

After applying fixes, verify:

1. Run: `SELECT id, email, plan, is_subscribed FROM profiles WHERE is_subscribed = true;`
   - Ensure plan is lowercase `'growth'`

2. Check Dashboard:
   - Quota should show "0 of ∞" or unlimited message

3. Check Account Page:
   - Badge should show "Growth" with success variant (green)

4. Test edge cases:
   - What if database contains `'Growth'` (capitalized)?
   - What if database contains `'growth_monthly'`?
   - What if database contains `NULL` with `is_subscribed = true`?
