import { NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { gateway } from '@/lib/braintree'

export async function GET() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up existing Braintree customer ID for this org (enables vaulted payment methods)
  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  let customerId: string | undefined
  if (orgId) {
    const admin = createAdminClient()
    const { data: org } = await admin
      .from('organizations')
      .select('braintree_customer_id')
      .eq('id', orgId)
      .single()
    customerId = org?.braintree_customer_id ?? undefined
  }

  const tokenResponse = await gateway.clientToken.generate(
    customerId ? { customerId } : {}
  )

  return NextResponse.json(
    { token: tokenResponse.clientToken },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
