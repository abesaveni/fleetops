import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { createOrder, getPlanPrice, PLANS } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { planId, billingPeriod } = body as { planId: string; billingPeriod: 'monthly' | 'yearly' }
  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const price = getPlanPrice(planId, billingPeriod)
  const description = `Track-it-Lio ${plan.name} — ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} subscription`

  const order = await createOrder(price.toFixed(2), description)
  if (!order.id) return NextResponse.json({ error: order.message ?? 'Failed to create order' }, { status: 422 })

  return NextResponse.json({ orderID: order.id })
}
