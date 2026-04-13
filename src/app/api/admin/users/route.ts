import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

async function requireAdmin(supabase: any, email: string) {
  const { data } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email', email).single()
  return data?.subscription_type === 'Admin'
}

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireAdmin(supabase, session.user.email!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data: subs, error } = await admin.from('user_subscriptions').select('*').order('user_email')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireAdmin(supabase, session.user.email!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const admin = createAdminClient()

  // Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Insert subscription
  const { error: subError } = await admin.from('user_subscriptions').upsert({
    user_email: email,
    subscription_type: role ?? 'Viewer',
    is_active: true,
  }, { onConflict: 'user_email' })

  if (subError) return NextResponse.json({ error: subError.message }, { status: 400 })
  return NextResponse.json({ success: true, email, role: role ?? 'Viewer' }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireAdmin(supabase, session.user.email!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role, is_active } = await req.json()
  const admin = createAdminClient()
  const update: any = {}
  if (role !== undefined) update.subscription_type = role
  if (is_active !== undefined) update.is_active = is_active

  const { error } = await admin.from('user_subscriptions').update(update).eq('user_email', email)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
