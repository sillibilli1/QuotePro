-- ============================================================================
-- Fix Quotes Schema - Add missing columns
-- ============================================================================
-- This migration adds client_id and line_items JSONB to the quotes table
-- to align with the application code expectations.
-- ============================================================================

-- 1. Add client_id column to quotes table
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- 2. Add line_items JSONB column to quotes table (for storing line items as JSON)
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS line_items JSONB NOT NULL DEFAULT '[]'::JSONB;

-- 3. Create index for client_id lookups
CREATE INDEX IF NOT EXISTS quotes_client_id_idx ON public.quotes (client_id);

-- 4. Update RLS policy for quotes to check client ownership
-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own quotes" ON public.quotes;

-- Recreate insert policy with client_id check
CREATE POLICY "Users can insert own quotes"
ON public.quotes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    client_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = quotes.client_id
        AND clients.user_id = auth.uid()
    )
  )
);

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;

-- Recreate update policy with client_id check
CREATE POLICY "Users can update own quotes"
ON public.quotes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    client_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = quotes.client_id
        AND clients.user_id = auth.uid()
    )
  )
);

-- ============================================================================
-- Optional: Drop separate line_items table if it exists and is no longer needed
-- ============================================================================
-- Uncomment the following lines if you want to drop the separate line_items table
-- and only use the JSONB column in quotes:

-- DROP TABLE IF EXISTS public.line_items CASCADE;

-- ============================================================================
-- Notes:
-- - client_id is nullable to support quotes without assigned clients
-- - line_items JSONB stores the line items directly in the quote record
-- - If you're keeping the separate line_items table for now, you can migrate
--   data from it to the JSONB column before dropping it
-- ============================================================================
