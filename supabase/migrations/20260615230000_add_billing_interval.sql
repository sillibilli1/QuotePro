-- Add billing_interval column to profiles table
ALTER TABLE profiles 
ADD COLUMN billing_interval TEXT CHECK (billing_interval IN ('monthly', 'annual'));

-- Add index for better query performance
CREATE INDEX idx_profiles_billing_interval ON profiles(billing_interval) WHERE billing_interval IS NOT NULL;
