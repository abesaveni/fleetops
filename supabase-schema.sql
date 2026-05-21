-- ============================================================
-- FleetOps SaaS Schema — Multi-Tenant with Manual Onboarding
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS (root tenant entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_email   TEXT NOT NULL,
  plan          TEXT DEFAULT 'basic',
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'payment_failed')),
  bus_limit     INTEGER DEFAULT NULL,
  price_per_bus DECIMAL(10,2) DEFAULT NULL,
  notes         TEXT DEFAULT NULL,
  braintree_customer_id         TEXT DEFAULT NULL,
  braintree_subscription_id     TEXT DEFAULT NULL,
  braintree_last_transaction_id TEXT DEFAULT NULL,
  plan_period     TEXT DEFAULT NULL CHECK (plan_period IN ('monthly', 'yearly')),
  plan_started_at TIMESTAMPTZ DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPER ADMINS (platform owners)
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUS RECORDS (scoped to organization)
-- ============================================================
CREATE TABLE IF NOT EXISTS bus_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bus_id                TEXT NOT NULL,
  bus_status            TEXT DEFAULT 'IS' CHECK (bus_status IN ('IS','OOS','InPro','WP')),
  bus_system            TEXT,
  location              TEXT,
  bus_age               TEXT,
  out_of_service_date   DATE,
  back_in_service_date  DATE,
  estimated_repair_time TEXT,
  problem_description   TEXT,
  maintenance_comments  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, bus_id)
);

-- ============================================================
-- USER SUBSCRIPTIONS (org-level users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_email        TEXT NOT NULL,
  subscription_type TEXT DEFAULT 'Viewer' CHECK (subscription_type IN ('Admin','Viewer')),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_email)
);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bus_records_updated_at ON bus_records;
CREATE TRIGGER trg_bus_records_updated_at
  BEFORE UPDATE ON bus_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_orgs"        ON organizations;
DROP POLICY IF EXISTS "user_view_own_org"   ON organizations;
DROP POLICY IF EXISTS "service_buses"       ON bus_records;
DROP POLICY IF EXISTS "user_view_org_buses" ON bus_records;
DROP POLICY IF EXISTS "admin_manage_buses"  ON bus_records;
DROP POLICY IF EXISTS "service_subs"        ON user_subscriptions;
DROP POLICY IF EXISTS "user_view_own_sub"   ON user_subscriptions;
DROP POLICY IF EXISTS "service_sa"          ON super_admins;
DROP POLICY IF EXISTS "sa_view_own"         ON super_admins;

-- Organizations: service role full access; users see their own org
CREATE POLICY "service_orgs" ON organizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_own_org" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    id IN (
      SELECT org_id FROM user_subscriptions
      WHERE user_email = auth.email() AND is_active = true
    )
  );

-- Bus records: service role full; org members read; org admins write
CREATE POLICY "service_buses" ON bus_records
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_org_buses" ON bus_records
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    org_id IN (
      SELECT org_id FROM user_subscriptions
      WHERE user_email = auth.email() AND is_active = true
    )
  );

CREATE POLICY "admin_manage_buses" ON bus_records
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    org_id IN (
      SELECT org_id FROM user_subscriptions
      WHERE user_email = auth.email()
        AND subscription_type = 'Admin'
        AND is_active = true
    )
  );

-- User subscriptions: service role full; users see their own row
CREATE POLICY "service_subs" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_own_sub" ON user_subscriptions
  FOR SELECT USING (user_email = auth.email());

-- Super admins: service role full; SA sees their own row
CREATE POLICY "service_sa" ON super_admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "sa_view_own" ON super_admins
  FOR SELECT USING (email = auth.email());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bus_records_org_id ON bus_records(org_id);
CREATE INDEX IF NOT EXISTS idx_bus_records_status  ON bus_records(bus_status);
CREATE INDEX IF NOT EXISTS idx_user_subs_email     ON user_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_subs_org_id    ON user_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email  ON super_admins(email);

-- ============================================================
-- SEED: Super Admin registration
-- Run this after creating your Supabase auth user:
--   1. Sign up at /login with your email
--   2. Get your user UUID from Supabase Auth dashboard
--   3. Uncomment and run the insert below
-- ============================================================
-- INSERT INTO super_admins (user_id, email)
-- VALUES ('YOUR-SUPABASE-USER-UUID', 'abesaveni@gmail.com')
-- ON CONFLICT (email) DO NOTHING;
