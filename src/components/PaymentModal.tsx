'use client'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useUser } from '@/context/UserContext'

interface Props {
  planId:        'plan1' | 'plan2'
  planName:      string
  price:         number
  billingPeriod: 'monthly' | 'yearly'
  onClose:       () => void
  onSuccess:     () => void
}

export default function PaymentModal({ planId, planName, price, billingPeriod, onClose, onSuccess }: Props) {
  const { refresh } = useUser()

  async function createOrder() {
    const res = await fetch('/api/payment/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ planId, billingPeriod }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to create order')
    return data.orderID as string
  }

  async function onApprove(data: { orderID: string }) {
    const res = await fetch('/api/payment/capture-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderID: data.orderID, planId, billingPeriod }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error ?? 'Payment capture failed')
    await refresh()
    onSuccess()
  }

  const perMonth = billingPeriod === 'yearly' ? Math.round(price / 12) : price

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        overflowY: 'auto',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 16px',
        WebkitOverflowScrolling: 'touch',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.25)', margin:'auto', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
              Upgrade to {planName}
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              ${price}
              <span style={{ fontSize:13, fontWeight:500, color:'#64748b', marginLeft:4 }}>
                /{billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <div style={{ fontSize:12, color:'#16a34a', fontWeight:600, marginTop:2 }}>
                ${perMonth}/mo — save ~16% on annual billing
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ border:'none', background:'#f1f5f9', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* What you get */}
        <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#475569' }}>
          Paying <strong style={{ color:'#0f172a' }}>${price}</strong> for <strong style={{ color:'#0f172a' }}>{planName}</strong> ({billingPeriod}).
          Your fleet capacity updates instantly after payment.
        </div>

        {/* PayPal Buttons */}
        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: 'USD',
          intent:   'capture',
        }}>
          <PayPalButtons
            style={{ layout:'vertical', color:'blue', shape:'rect', label:'pay', height:44 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => { console.error('PayPal error:', err) }}
          />
        </PayPalScriptProvider>

        <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:12, marginBottom:0 }}>
          Secured by PayPal · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  )
}
