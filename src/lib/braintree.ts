import braintree from 'braintree'

let _gateway: braintree.BraintreeGateway | null = null

// Lazy singleton — not created at import time so build-time bundling never
// executes it without real env vars present.
export function getGateway(): braintree.BraintreeGateway {
  if (_gateway) return _gateway
  const env = process.env.BRAINTREE_ENVIRONMENT === 'Production'
    ? braintree.Environment.Production
    : braintree.Environment.Sandbox
  _gateway = new braintree.BraintreeGateway({
    environment: env,
    merchantId:  process.env.BRAINTREE_MERCHANT_ID!,
    publicKey:   process.env.BRAINTREE_PUBLIC_KEY!,
    privateKey:  process.env.BRAINTREE_PRIVATE_KEY!,
  })
  return _gateway
}

// Plan definitions — bus_limit kept in sync with organizations.bus_limit
export const PLANS: Record<string, { name: string; price: number; bus_limit: number | null }> = {
  plan1: {
    name:      'Plan 1',
    price:     149,
    bus_limit: 50,
  },
  plan2: {
    name:      'Plan 2',
    price:     499,
    bus_limit: 250,
  },
}
