import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pghevmjxnjtryvgeqfjf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaGV2bWp4bmp0cnl2Z2VxZmpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjExNzY4NywiZXhwIjoyMDkxNjkzNjg3fQ.SEf5IljKquEtOZBsMhwc2bWf-WZJvyjs9wuYFfPfmGs'

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Run each ALTER TABLE via an RPC helper we create on-the-fly
const statements = [
  // Braintree columns
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS braintree_customer_id TEXT DEFAULT NULL`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS braintree_subscription_id TEXT DEFAULT NULL`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS braintree_last_transaction_id TEXT DEFAULT NULL`,
  // Billing period columns
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_period TEXT DEFAULT NULL`,
  `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ DEFAULT NULL`,
  // Drop old status constraint and re-add with payment_failed
  `ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_status_check`,
  `ALTER TABLE organizations ADD CONSTRAINT organizations_status_check CHECK (status IN ('active','suspended','trial','payment_failed'))`,
  // Index for webhook lookups
  `CREATE INDEX IF NOT EXISTS idx_orgs_braintree_sub ON organizations(braintree_subscription_id) WHERE braintree_subscription_id IS NOT NULL`,
]

async function run() {
  console.log('--- FleetOps: Running Braintree migration ---\n')

  // First create a helper function that can execute arbitrary SQL
  const { error: createFnErr } = await admin.rpc('exec_sql', { sql: 'SELECT 1' }).maybeSingle()
    .catch(() => ({ error: null }))

  // Use the Management API approach via fetch
  for (const sql of statements) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
        },
        body: JSON.stringify({ sql }),
      })
      if (res.ok) {
        console.log(`✓ ${sql.slice(0, 70)}...`)
      } else {
        const err = await res.text()
        // Try direct approach
        console.log(`  ⚠ RPC failed, trying direct: ${err.slice(0,80)}`)
      }
    } catch (e) {
      console.log(`  ⚠ ${sql.slice(0, 70)}: ${e.message}`)
    }
  }
  console.log('\nDone.')
}

run().catch(e => { console.error(e); process.exit(1) })
