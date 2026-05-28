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

function makeWONumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `WO-${date}-${rand}`
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

  // Get current bus state so we can detect workflow transitions
  const { data: currentBus } = await admin
    .from('bus_records')
    .select('out_of_service_date, back_in_service_date, bus_status')
    .eq('id', params.id)
    .eq('org_id', sub.org_id)
    .single()

  if (!currentBus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 })

  const settingOOS = !!(body.out_of_service_date && !currentBus.out_of_service_date)
  // BIS triggers any time the date is provided — close block is idempotent (finds open WO or skips)
  const settingBIS = !!body.back_in_service_date

  // Workflow-driven status — BIS always wins; OOS on first report; otherwise use maintenance's manual selection
  let bus_status = (body.bus_status as string) || currentBus.bus_status
  if (settingOOS && !settingBIS) bus_status = 'OOS'
  if (settingBIS) bus_status = 'IS'

  const { data, error } = await admin
    .from('bus_records')
    .update({
      bus_id:                body.bus_id               || undefined,
      bus_status,
      manufacturer:          body.manufacturer          ?? null,
      year_of_manufacture:   body.year_of_manufacture   || null,
      bus_system:            body.bus_system            || null,
      location:              body.location              || null,
      bus_age:               body.bus_age               || null,
      out_of_service_date:   body.out_of_service_date   || null,
      back_in_service_date:  body.back_in_service_date  || null,
      estimated_repair_time: body.estimated_repair_time || null,
      problem_description:   body.problem_description   || null,
      maintenance_comments:  body.maintenance_comments  || null,
      labour_cost:           body.labour_cost           ?? null,
      parts_cost:            body.parts_cost            ?? null,
    })
    .eq('id', params.id)
    .eq('org_id', sub.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // ── Work Order: auto-create when Dispatch sets Date Out of Service ──────
  if (settingOOS) {
    const { data: existingWO } = await admin
      .from('work_orders')
      .select('id')
      .eq('bus_record_id', params.id)
      .in('status', ['open', 'under_repair', 'pending_parts'])
      .maybeSingle()

    if (!existingWO) {
      await admin.from('work_orders').insert({
        org_id:                sub.org_id,
        bus_record_id:         params.id,
        wo_number:             makeWONumber(),
        status:                'open',
        date_out_of_service:   body.out_of_service_date,
        problem_description:   body.problem_description   || null,
        asset_location:        body.location              || null,
        bus_system:            body.bus_system            || null,
        estimated_repair_time: body.estimated_repair_time || null,
        labour_cost:           body.labour_cost           ?? null,
        parts_cost:            body.parts_cost            ?? null,
        maintenance_comments:  body.maintenance_comments  || null,
        created_by:            session.user.email,
      })
    }
  }

  // ── Work Order: auto-close when Maintenance sets Back in Service Date ───
  if (settingBIS) {
    const { data: openWO } = await admin
      .from('work_orders')
      .select('id')
      .eq('bus_record_id', params.id)
      .in('status', ['open', 'under_repair', 'pending_parts'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (openWO) {
      await admin.from('work_orders').update({
        status:                'closed',
        back_in_service_date:  body.back_in_service_date,
        bus_system:            body.bus_system            || null,
        estimated_repair_time: body.estimated_repair_time || null,
        maintenance_comments:  body.maintenance_comments  || null,
        labour_cost:           body.labour_cost           ?? null,
        parts_cost:            body.parts_cost            ?? null,
        closed_at:             new Date().toISOString(),
      }).eq('id', openWO.id)
    }
  }

  // ── Work Order: sync maintenance fields to open WO on every save ─────────
  // Handles the case where Maintenance updates fields without setting BIS date yet
  if (!settingOOS && !settingBIS) {
    const { data: openWO } = await admin
      .from('work_orders')
      .select('id')
      .eq('bus_record_id', params.id)
      .in('status', ['open', 'under_repair', 'pending_parts'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (openWO) {
      const sync: Record<string, unknown> = {}
      if (body.bus_system            != null) sync.bus_system            = body.bus_system            || null
      if (body.estimated_repair_time != null) sync.estimated_repair_time = body.estimated_repair_time || null
      if (body.back_in_service_date  != null) sync.back_in_service_date  = body.back_in_service_date  || null
      if (body.labour_cost           != null) sync.labour_cost           = body.labour_cost
      if (body.parts_cost            != null) sync.parts_cost            = body.parts_cost
      if (body.maintenance_comments  != null) sync.maintenance_comments  = body.maintenance_comments  || null
      if (body.location              != null) sync.asset_location        = body.location              || null
      if (body.problem_description   != null) sync.problem_description   = body.problem_description   || null
      if (Object.keys(sync).length > 0) {
        await admin.from('work_orders').update(sync).eq('id', openWO.id)
      }
    }
  }

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
