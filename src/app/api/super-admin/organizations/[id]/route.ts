import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

async function requireSuperAdmin(email: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('super_admins')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return !!data
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireSuperAdmin(session.user.email!))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body  = await req.json()
  const admin = createAdminClient()
  const update: Record<string, unknown> = {}
  if (body.status    !== undefined) update.status    = body.status
  if (body.plan      !== undefined) update.plan      = body.plan
  if (body.notes     !== undefined) update.notes     = body.notes
  if (body.bus_limit !== undefined) update.bus_limit = body.bus_limit

  const { data, error } = await admin
    .from('organizations')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireSuperAdmin(session.user.email!))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('organizations').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
