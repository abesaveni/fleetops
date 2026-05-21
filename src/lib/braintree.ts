import braintree from 'braintree'

const env = process.env.BRAINTREE_ENVIRONMENT === 'Production'
  ? braintree.Environment.Production
  : braintree.Environment.Sandbox

// Singleton gateway — reused across API routes
export const gateway = new braintree.BraintreeGateway({
  environment: env,
  merchantId:  process.env.BRAINTREE_MERCHANT_ID!,
  publicKey:   process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey:  process.env.BRAINTREE_PRIVATE_KEY!,
})

// Plan definitions — bus_limit kept in sync with organizations.bus_limit
export const PLANS: Record<string, { name: string; price: number; bus_limit: number | null }> = {
  pro: {
    name:      'Pro',
    price:     49,
    bus_limit: 50,
  },
  business: {
    name:      'Business',
    price:     149,
    bus_limit: 250,
  },
  enterprise: {
    name:      'Enterprise',
    price:     0,   // handled via sales
    bus_limit: null,
  },
}
