import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Prefer JWT app_metadata — falls back to DB for legacy users
  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  const admin = createAdminClient()
  let sub: { subscription_type: string; org_id: string; is_active: boolean } | null = null

  if (role && orgId) {
    sub = { subscription_type: role, org_id: orgId, is_active: meta.is_active !== false }
  } else {
    const { data } = await admin
      .from('user_subscriptions')
      .select('subscription_type, org_id, is_active')
      .eq('user_email', session.user.email!)
      .maybeSingle()
    sub = data
  }

  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Enforce bus limit ─────────────────────────────────────────────────────
  const [countRes, orgRes] = await Promise.all([
    admin.from('bus_records').select('id', { count: 'exact', head: true }).eq('org_id', sub.org_id),
    admin.from('organizations').select('bus_limit, plan, name').eq('id', sub.org_id).single(),
  ])
  const currentCount = countRes.count ?? 0
  const busLimit     = orgRes.data?.bus_limit ?? null   // null = unlimited

  if (busLimit !== null && currentCount >= busLimit) {
    return NextResponse.json({
      error: `You've reached your free limit of ${busLimit} buses. Upgrade your plan to add more.`,
      code:  'LIMIT_REACHED',
      limit: busLimit,
      count: currentCount,
      plan:  orgRes.data?.plan ?? 'trial',
    }, { status: 402 })
  }
  // ─────────────────────────────────────────────────────────────────────────

  const body = await req.json()
  const { data, error } = await admin.from('bus_records').insert([{
    org_id:                sub.org_id,
    bus_id:                body.bus_id,
    bus_status:            body.bus_status            || 'IS',
    bus_system:            body.bus_system            || null,
    location:              body.location              || null,
    bus_age:               body.bus_age               || null,
    out_of_service_date:   body.out_of_service_date   || null,
    back_in_service_date:  body.back_in_service_date  || null,
    estimated_repair_time: body.estimated_repair_time || null,
    problem_description:   body.problem_description   || null,
    maintenance_comments:  body.maintenance_comments  || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
