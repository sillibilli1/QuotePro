-- Day 7: Referral system
-- Adds referral_code, referred_by, and bonus_quotes to profiles

-- 1. Referral code — unique per user, auto-generated UUID
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- 2. Who referred this user (nullable — NULL means organic signup)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Bonus quotes earned through referrals
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bonus_quotes INTEGER NOT NULL DEFAULT 0;

-- 4. Back-fill referral_code for existing rows that have NULL
UPDATE profiles
  SET referral_code = gen_random_uuid()::text
  WHERE referral_code IS NULL;

-- 5. Index for fast lookup when someone uses a referral link
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles (referral_code);

-- 6. Index for looking up who referred a user
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles (referred_by);
