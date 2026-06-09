-- Append to Day 7 migration: RPC function for atomic bonus quote increment
-- This avoids read-modify-write race conditions.

CREATE OR REPLACE FUNCTION increment_bonus_quotes(p_user_id UUID, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET bonus_quotes = bonus_quotes + p_amount
  WHERE id = p_user_id;
END;
$$;
