-- ============================================================================
-- Create quotes-pdfs storage bucket
-- ============================================================================
-- This migration creates the quotes-pdfs bucket for storing generated PDF files
-- and makes it publicly accessible so WhatsApp share links will work.
-- ============================================================================

-- 1. Create the quotes-pdfs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes-pdfs', 'quotes-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the quotes-pdfs bucket

-- Allow authenticated users to upload their own PDFs
CREATE POLICY "Users can upload their own quote PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quotes-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own PDFs
CREATE POLICY "Users can update their own quote PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'quotes-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'quotes-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "Users can delete their own quote PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'quotes-pdfs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all PDFs (for WhatsApp sharing)
CREATE POLICY "Public read access to quote PDFs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'quotes-pdfs');
