-- ============================================================================
-- Drop the separate line_items table
-- ============================================================================
-- This migration removes the separate line_items table since we are now
-- storing line items as JSONB in the quotes table.
-- ============================================================================

DROP TABLE IF EXISTS public.line_items CASCADE;
