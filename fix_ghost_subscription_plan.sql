-- Fix Ghost Subscription State: Reset plan to 'free' for all unsubscribed users
-- This corrects any stale plan values left behind after subscription cancellation

UPDATE profiles 
SET plan = 'free' 
WHERE is_subscribed = false 
  AND plan != 'free';

-- Verify the fix
SELECT id, email, plan, is_subscribed, stripe_subscription_id
FROM profiles
WHERE is_subscribed = false
ORDER BY updated_at DESC;
