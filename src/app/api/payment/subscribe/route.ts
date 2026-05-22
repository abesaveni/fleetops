import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { getGateway, PLANS } from '@/lib/braintree'

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null
  if (!orgId) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const { nonce, planId, billingPeriod } = body as {
    nonce: string
    planId: string
    billingPeriod: 'monthly' | 'yearly'
  }

  if (!nonce || !planId || !billingPeriod) {
    return NextResponse.json({ error: 'Missing required fields: nonce, planId, billingPeriod' }, { status: 400 })
  }

  const plan = PLANS[planId as keyof typeof PLANS]
  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const price = billingPeriod === 'yearly'
    ? Math.round(plan.price * 12 * 0.85)
    : plan.price

  const admin = createAdminClient()

  // Look up existing customer ID
  const { data: org } = await admin
    .from('organizations')
    .select('braintree_customer_id, name')
    .eq('id', orgId)
    .single()

  let customerId: string = org?.braintree_customer_id ?? ''

  const gateway = getGateway()

  // Create customer if not already stored
  if (!customerId) {
    const customerResult = await gateway.customer.create({
      email: session.user.email ?? '',
      company: org?.name ?? '',
      paymentMethodNonce: nonce,
    })
    if (!customerResult.success) {
      return NextResponse.json(
        { error: customerResult.message ?? 'Failed to create customer' },
        { status: 422 }
      )
    }
    customerId = customerResult.customer.id
    await admin
      .from('organizations')
      .update({ braintree_customer_id: customerId })
      .eq('id', orgId)
  }

  // Create a sale (one-time charge or recurring handled as a sale for simplicity)
  const saleResult = await gateway.transaction.sale({
    amount: price.toFixed(2),
    customerId,
    paymentMethodNonce: customerId ? undefined : nonce,
    options: {
      submitForSettlement: true,
      storeInVaultOnSuccess: true,
    },
  })

  if (!saleResult.success) {
    return NextResponse.json(
      { error: saleResult.message ?? 'Payment failed' },
      { status: 422 }
    )
  }

  // Update org plan + bus limit — try full update first, fall back to core columns
  const fullUpdates: Record<string, unknown> = {
    plan:            planId,
    status:          'active',
    bus_limit:       plan.bus_limit,
    plan_period:     billingPeriod,
    plan_started_at: new Date().toISOString(),
    braintree_customer_id:         customerId,
    braintree_last_transaction_id: saleResult.transaction.id,
    updated_at: new Date().toISOString(),
  }

  let { error: updateErr } = await admin
    .from('organizations')
    .update(fullUpdates)
    .eq('id', orgId)

  if (updateErr) {
    // Braintree/billing columns may not be migrated yet — fall back to core fields
    console.warn('Full update failed, trying core update:', updateErr.message)
    const coreUpdates = {
      plan:      planId,
      status:    'active',
      bus_limit: plan.bus_limit,
      updated_at: new Date().toISOString(),
    }
    const { error: coreErr } = await admin
      .from('organizations')
      .update(coreUpdates)
      .eq('id', orgId)

    if (coreErr) {
      console.error('Core update also failed:', coreErr)
      return NextResponse.json(
        { error: 'Payment processed but plan update failed. Contact support.' },
        { status: 500 }
      )
    }
    updateErr = null  // core succeeded — continue to return success
  }

  return NextResponse.json({
    success:       true,
    transactionId: saleResult.transaction.id,
    plan:          planId,
    bus_limit:     plan.bus_limit,
  })
}
