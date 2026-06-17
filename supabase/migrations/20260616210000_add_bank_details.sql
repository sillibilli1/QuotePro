-- Add bank_details column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_details TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.bank_details IS 'Bank details for invoice generation (Bank Name, IBAN, Swift Code, etc.)';
