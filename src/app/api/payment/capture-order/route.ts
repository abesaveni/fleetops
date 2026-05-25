import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { captureOrder, PLANS } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meta  = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null
  if (!orgId) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { orderID, planId, billingPeriod } = body as {
    orderID: string
    planId: string
    billingPeriod: 'monthly' | 'yearly'
  }

  if (!orderID || !planId || !billingPeriod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Capture the payment with PayPal
  const capture = await captureOrder(orderID)
  if (capture.status !== 'COMPLETED') {
    return NextResponse.json(
      { error: capture.message ?? `Payment not completed (status: ${capture.status})` },
      { status: 422 }
    )
  }

  const transactionId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? orderID

  // Update org plan and bus limit
  const admin = createAdminClient()
  const { error } = await admin
    .from('organizations')
    .update({
      plan:            planId,
      status:          'active',
      bus_limit:       plan.bus_limit,
      plan_period:     billingPeriod,
      plan_started_at: new Date().toISOString(),
      braintree_last_transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  if (error) {
    console.error('Plan update failed after payment:', error)
    return NextResponse.json(
      { error: 'Payment captured but plan update failed. Contact support.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, transactionId, plan: planId, bus_limit: plan.bus_limit })
}
