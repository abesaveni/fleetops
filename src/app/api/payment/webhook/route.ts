import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { gateway } from '@/lib/braintree'

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const btSignature = formData.get('bt_signature') as string | null
  const btPayload   = formData.get('bt_payload')   as string | null

  if (!btSignature || !btPayload) {
    return NextResponse.json({ error: 'Missing webhook params' }, { status: 400 })
  }

  let notification: Awaited<ReturnType<typeof gateway.webhookNotification.parse>>
  try {
    notification = await gateway.webhookNotification.parse(btSignature, btPayload)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  const kind = notification.kind

  // Subscription charged successfully — ensure org stays active
  if (kind === 'subscription_charged_successfully') {
    const sub = (notification as any).subscription
    if (sub?.id) {
      await admin
        .from('organizations')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('braintree_subscription_id', sub.id)
    }
  }

  // Subscription cancelled or expired — downgrade to trial (keep existing buses)
  if (
    kind === 'subscription_canceled' ||
    kind === 'subscription_expired'
  ) {
    const sub = (notification as any).subscription
    if (sub?.id) {
      await admin
        .from('organizations')
        .update({ plan: 'trial', status: 'trial', bus_limit: 5, updated_at: new Date().toISOString() })
        .eq('braintree_subscription_id', sub.id)
    }
  }

  // Subscription charge failed — mark payment overdue
  if (kind === 'subscription_charged_unsuccessfully') {
    const sub = (notification as any).subscription
    if (sub?.id) {
      await admin
        .from('organizations')
        .update({ status: 'payment_failed', updated_at: new Date().toISOString() })
        .eq('braintree_subscription_id', sub.id)
    }
  }

  return NextResponse.json({ received: true })
}
