'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'
import PaymentModal from '@/components/PaymentModal'

const PLANS = [
  {
    id:       'plan1',
    name:     'Plan 1',
    tag:      'Most Popular',
    desc:     'For growing transit operations',
    monthly:  149,
    yearly:   1499,
    limit:    50,
    limitLabel: 'Up to 50 buses',
    cta:      'Upgrade to Plan 1',
    ctaStyle: 'primary',
    features: [
      'Up to 50 buses',
      'Real-time fleet status board',
      'PDF & CSV fleet reports',
      'Work order management',
      'Dispatch & Maintenance roles',
      'Priority support',
    ],
  },
  {
    id:       'plan2',
    name:     'Plan 2',
    tag:      null,
    desc:     'For large fleet operators',
    monthly:  499,
    yearly:   4999,
    limit:    250,
    limitLabel: 'Up to 250 buses',
    cta:      'Upgrade to Plan 2',
    ctaStyle: 'outline',
    features: [
      'Up to 250 buses',
      'Everything in Plan 1',
      'Advanced fleet analytics',
      'E1 Accounting API integration',
      'Dedicated account manager',
      '24/7 phone + SLA guarantee',
    ],
  },
]

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

interface ModalState {
  planId:        'plan1' | 'plan2'
  planName:      string
  price:         number
  billingPeriod: 'monthly' | 'yearly'
}

export default function UpgradePage() {
  const router    = useRouter()
  const { user }  = useUser()
  const [yearly, setYearly] = useState(false)
  const [modal,  setModal]  = useState<ModalState | null>(null)

  const currentPlan = user?.plan ?? 'trial'
  const busCount    = user?.bus_count ?? 0
  const busLimit    = user?.bus_limit ?? 5
  const atLimit     = busLimit !== null && busCount >= busLimit

  function handleUpgrade(planId: string, planName: string, monthly: number, annualTotal: number) {
    setModal({
      planId:        planId as 'plan1' | 'plan2',
      planName,
      price:         yearly ? annualTotal : monthly,
      billingPeriod: yearly ? 'yearly' : 'monthly',
    })
  }

  function handleSuccess() {
    setModal(null)
    router.push('/dashboard')
  }

  return (
    <div className="layout">
      <Sidebar/>
      {modal && (
        <PaymentModal
          planId={modal.planId}
          planName={modal.planName}
          price={modal.price}
          billingPeriod={modal.billingPeriod}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      <main className="main-content" style={{ background: '#f8fafc' }}>

        {/* Limit reached banner */}
        {atLimit && (
          <div style={{ background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                You've reached your bus limit of {busLimit} buses.
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                Upgrade to keep growing your fleet.
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {busCount} / {busLimit} buses used
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Pricing · Fleet Capacity
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
            Scale your fleet,<br/>not your overhead.
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
            Choose the plan that fits your fleet size. Prices in USD.
          </p>

          {/* Monthly / Yearly toggle */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: 10, padding: 4, gap: 2 }}>
            <button
              onClick={() => setYearly(false)}
              style={{ padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: !yearly ? '#fff' : 'transparent', color: !yearly ? '#0f172a' : '#64748b', boxShadow: !yearly ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{ padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: yearly ? '#fff' : 'transparent', color: yearly ? '#0f172a' : '#64748b', boxShadow: yearly ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              Yearly
              <span style={{ fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: 20 }}>Save ~16%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
          {PLANS.map(plan => {
            const isCurrent  = currentPlan === plan.id
            const isPopular  = plan.tag === 'Most Popular'
            const price      = yearly ? plan.yearly : plan.monthly
            return (
              <div key={plan.id} style={{
                background: isPopular ? '#0f172a' : '#fff',
                border: `1.5px solid ${isPopular ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: 14,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: isPopular ? '0 8px 32px rgba(37,99,235,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {plan.tag && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                    {plan.tag}
                  </div>
                )}
                {isCurrent && !isPopular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', border: '1px solid #e2e8f0', letterSpacing: '0.05em' }}>
                    Current Plan
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isPopular ? '#93c5fd' : '#2563eb', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: isPopular ? '#94a3b8' : '#64748b' }}>{plan.desc}</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 38, fontWeight: 800, color: isPopular ? '#fff' : '#0f172a', letterSpacing: '-0.03em' }}>${price}</span>
                    <span style={{ fontSize: 13, color: isPopular ? '#64748b' : '#94a3b8', marginLeft: 4 }}>/{yearly ? 'year' : 'month'}</span>
                  </div>
                  {yearly && (
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
                      ${Math.round(price / 12)}/mo · save ~16%
                    </div>
                  )}
                </div>

                <div style={{ background: isPopular ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: `1px solid ${isPopular ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: 8, padding: '8px 12px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isPopular ? '#60a5fa' : '#2563eb'} strokeWidth="1.8" strokeLinecap="round">
                    <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
                    <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isPopular ? '#e2e8f0' : '#0f172a' }}>{plan.limitLabel}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: isPopular ? '#cbd5e1' : '#475569', lineHeight: 1.4 }}>
                      <Check/>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id, plan.name, plan.monthly, plan.yearly)}
                  disabled={isCurrent}
                  style={{
                    width: '100%', padding: '12px', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    background: isCurrent
                      ? (isPopular ? 'rgba(255,255,255,0.08)' : '#f1f5f9')
                      : isPopular ? '#2563eb' : '#f1f5f9',
                    color: isCurrent
                      ? (isPopular ? '#64748b' : '#94a3b8')
                      : isPopular ? '#fff' : '#0f172a',
                    opacity: isCurrent ? 0.7 : 1,
                  }}>
                  {isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 28 }}>
          All plans include fleet status tracking · Work order management · Cancel anytime · Prices in USD
        </p>
      </main>
    </div>
  )
}
