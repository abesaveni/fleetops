'use client'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@/context/UserContext'

interface Props {
  planId:        'pro' | 'business'
  planName:      string
  price:         number
  billingPeriod: 'monthly' | 'yearly'
  onClose:       () => void
  onSuccess:     () => void
}

export default function PaymentModal({ planId, planName, price, billingPeriod, onClose, onSuccess }: Props) {
  const { refresh }       = useUser()
  const dropinRef         = useRef<HTMLDivElement>(null)
  const instanceRef       = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy,  setBusy]  = useState(false)

  useEffect(() => {
    let mounted = true
    let dropinInstance: any = null

    async function init() {
      try {
        const tokenRes = await fetch('/api/payment/token')
        if (!tokenRes.ok) throw new Error('Failed to load payment form')
        const { token } = await tokenRes.json()

        // Dynamically import to avoid SSR issues
        const dropin = (await import('braintree-web-drop-in')).default

        if (!mounted || !dropinRef.current) return

        dropinInstance = await dropin.create({
          authorization: token,
          container: dropinRef.current,
          paypal: { flow: 'vault' },
        })

        if (!mounted) {
          dropinInstance.teardown()
          return
        }

        instanceRef.current = dropinInstance
        setReady(true)
      } catch (err: any) {
        if (mounted) setError(err.message ?? 'Could not load payment form')
      }
    }

    init()

    return () => {
      mounted = false
      instanceRef.current?.teardown()
    }
  }, [])

  async function handleSubmit() {
    if (!instanceRef.current || busy) return
    setBusy(true)
    setError(null)
    try {
      const { nonce } = await instanceRef.current.requestPaymentMethod()
      const res = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, planId, billingPeriod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Payment failed')
      await refresh()
      onSuccess()
    } catch (err: any) {
      setError(err.message ?? 'Payment failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const perMonth = billingPeriod === 'yearly' ? Math.round(price / 12) : price

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Upgrade to {planName}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              ${price}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginLeft: 4 }}>
                /{billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billingPeriod === 'yearly' && (
              <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
                ${perMonth}/mo — 15% off annual billing
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#f1f5f9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Braintree Drop-in container */}
        <div ref={dropinRef} style={{ minHeight: 160 }}/>

        {!ready && !error && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>
            Loading payment form…
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: 12 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!ready || busy}
          style={{
            width: '100%', marginTop: 16, padding: '13px',
            background: !ready || busy ? '#cbd5e1' : '#2563eb',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: !ready || busy ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}>
          {busy ? 'Processing…' : `Subscribe · $${price}/${billingPeriod === 'yearly' ? 'yr' : 'mo'}`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 12, marginBottom: 0 }}>
          Secured by Braintree · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  )
}
