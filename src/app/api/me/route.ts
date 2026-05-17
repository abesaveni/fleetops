import { NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = session.user.email!
  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role    === 'string' ? meta.role    : null
  const orgId = typeof meta.org_id  === 'string' ? meta.org_id  : null

  // Fast path: JWT already has role + org_id — one DB call just for org name
  if (role && orgId) {
    if (role === 'super_admin') {
      return NextResponse.json({ email, role, org_id: null, org_name: null }, {
        headers: { 'Cache-Control': 'private, max-age=120' },
      })
    }
    const admin = createAdminClient()
    const { data: org } = await admin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()
    return NextResponse.json({ email, role, org_id: orgId, org_name: org?.name ?? null }, {
      headers: { 'Cache-Control': 'private, max-age=120' },
    })
  }

  // Slow path: legacy user — one joined query
  const admin = createAdminClient()

  const saCheck = await admin.from('super_admins').select('id').eq('email', email).maybeSingle()
  if (saCheck.data) {
    return NextResponse.json({ email, role: 'super_admin', org_id: null, org_name: null }, {
      headers: { 'Cache-Control': 'private, max-age=120' },
    })
  }

  const { data: sub } = await admin
    .from('user_subscriptions')
    .select('subscription_type, org_id, organizations(name)')
    .eq('user_email', email)
    .maybeSingle()

  if (!sub) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

  return NextResponse.json({
    email,
    role:     sub.subscription_type,
    org_id:   sub.org_id,
    org_name: (sub.organizations as any)?.name ?? null,
  }, { headers: { 'Cache-Control': 'private, max-age=120' } })
}
