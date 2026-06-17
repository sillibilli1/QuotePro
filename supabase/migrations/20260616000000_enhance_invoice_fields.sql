-- Add TRN field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trn TEXT,
ADD COLUMN IF NOT EXISTS bank_details_structured JSONB;

-- Add invoice-specific fields to quotes table (used for invoices)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_invoice BOOLEAN DEFAULT FALSE;

-- Create index for invoice lookups
CREATE INDEX IF NOT EXISTS idx_quotes_invoice_number ON quotes(invoice_number) WHERE is_invoice = TRUE;

-- Add TRN field to clients table for B2B clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS trn TEXT;
