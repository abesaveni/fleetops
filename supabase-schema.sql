CREATE TABLE IF NOT EXISTS bus_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id text NOT NULL UNIQUE,
  bus_status text NOT NULL DEFAULT 'IS' CHECK (bus_status IN ('IS','OOS','InPro','WP')),
  bus_system text, location text, bus_age text,
  out_of_service_date date, back_in_service_date date,
  estimated_repair_time text, problem_description text, maintenance_comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS bus_records_updated_at ON bus_records;
CREATE TRIGGER bus_records_updated_at BEFORE UPDATE ON bus_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL UNIQUE,
  subscription_type text NOT NULL DEFAULT 'Viewer' CHECK (subscription_type IN ('Admin','Viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read buses" ON bus_records;
DROP POLICY IF EXISTS "Admins can write buses" ON bus_records;
DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role manages subscriptions" ON user_subscriptions;

CREATE POLICY "Authenticated users can read buses" ON bus_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can write buses" ON bus_records FOR ALL USING (EXISTS (SELECT 1 FROM user_subscriptions WHERE user_email = auth.email() AND subscription_type = 'Admin' AND is_active = true));
CREATE POLICY "Users can read own subscription" ON user_subscriptions FOR SELECT USING (user_email = auth.email());
CREATE POLICY "Service role manages subscriptions" ON user_subscriptions FOR ALL USING (auth.role() = 'service_role');

INSERT INTO bus_records (bus_id, bus_status, bus_system, location, bus_age) VALUES
  ('BUS-001','IS','Route A','Depot 1','3 years'),
  ('BUS-002','OOS','Route B','Workshop','7 years'),
  ('BUS-003','InPro','Route C','Bay 3','5 years'),
  ('BUS-004','WP','Route D','Depot 2','1 year'),
  ('BUS-005','IS','Route A','Depot 1','2 years')
ON CONFLICT DO NOTHING;

INSERT INTO user_subscriptions (user_email, subscription_type, is_active)
VALUES ('abesaveni@gmail.com', 'Admin', true)
ON CONFLICT (user_email) DO UPDATE SET subscription_type = 'Admin', is_active = true;
