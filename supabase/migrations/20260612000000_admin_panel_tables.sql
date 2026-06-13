-- Admin Panel Tables Migration

-- 1. Manual Payment Requests Table
CREATE TABLE IF NOT EXISTS manual_payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  notes TEXT
);

CREATE INDEX idx_manual_payment_status ON manual_payment_requests(status);
CREATE INDEX idx_manual_payment_user ON manual_payment_requests(user_id);

-- 2. Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_type ON admin_logs(event_type);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- 3. Add flagged column to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;
