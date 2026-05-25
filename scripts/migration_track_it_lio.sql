-- ============================================================
-- Track-it-Lio Migration
-- Run this in your Supabase SQL editor (or psql)
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- ── 1. bus_records: add new columns ─────────────────────────
ALTER TABLE bus_records
  ADD COLUMN IF NOT EXISTS manufacturer        TEXT,
  ADD COLUMN IF NOT EXISTS year_of_manufacture TEXT,
  ADD COLUMN IF NOT EXISTS labour_cost         NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS parts_cost          NUMERIC(10,2);

-- ── 2. bus_records: update status constraint ─────────────────
-- Drop old constraint (may differ by name — use DO block to be safe)
DO $$
BEGIN
  ALTER TABLE bus_records DROP CONSTRAINT IF EXISTS bus_records_bus_status_check;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE bus_records
  ADD CONSTRAINT bus_records_bus_status_check
  CHECK (bus_status IN ('IS', 'OOS', 'UR', 'PP', 'RS'));

-- Migrate old status values to new ones
UPDATE bus_records SET bus_status = 'IS'  WHERE bus_status IN ('InService', 'in_service');
UPDATE bus_records SET bus_status = 'OOS' WHERE bus_status IN ('OutOfService', 'out_of_service');
UPDATE bus_records SET bus_status = 'UR'  WHERE bus_status IN ('InProgress', 'in_progress', 'UnderRepair');
UPDATE bus_records SET bus_status = 'PP'  WHERE bus_status IN ('WaitingParts', 'waiting_parts', 'PendingParts');
UPDATE bus_records SET bus_status = 'RS'  WHERE bus_status IN ('ReturnedToService', 'returned_to_service');

-- ── 3. user_subscriptions: update role constraint ────────────
DO $$
BEGIN
  ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_subscription_type_check;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE user_subscriptions
  ADD CONSTRAINT user_subscriptions_subscription_type_check
  CHECK (subscription_type IN ('Admin', 'Dispatch', 'Maintenance', 'ViewOnly'));

-- Migrate old role values
UPDATE user_subscriptions SET subscription_type = 'ViewOnly' WHERE subscription_type IN ('Viewer', 'viewer', 'view_only');
UPDATE user_subscriptions SET subscription_type = 'Admin'    WHERE subscription_type IN ('admin');

-- ── 4. Create work_orders table ───────────────────────────────
CREATE TABLE IF NOT EXISTS work_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bus_record_id         UUID NOT NULL REFERENCES bus_records(id) ON DELETE CASCADE,
  wo_number             TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open','under_repair','pending_parts','completed','closed','returned_to_service')),
  date_out_of_service   DATE,
  problem_description   TEXT,
  asset_location        TEXT,
  bus_system            TEXT,
  estimated_repair_time TEXT,
  back_in_service_date  DATE,
  maintenance_comments  TEXT,
  labour_cost           NUMERIC(10,2),
  parts_cost            NUMERIC(10,2),
  created_by            TEXT,
  assigned_to           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at             TIMESTAMPTZ
);

-- Index for org-scoped queries
CREATE INDEX IF NOT EXISTS work_orders_org_id_idx ON work_orders (org_id);
CREATE INDEX IF NOT EXISTS work_orders_bus_record_id_idx ON work_orders (bus_record_id);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS work_orders_updated_at ON work_orders;
CREATE TRIGGER work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. RLS for work_orders ────────────────────────────────────
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Allow service role (admin client) full access — app uses admin client for all writes
-- Authenticated users can read their own org's work orders via the anon/authenticated role
DROP POLICY IF EXISTS "org_members_select_work_orders" ON work_orders;
CREATE POLICY "org_members_select_work_orders"
  ON work_orders FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM user_subscriptions
      WHERE user_email = auth.email() AND is_active = true
    )
  );

-- ── 6. organizations: ensure plan columns exist ───────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan_period    TEXT CHECK (plan_period IN ('monthly','yearly')),
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;

-- ── Done ──────────────────────────────────────────────────────
