-- ============================================================
-- FleetOps Migration: Add multi-tenant SaaS tables
-- Safe to run on existing data — backfills org_id automatically
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_email   TEXT NOT NULL,
  plan          TEXT DEFAULT 'basic',
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  bus_limit     INTEGER DEFAULT NULL,
  price_per_bus DECIMAL(10,2) DEFAULT NULL,
  notes         TEXT DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seed a default org for all existing data
INSERT INTO organizations (name, slug, owner_email, plan, status)
VALUES ('My Fleet', 'my-fleet', 'abesaveni@gmail.com', 'professional', 'active')
ON CONFLICT (slug) DO NOTHING;

-- 5. Add org_id to bus_records (nullable first so existing rows don't break)
ALTER TABLE bus_records ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 6. Add org_id to user_subscriptions (nullable first)
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 7. Backfill org_id for all existing rows
UPDATE bus_records
SET org_id = (SELECT id FROM organizations WHERE slug = 'my-fleet')
WHERE org_id IS NULL;

UPDATE user_subscriptions
SET org_id = (SELECT id FROM organizations WHERE slug = 'my-fleet')
WHERE org_id IS NULL;

-- 8. Now enforce NOT NULL
ALTER TABLE bus_records ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE user_subscriptions ALTER COLUMN org_id SET NOT NULL;

-- 9. Drop old single-column unique constraints if they exist
ALTER TABLE bus_records DROP CONSTRAINT IF EXISTS bus_records_bus_id_key;
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_email_key;

-- 10. Add composite unique constraints
DO $$ BEGIN
  ALTER TABLE bus_records ADD CONSTRAINT bus_records_org_bus_unique UNIQUE (org_id, bus_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE user_subscriptions ADD CONSTRAINT user_subs_org_email_unique UNIQUE (org_id, user_email);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 11. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bus_records_updated_at ON bus_records;
CREATE TRIGGER trg_bus_records_updated_at
  BEFORE UPDATE ON bus_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 12. Enable RLS on all tables
ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins       ENABLE ROW LEVEL SECURITY;

-- 13. Drop old policies
DROP POLICY IF EXISTS "Allow authenticated users to read their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Allow admins to manage subscriptions"                    ON user_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated users to read bus records"           ON bus_records;
DROP POLICY IF EXISTS "Allow admins to manage bus records"                      ON bus_records;
DROP POLICY IF EXISTS "service_orgs"        ON organizations;
DROP POLICY IF EXISTS "user_view_own_org"   ON organizations;
DROP POLICY IF EXISTS "service_buses"       ON bus_records;
DROP POLICY IF EXISTS "user_view_org_buses" ON bus_records;
DROP POLICY IF EXISTS "admin_manage_buses"  ON bus_records;
DROP POLICY IF EXISTS "service_subs"        ON user_subscriptions;
DROP POLICY IF EXISTS "user_view_own_sub"   ON user_subscriptions;
DROP POLICY IF EXISTS "service_sa"          ON super_admins;
DROP POLICY IF EXISTS "sa_view_own"         ON super_admins;

-- 14. New RLS policies
-- Organizations
CREATE POLICY "service_orgs" ON organizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_own_org" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    id IN (SELECT org_id FROM user_subscriptions WHERE user_email = auth.email() AND is_active = true)
  );

-- Bus records
CREATE POLICY "service_buses" ON bus_records
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_org_buses" ON bus_records
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    org_id IN (SELECT org_id FROM user_subscriptions WHERE user_email = auth.email() AND is_active = true)
  );

CREATE POLICY "admin_manage_buses" ON bus_records
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    org_id IN (
      SELECT org_id FROM user_subscriptions
      WHERE user_email = auth.email() AND subscription_type = 'Admin' AND is_active = true
    )
  );

-- User subscriptions
CREATE POLICY "service_subs" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_view_own_sub" ON user_subscriptions
  FOR SELECT USING (user_email = auth.email());

-- Super admins
CREATE POLICY "service_sa" ON super_admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "sa_view_own" ON super_admins
  FOR SELECT USING (email = auth.email());

-- 15. Indexes
CREATE INDEX IF NOT EXISTS idx_bus_records_org_id ON bus_records(org_id);
CREATE INDEX IF NOT EXISTS idx_bus_records_status  ON bus_records(bus_status);
CREATE INDEX IF NOT EXISTS idx_user_subs_email     ON user_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_subs_org_id    ON user_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email  ON super_admins(email);

-- 16. Insert Super Admin record for abesaveni@gmail.com
INSERT INTO super_admins (user_id, email)
VALUES ('60e3da82-ee60-448f-8d91-4ae43af84aa2', 'abesaveni@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Done! Your super admin login: abesaveni@gmail.com

-- ============================================================
-- Self-Onboarding Migration (run after initial migration)
-- ============================================================

-- Allow the service role to INSERT organizations during self-signup
-- (already covered by the "service_orgs" FOR ALL policy above)

-- Allow newly self-signed-up orgs to be on 'trial' plan (already in CHECK constraint)
-- No schema changes needed — the onboarding API uses the service role client
-- which bypasses RLS, so self-signup works without additional policies.

-- Optional: add phone to organizations notes column (already TEXT, no change needed)

-- View to help Super Admins see self-onboarded (trial) orgs
CREATE OR REPLACE VIEW trial_organizations AS
  SELECT id, name, slug, owner_email, plan, status, notes, created_at
  FROM organizations
  WHERE status = 'trial'
  ORDER BY created_at DESC;
