import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

async function getCallerSub(user: { email: string; app_metadata?: Record<string, unknown> }) {
  const meta  = (user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  if (role && orgId) {
    return { subscription_type: role, org_id: orgId, is_active: meta.is_active !== false }
  }
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_subscriptions')
    .select('subscription_type, org_id, is_active')
    .eq('user_email', user.email)
    .maybeSingle()
  return data
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getCallerSub(session.user as any)
  if (!sub || !sub.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body  = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('bus_records')
    .update({
      bus_status:            body.bus_status,
      bus_system:            body.bus_system            || null,
      location:              body.location              || null,
      bus_age:               body.bus_age               || null,
      out_of_service_date:   body.out_of_service_date   || null,
      back_in_service_date:  body.back_in_service_date  || null,
      estimated_repair_time: body.estimated_repair_time || null,
      problem_description:   body.problem_description   || null,
      maintenance_comments:  body.maintenance_comments  || null,
    })
    .eq('id', params.id)
    .eq('org_id', sub.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getCallerSub(session.user as any)
  if (!sub || !sub.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('bus_records')
    .delete()
    .eq('id', params.id)
    .eq('org_id', sub.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
