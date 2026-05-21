import { NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = session.user.email!
  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null
  const admin = createAdminClient()

  if (role === 'super_admin') {
    return NextResponse.json(
      { email, role, org_id: null, org_name: null, plan: null, bus_limit: null, bus_count: null },
      { headers: { 'Cache-Control': 'private, max-age=120' } },
    )
  }

  // Fast path — org_id in JWT: one joined org query + one count query in parallel
  if (role && orgId) {
    const [orgRes, countRes] = await Promise.all([
      admin.from('organizations').select('name, plan, bus_limit').eq('id', orgId).single(),
      admin.from('bus_records').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    ])
    return NextResponse.json({
      email,
      role,
      org_id:    orgId,
      org_name:  orgRes.data?.name      ?? null,
      plan:      orgRes.data?.plan      ?? 'trial',
      bus_limit: orgRes.data?.bus_limit ?? null,
      bus_count: countRes.count         ?? 0,
    }, { headers: { 'Cache-Control': 'private, max-age=30' } })
  }

  // Slow path — legacy user without app_metadata
  const saRes = await admin.from('super_admins').select('id').eq('email', email).maybeSingle()
  if (saRes.data) {
    return NextResponse.json(
      { email, role: 'super_admin', org_id: null, org_name: null, plan: null, bus_limit: null, bus_count: null },
      { headers: { 'Cache-Control': 'private, max-age=120' } },
    )
  }

  const { data: sub } = await admin
    .from('user_subscriptions')
    .select('subscription_type, org_id, organizations(name, plan, bus_limit)')
    .eq('user_email', email)
    .maybeSingle()

  if (!sub) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

  const org       = (sub.organizations as any) ?? {}
  const legacyOId = sub.org_id
  const { count } = await admin.from('bus_records').select('id', { count: 'exact', head: true }).eq('org_id', legacyOId)

  return NextResponse.json({
    email,
    role:      sub.subscription_type,
    org_id:    legacyOId,
    org_name:  org.name      ?? null,
    plan:      org.plan      ?? 'trial',
    bus_limit: org.bus_limit ?? null,
    bus_count: count         ?? 0,
  }, { headers: { 'Cache-Control': 'private, max-age=30' } })
}
