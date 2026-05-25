const BASE = process.env.PAYPAL_ENVIRONMENT === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export const PLANS: Record<string, { name: string; monthly: number; yearly: number; bus_limit: number | null }> = {
  plan1: { name: 'Plan 1', monthly: 149,  yearly: 1499, bus_limit: 50  },
  plan2: { name: 'Plan 2', monthly: 499,  yearly: 4999, bus_limit: 250 },
}

export function getPlanPrice(planId: string, billingPeriod: 'monthly' | 'yearly'): number {
  const plan = PLANS[planId]
  if (!plan) return 0
  return billingPeriod === 'yearly' ? plan.yearly : plan.monthly
}

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    'grant_type=client_credentials',
    cache:   'no-store',
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('PayPal auth failed: ' + JSON.stringify(data))
  return data.access_token
}

export async function createOrder(amount: string, description: string) {
  const token = await getAccessToken()
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: amount }, description }],
    }),
  })
  return res.json()
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken()
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  return res.json()
}
