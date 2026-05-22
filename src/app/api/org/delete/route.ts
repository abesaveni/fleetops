import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'

export async function DELETE(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  if (role !== 'Admin' || !orgId) {
    return NextResponse.json({ error: 'Only organization admins can delete their organization' }, { status: 403 })
  }

  // Require confirmation name in request body
  const body = await req.json().catch(() => null)
  if (!body?.confirmName) {
    return NextResponse.json({ error: 'Missing confirmation' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify org name matches confirmation
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .single()

  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  if (org.name.trim().toLowerCase() !== body.confirmName.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Organization name does not match' }, { status: 422 })
  }

  // Get all users in this org to delete their auth accounts
  const { data: members } = await admin
    .from('user_subscriptions')
    .select('user_email')
    .eq('org_id', orgId)

  // Delete the organization (cascades to bus_records + user_subscriptions via FK)
  const { error: deleteErr } = await admin
    .from('organizations')
    .delete()
    .eq('id', orgId)

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  // Delete all auth users in this org
  if (members && members.length > 0) {
    const { data: authUsers } = await admin.auth.admin.listUsers()
    const orgEmails = new Set(members.map((m: any) => m.user_email))
    const toDelete  = (authUsers?.users ?? []).filter((u: any) => orgEmails.has(u.email))
    await Promise.all(toDelete.map((u: any) => admin.auth.admin.deleteUser(u.id)))
  }

  return NextResponse.json({ success: true })
}
