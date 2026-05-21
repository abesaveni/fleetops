'use client'
import { useRouter } from 'next/navigation'
import type { Organization } from '@/types'

interface Stats {
  totalOrgs: number; activeOrgs: number; suspendedOrgs: number; trialOrgs: number
  payingOrgs: number; paymentFailed: number; mrr: number; arr: number
  totalBuses: number; busesIS: number; busesOOS: number
}

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  pro:        { bg: '#eff6ff', color: '#2563eb' },
  business:   { bg: '#f5f3ff', color: '#7c3aed' },
  enterprise: { bg: '#fef3c7', color: '#d97706' },
  trial:      { bg: '#f1f5f9', color: '#64748b' },
  basic:      { bg: '#f1f5f9', color: '#64748b' },
}

function PlanPill({ plan }: { plan: string }) {
  const c = PLAN_COLORS[plan] ?? PLAN_COLORS.trial
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'capitalize' }}>
      {plan}
    </span>
  )
}

export default function SADashboardClient({ stats, orgs }: { stats: Stats; orgs: Organization[] }) {
  const router = useRouter()

  const kpis = [
    { label: 'MRR',              value: `$${stats.mrr.toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4', icon: '💰', sub: `$${stats.arr.toLocaleString()} ARR` },
    { label: 'Paying Orgs',      value: stats.payingOrgs,    color: '#2563eb', bg: '#eff6ff', icon: '✓',  sub: 'Active subscribers' },
    { label: 'Free Trial',        value: stats.trialOrgs,     color: '#d97706', bg: '#fffbeb', icon: '⏱', sub: 'No payment yet' },
    { label: 'Payment Issues',    value: stats.paymentFailed, color: '#dc2626', bg: '#fef2f2', icon: '⚠', sub: stats.paymentFailed > 0 ? 'Needs attention' : 'All good' },
    { label: 'Total Orgs',        value: stats.totalOrgs,     color: '#7c3aed', bg: '#f5f3ff', icon: '🏢', sub: `${stats.activeOrgs} active` },
    { label: 'Total Buses',       value: stats.totalBuses,    color: '#0891b2', bg: '#ecfeff', icon: '🚌', sub: `${stats.busesIS} in service` },
    { label: 'Out of Service',    value: stats.busesOOS,      color: '#dc2626', bg: '#fef2f2', icon: '⚠', sub: 'Needs repair' },
    { label: 'Suspended',         value: stats.suspendedOrgs, color: '#94a3b8', bg: '#f8fafc', icon: '⊘', sub: 'Account suspended' },
  ]

  const recent = orgs.slice(0, 6)
  const payingOrgs = orgs.filter(o => ['pro', 'business', 'enterprise'].includes(o.plan) && o.status === 'active')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 600 }}>Super Admin</p>
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Platform Overview</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0' }}>{stats.totalOrgs} organizations · ${stats.mrr.toLocaleString()}/mo revenue</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => router.push('/super-admin/billing')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Billing
          </button>
          <button className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => router.push('/super-admin/organizations/new')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Org
          </button>
        </div>
      </div>

      {/* Payment failed alert */}
      {stats.paymentFailed > 0 && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', flex: 1 }}>
            {stats.paymentFailed} organization{stats.paymentFailed !== 1 ? 's' : ''} with payment failure
          </span>
          <button onClick={() => router.push('/super-admin/billing?filter=failed')} style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
            Review →
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${k.color}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout: paying orgs + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: payingOrgs.length ? '1fr 1fr' : '1fr', gap: 16 }}>

        {/* Paying subscribers */}
        {payingOrgs.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Paying Customers</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>{payingOrgs.length} orgs</span>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => router.push('/super-admin/billing')}>
                Full billing →
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {payingOrgs.slice(0, 6).map(org => (
                  <tr key={org.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 13 }}>{org.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{org.owner_email}</div>
                    </td>
                    <td><PlanPill plan={org.plan}/></td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>
                      {org.plan_started_at ? fmt(org.plan_started_at) : fmt(org.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent organizations */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Recent Sign-ups</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>Latest {recent.length}</span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => router.push('/super-admin/organizations')}>
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state"><p>No organizations yet.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(org => (
                  <tr key={org.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 13 }}>{org.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span className={`status-pill status-${org.status}`} style={{ fontSize: 10 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                          {org.status}
                        </span>
                      </div>
                    </td>
                    <td><PlanPill plan={org.plan}/></td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(org.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
