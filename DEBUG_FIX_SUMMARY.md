# 500 Error Fix for GET /api/quotes/[id]

## Root Cause
The `pdf_mode` column was added to the database schema in migration `20260608210000_fix_quotes_schema.sql`, but the migration was not applied to the local/production database. This caused the API to fail when trying to select the `pdf_mode` column.

## Fixes Applied

### 1. API Route Protection ([`app/api/quotes/[id]/route.ts`](app/api/quotes/[id]/route.ts))
- **Line 91**: Added fallback `pdf_mode: row.pdf_mode ?? 'bilingual'` to handle null/undefined values
- **Line 129**: Added console.error logging to capture database errors for debugging
- **Lines 7-13**: Updated TypeScript type to make `pdf_mode` optional to prevent type errors

### 2. Migration Script
Created [`apply_pdf_mode_migration.sql`](apply_pdf_mode_migration.sql) for easy application to your database.

## Steps to Complete the Fix

### Option A: Apply Migration via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `apply_pdf_mode_migration.sql`
4. Run the SQL script
5. Test the endpoint: GET `/api/quotes/[id]`

### Option B: Apply Migration via Supabase CLI (if Docker is running)
```bash
# Start Docker Desktop first, then:
npx supabase start
npx supabase db reset
```

### Option C: Manual Database Update
If the column already exists but has NULL values:
```sql
UPDATE public.quotes SET pdf_mode = 'bilingual' WHERE pdf_mode IS NULL;
```

## Verification
After applying the migration:
1. The API should return 200 OK status
2. Check server console - no database errors should appear
3. The response JSON should include `"pdf_mode": "bilingual"` or `"pdf_mode": "english_only"`
4. Older quotes will default to `"bilingual"` mode

## Changes Summary
- ✅ API now handles missing `pdf_mode` gracefully with fallback to 'bilingual'
- ✅ Added error logging for easier debugging
- ✅ Type definitions updated to prevent TypeScript errors
- ✅ Migration script ready to apply
