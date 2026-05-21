import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/organizations'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firstName, lastName, email, password, orgName, state, fleetSize, phone } = body

  if (!email || !password || !orgName || !firstName || !lastName) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check if email already has a subscription (org already exists for this user)
  const { data: existingSub } = await admin
    .from('user_subscriptions')
    .select('id')
    .eq('user_email', email.toLowerCase())
    .maybeSingle()

  if (existingSub) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  // Create the auth user — app_metadata is embedded in the JWT so middleware
  // can read role/org_id without any DB query on every navigation.
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
    app_metadata:  { role: 'Admin', is_active: true },  // org_id stamped after org creation
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authData.user.id

  // Build a unique org slug
  let slug = generateSlug(orgName)
  const { data: existing } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (existing) slug = `${slug}-${Date.now()}`

  // Create the organization (trial status)
  const notes = [state && `State: ${state}`, fleetSize && `Fleet size: ${fleetSize}`, phone && `Phone: ${phone}`]
    .filter(Boolean).join(' | ')

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name:        orgName.trim(),
      slug,
      owner_email: email.toLowerCase(),
      plan:        'trial',
      status:      'trial',
      bus_limit:   5,          // 5 buses free on Starter plan
      notes:       notes || null,
    })
    .select()
    .single()

  if (orgError) {
    // Roll back auth user to avoid orphans
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Failed to create organization. Please try again.' }, { status: 500 })
  }

  // Create Admin subscription
  const { error: subError } = await admin
    .from('user_subscriptions')
    .insert({
      org_id:            org.id,
      user_email:        email.toLowerCase(),
      subscription_type: 'Admin',
      is_active:         true,
    })

  if (subError) {
    await admin.auth.admin.deleteUser(userId)
    await admin.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: 'Failed to set up account permissions. Please try again.' }, { status: 500 })
  }

  // Stamp org_id into app_metadata now that we have it — JWT will carry it on next sign-in
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'Admin', org_id: org.id, is_active: true },
  })

  return NextResponse.json({ success: true, orgId: org.id }, { status: 201 })
}
