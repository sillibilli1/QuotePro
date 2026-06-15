-- SQL Patch: Fix Corrupted plan_type for Growth Plan Subscriber
-- Run this in your Supabase SQL Editor to immediately fix the broken UI

-- Option 1: If you know your user email, replace 'your-email@example.com'
UPDATE profiles
SET plan = 'growth'
WHERE email = 'your-email@example.com'
  AND is_subscribed = true;

-- Option 2: Update ALL subscribed users with null/invalid plan to 'growth'
-- (Use with caution if you have multiple users)
UPDATE profiles
SET plan = 'growth'
WHERE is_subscribed = true
  AND (plan IS NULL OR plan NOT IN ('starter', 'growth'));

-- Option 3: Target by stripe_subscription_id if you know it
-- UPDATE profiles
-- SET plan = 'growth'
-- WHERE stripe_subscription_id = 'sub_xxxxxxxxxxxxx';

-- Verify the fix:
SELECT id, email, plan, is_subscribed, stripe_subscription_id
FROM profiles
WHERE is_subscribed = true;
