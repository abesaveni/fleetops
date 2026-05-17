import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/organizations'

async function requireSuperAdmin(email: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('super_admins')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return !!data
}

export async function GET(_req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireSuperAdmin(session.user.email!))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: orgs, error } = await admin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Attach bus count per org
  const orgsWithCounts = await Promise.all(
    (orgs ?? []).map(async (org: any) => {
      const { count } = await admin
        .from('bus_records')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id)
      return { ...org, bus_count: count ?? 0 }
    })
  )

  return NextResponse.json(orgsWithCounts)
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await requireSuperAdmin(session.user.email!))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { org_name, admin_email, admin_password, plan, notes } = await req.json()
  if (!org_name || !admin_email || !admin_password) {
    return NextResponse.json({ error: 'org_name, admin_email, and admin_password are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const slug  = generateSlug(org_name)

  // Create organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name:        org_name,
      slug:        slug,
      owner_email: admin_email,
      plan:        plan ?? 'basic',
      status:      'active',
      notes:       notes ?? null,
    })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

  // Create Supabase auth user
  const { error: authError } = await admin.auth.admin.createUser({
    email:         admin_email,
    password:      admin_password,
    email_confirm: true,
  })
  if (authError && !authError.message.includes('already been registered')) {
    // If user already exists, that's ok — just update their subscription
    if (!authError.message.includes('already registered')) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
  }

  // Create user subscription (org admin)
  const { error: subError } = await admin.from('user_subscriptions').upsert({
    org_id:            org.id,
    user_email:        admin_email,
    subscription_type: 'Admin',
    is_active:         true,
  }, { onConflict: 'org_id,user_email' })

  if (subError) return NextResponse.json({ error: subError.message }, { status: 400 })

  return NextResponse.json({ success: true, org }, { status: 201 })
}
