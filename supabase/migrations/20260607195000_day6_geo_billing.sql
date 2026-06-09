-- Day 6: Geo Infrastructure + Stripe Billing
-- Adds country_code, currency_code to profiles
-- Adds stripe_subscription_id for webhook handling

-- 1. Add geo columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country_code  TEXT NOT NULL DEFAULT 'AE',
  ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'AED';

-- 2. Add stripe subscription ID (customer ID already exists from day-1 if not, add it)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT;

-- 3. Index for geo-based queries (e.g., analytics, pricing lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON profiles (country_code);

-- 4. Map existing rows: leave as AE/AED (safe default)
-- New signups will be updated by middleware on first authenticated request.

-- 5. Ensure plan column exists (may have been added in earlier migration)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT;
