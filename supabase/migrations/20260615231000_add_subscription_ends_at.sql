-- Add subscription_ends_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN subscription_ends_at TIMESTAMPTZ;

-- Add index for better query performance on expiry tracking
CREATE INDEX idx_profiles_subscription_ends_at ON profiles(subscription_ends_at) WHERE subscription_ends_at IS NOT NULL;
