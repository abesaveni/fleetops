import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

// Shared: get the calling user's subscription from JWT app_metadata or DB fallback
async function getCallerSub(session: { user: { email: string; app_metadata?: Record<string, unknown> } }) {
  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role === 'string' ? meta.role : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  if (role && orgId) {
    return { subscription_type: role, org_id: orgId, is_active: meta.is_active !== false }
  }

  // Legacy fallback: read from DB
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_subscriptions')
    .select('subscription_type, org_id, is_active')
    .eq('user_email', session.user.email)
    .maybeSingle()
  return data
}

export async function GET(_req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getCallerSub(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_subscriptions')
    .select('*')
    .eq('org_id', sub.org_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getCallerSub(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const userRole = role ?? 'Viewer'
  const admin    = createAdminClient()

  // Create auth user with app_metadata so their JWT is pre-stamped
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: userRole, org_id: sub.org_id, is_active: true },
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { error: subError } = await admin.from('user_subscriptions').upsert({
    org_id:            sub.org_id,
    user_email:        email,
    subscription_type: userRole,
    is_active:         true,
  }, { onConflict: 'org_id,user_email' })

  if (subError) return NextResponse.json({ error: subError.message }, { status: 400 })
  return NextResponse.json({ success: true, email, role: userRole }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await getCallerSub(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role, is_active } = await req.json()
  const admin  = createAdminClient()

  // Update subscription table
  const dbUpdate: Record<string, unknown> = {}
  if (role      !== undefined) dbUpdate.subscription_type = role
  if (is_active !== undefined) dbUpdate.is_active = is_active

  const { error } = await admin
    .from('user_subscriptions')
    .update(dbUpdate)
    .eq('user_email', email)
    .eq('org_id', sub.org_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Keep app_metadata in sync so JWT reflects the change on next token refresh
  const { data: userData } = await admin.auth.admin.listUsers()
  const targetUser = userData?.users?.find((u: { email?: string }) => u.email === email)
  if (targetUser) {
    const metaUpdate: Record<string, unknown> = {}
    if (role      !== undefined) metaUpdate.role = role
    if (is_active !== undefined) metaUpdate.is_active = is_active
    await admin.auth.admin.updateUserById(targetUser.id, { app_metadata: metaUpdate })
  }

  return NextResponse.json({ success: true })
}
