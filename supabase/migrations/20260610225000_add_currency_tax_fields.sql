-- Add currency and tax_rate fields to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AED' NOT NULL,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 5 NOT NULL;

-- Add check constraint to ensure valid currencies
ALTER TABLE quotes
ADD CONSTRAINT valid_currency CHECK (currency IN ('AED', 'PKR', 'USD', 'GBP', 'SAR'));

-- Add check constraint to ensure non-negative tax rate
ALTER TABLE quotes
ADD CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100);
