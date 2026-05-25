import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'

export async function GET(_req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('work_orders')
    .select('*, bus:bus_records(bus_id, manufacturer)')
    .eq('org_id', sub.org_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const admin = createAdminClient()

  // Auto-generate WO number: WO-YYYYMMDD-XXXX
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand  = Math.floor(1000 + Math.random() * 9000)
  const wo_number = `WO-${date}-${rand}`

  const { data, error } = await admin.from('work_orders').insert([{
    org_id:                sub.org_id,
    bus_record_id:         body.bus_record_id,
    wo_number,
    status:                body.status                ?? 'open',
    date_out_of_service:   body.date_out_of_service   || null,
    problem_description:   body.problem_description   || null,
    asset_location:        body.asset_location        || null,
    bus_system:            body.bus_system            || null,
    estimated_repair_time: body.estimated_repair_time || null,
    back_in_service_date:  body.back_in_service_date  || null,
    maintenance_comments:  body.maintenance_comments  || null,
    labour_cost:           body.labour_cost           ?? null,
    parts_cost:            body.parts_cost            ?? null,
    created_by:            session.user.email,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body  = await req.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  const allowed = ['status', 'bus_system', 'asset_location', 'estimated_repair_time',
    'back_in_service_date', 'maintenance_comments', 'labour_cost', 'parts_cost', 'closed_at', 'assigned_to']
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await admin
    .from('work_orders')
    .update(update)
    .eq('id', body.id)
    .eq('org_id', sub.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
