import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const eventType = body.event_type as string | undefined
  const resource  = body.resource as Record<string, unknown> | undefined

  if (!eventType) return NextResponse.json({ received: true })

  const admin = createAdminClient()

  // Payment captured successfully — mark org active
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const invoiceId = resource?.invoice_id as string | undefined
    if (invoiceId) {
      await admin
        .from('organizations')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('braintree_last_transaction_id', invoiceId)
    }
  }

  // Payment failed
  if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'PAYMENT.CAPTURE.REVERSED') {
    const invoiceId = resource?.invoice_id as string | undefined
    if (invoiceId) {
      await admin
        .from('organizations')
        .update({ status: 'payment_failed', updated_at: new Date().toISOString() })
        .eq('braintree_last_transaction_id', invoiceId)
    }
  }

  // Subscription cancelled
  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
    const subscriptionId = resource?.id as string | undefined
    if (subscriptionId) {
      await admin
        .from('organizations')
        .update({ plan: 'trial', status: 'trial', bus_limit: 10, updated_at: new Date().toISOString() })
        .eq('braintree_subscription_id', subscriptionId)
    }
  }

  return NextResponse.json({ received: true })
}
