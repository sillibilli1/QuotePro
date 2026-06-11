-- Run this script in your Supabase SQL Editor or local database
-- This adds the pdf_mode column to the quotes table

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS pdf_mode TEXT NOT NULL DEFAULT 'bilingual';

UPDATE public.quotes
SET pdf_mode = COALESCE(pdf_mode, 'bilingual')
WHERE pdf_mode IS NULL;

DO $$
BEGIN
  ALTER TABLE public.quotes
    ADD CONSTRAINT quotes_pdf_mode_check
    CHECK (pdf_mode IN ('bilingual', 'english_only'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
