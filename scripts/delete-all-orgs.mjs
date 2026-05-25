import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pghevmjxnjtryvgeqfjf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaGV2bWp4bmp0cnl2Z2VxZmpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjExNzY4NywiZXhwIjoyMDkxNjkzNjg3fQ.SEf5IljKquEtOZBsMhwc2bWf-WZJvyjs9wuYFfPfmGs'
const KEEP_EMAIL   = 'abesaveni@gmail.com'

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('--- FleetOps: Delete all organizations ---\n')

  // 1. Delete all organizations (FK cascade removes bus_records + user_subscriptions)
  const { error: orgErr, count } = await admin
    .from('organizations')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete everything

  if (orgErr) { console.error('Error deleting organizations:', orgErr.message); process.exit(1) }
  console.log(`✓ Deleted organizations (rows affected: ${count ?? 'unknown'})`)
  console.log('  └─ bus_records and user_subscriptions cascaded automatically')

  // 2. Delete all auth users except the super admin
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) { console.error('Error listing auth users:', listErr.message); process.exit(1) }

  const toDelete = users.filter(u => u.email !== KEEP_EMAIL)
  console.log(`\n✓ Found ${users.length} auth users — keeping ${KEEP_EMAIL}`)
  console.log(`  └─ Deleting ${toDelete.length} org user(s)…`)

  let deleted = 0
  for (const u of toDelete) {
    const { error } = await admin.auth.admin.deleteUser(u.id)
    if (error) console.warn(`  ⚠ Could not delete ${u.email}: ${error.message}`)
    else { console.log(`  ✓ Deleted ${u.email}`); deleted++ }
  }

  console.log(`\n✓ Done — ${deleted} auth user(s) removed`)
  console.log('  You can now register a fresh organization.\n')
}

run().catch(e => { console.error(e); process.exit(1) })
