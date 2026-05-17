import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import type { BusStatus } from '@/types'

const VALID_STATUSES: BusStatus[] = ['IS', 'OOS', 'InPro', 'WP']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  let sub: { org_id: string; is_active: boolean } | null = null
  if (role && orgId) {
    sub = { org_id: orgId, is_active: meta.is_active !== false }
  } else {
    const admin = createAdminClient()
    const { data } = await admin
      .from('user_subscriptions')
      .select('org_id, is_active')
      .eq('user_email', session.user.email!)
      .maybeSingle()
    sub = data
  }

  if (!sub || !sub.is_active) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { bus_status } = body

  if (!VALID_STATUSES.includes(bus_status)) {
    return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('bus_records')
    .update({ bus_status })
    .eq('id', params.id)
    .eq('org_id', sub.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
