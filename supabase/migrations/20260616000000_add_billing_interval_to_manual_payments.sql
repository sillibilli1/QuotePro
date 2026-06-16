-- Add billing_interval column to manual_payment_requests table
ALTER TABLE manual_payment_requests 
ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual'));

-- Update existing records to have monthly interval
UPDATE manual_payment_requests 
SET billing_interval = 'monthly' 
WHERE billing_interval IS NULL;
