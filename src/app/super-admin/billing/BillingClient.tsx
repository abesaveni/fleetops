'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface OrgRow {
  id: string; name: string; slug: string; owner_email: string
  plan: string; status: string; bus_count: number
  bus_limit: number | null; plan_period: string | null
  plan_started_at: string | null; updated_at: string
  braintree_customer_id: string | null
  braintree_last_transaction_id: string | null
  created_at: string
}

interface Stats {
  totalOrgs: number; activeOrgs: number; trialOrgs: number
  payingOrgs: number; paymentFailed: number; mrr: number; arr: number
}

interface Props { orgs: OrgRow[]; stats: Stats }

const PLAN_MONTHLY: Record<string, number> = { pro: 49, business: 149, enterprise: 0 }
const PLAN_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pro:        { bg: '#eff6ff', color: '#2563eb', label: 'Pro' },
  business:   { bg: '#f5f3ff', color: '#7c3aed', label: 'Business' },
  enterprise: { bg: '#fef3c7', color: '#d97706', label: 'Enterprise' },
  trial:      { bg: '#f1f5f9', color: '#64748b', label: 'Trial' },
  basic:      { bg: '#f1f5f9', color: '#64748b', label: 'Trial' },
}
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active:         { bg: '#dcfce7', color: '#16a34a' },
  trial:          { bg: '#fef9c3', color: '#a16207' },
  suspended:      { bg: '#fee2e2', color: '#dc2626' },
  payment_failed: { bg: '#fee2e2', color: '#dc2626' },
}

function getMRR(plan: string, period: string | null): number {
  const m = PLAN_MONTHLY[plan] ?? 0
  if (!m) return 0
  return period === 'yearly' ? Math.round(m * 12 * 0.85 / 12) : m
}

function getDaysLeft(startedAt: string | null, period: string | null): number | null {
  if (!startedAt) return null
  const start    = new Date(startedAt)
  const days     = period === 'yearly' ? 365 : 30
  const renewal  = new Date(start.getTime() + days * 86400000)
  return Math.ceil((renewal.getTime() - Date.now()) / 86400000)
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function PlanPill({ plan }: { plan: string }) {
  const c = PLAN_COLORS[plan] ?? PLAN_COLORS.trial
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {c.label}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.suspended
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }}/>
      {status === 'payment_failed' ? 'Payment Failed' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function CapacityBar({ count, limit }: { count: number; limit: number | null }) {
  if (!limit) return <span style={{ fontSize: 12, color: '#64748b' }}>{count} buses · unlimited</span>
  const pct    = Math.min((count / limit) * 100, 100)
  const color  = count >= limit ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#2563eb'
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
        <span>{count} / {limit}</span>
        <span style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.3s' }}/>
      </div>
    </div>
  )
}

function DaysChip({ days }: { days: number | null }) {
  if (days === null) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  if (days < 0)  return <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Overdue</span>
  if (days <= 7) return <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{days}d left</span>
  return <span style={{ fontSize: 12, color: '#475569' }}>{days}d left</span>
}

export default function BillingClient({ orgs, stats }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'paying' | 'trial' | 'failed'>('all')
  const [search, setSearch] = useState('')

  const paying = useMemo(() => orgs.filter(o => PLAN_MONTHLY[o.plan] > 0 && o.status === 'active'), [orgs])
  const proCount  = paying.filter(o => o.plan === 'pro').length
  const bizCount  = paying.filter(o => o.plan === 'business').length
  const entCount  = paying.filter(o => o.plan === 'enterprise').length

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orgs.filter(o => {
      const matchFilter =
        filter === 'all'     ? true :
        filter === 'paying'  ? (PLAN_MONTHLY[o.plan] > 0 && o.status === 'active') :
        filter === 'trial'   ? (o.plan === 'trial' || o.plan === 'basic' || o.status === 'trial') :
        o.status === 'payment_failed'
      const matchSearch = !q || o.name.toLowerCase().includes(q) || o.owner_email.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [orgs, filter, search])

  const kpis = [
    { label: 'Monthly Recurring Revenue', value: `$${stats.mrr.toLocaleString()}`, sub: `$${stats.arr.toLocaleString()} ARR`, color: '#16a34a', bg: '#f0fdf4', icon: '💰' },
    { label: 'Paying Customers',  value: stats.payingOrgs,   sub: `${proCount} Pro · ${bizCount} Business · ${entCount} Enterprise`, color: '#2563eb', bg: '#eff6ff', icon: '✓' },
    { label: 'Free Trial',        value: stats.trialOrgs,    sub: 'No payment yet',  color: '#d97706', bg: '#fffbeb', icon: '⏱' },
    { label: 'Payment Issues',    value: stats.paymentFailed, sub: 'Require attention', color: '#dc2626', bg: '#fef2f2', icon: '⚠' },
    { label: 'Total Orgs',        value: stats.totalOrgs,    sub: `${stats.activeOrgs} active`,  color: '#7c3aed', bg: '#f5f3ff', icon: '🏢' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 600 }}>Super Admin · Finance</p>
        <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Billing & Subscriptions</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0' }}>Revenue overview and per-organization payment status</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${k.color}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue breakdown bar */}
      {stats.mrr > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Revenue by Plan</div>
          <div style={{ display: 'flex', gap: 0, height: 12, borderRadius: 9999, overflow: 'hidden', background: '#f1f5f9' }}>
            {[
              { plan: 'pro',      count: proCount,  color: '#2563eb' },
              { plan: 'business', count: bizCount,  color: '#7c3aed' },
              { plan: 'enterprise', count: entCount, color: '#d97706' },
            ].map(s => {
              const mrr = getMRR(s.plan, 'monthly') * s.count
              const pct = stats.mrr > 0 ? (mrr / stats.mrr) * 100 : 0
              return pct > 0 ? (
                <div key={s.plan} style={{ width: `${pct}%`, background: s.color, transition: 'width 0.4s' }} title={`${PLAN_COLORS[s.plan]?.label}: $${mrr}/mo`}/>
              ) : null
            })}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {[
              { plan: 'pro',        count: proCount,  color: '#2563eb', mrr: getMRR('pro', 'monthly') * proCount },
              { plan: 'business',   count: bizCount,  color: '#7c3aed', mrr: getMRR('business', 'monthly') * bizCount },
              { plan: 'enterprise', count: entCount,  color: '#d97706', mrr: 0 },
            ].map(s => s.count > 0 ? (
              <div key={s.plan} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                <span style={{ color: '#475569', fontWeight: 600 }}>{PLAN_COLORS[s.plan]?.label}</span>
                <span style={{ color: '#94a3b8' }}>{s.count} org{s.count !== 1 ? 's' : ''} · {s.mrr ? `$${s.mrr}/mo` : 'custom'}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Payment alerts */}
      {stats.paymentFailed > 0 && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>{stats.paymentFailed} organization{stats.paymentFailed !== 1 ? 's have' : ' has'} a payment failure</div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 1 }}>These accounts may have lost access — review and contact them.</div>
          </div>
          <button onClick={() => setFilter('failed')} style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            View Failed
          </button>
        </div>
      )}

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {([['all', 'All'], ['paying', 'Paying'], ['trial', 'Trial'], ['failed', 'Failed']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${filter === key ? '#2563eb' : '#e2e8f0'}`,
              background: filter === key ? '#eff6ff' : '#fff',
              color: filter === key ? '#2563eb' : '#64748b',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Search organizations…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Subscriptions table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Organizations</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} shown</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No organizations match this filter.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Monthly Value</th>
                  <th>Billing Period</th>
                  <th>Plan Since</th>
                  <th>Renewal</th>
                  <th>Fleet Capacity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(org => {
                  const mrr     = getMRR(org.plan, org.plan_period)
                  const daysLeft = getDaysLeft(org.plan_started_at, org.plan_period)
                  const periodLabel = org.plan_period === 'yearly' ? 'Annual' : org.plan_period === 'monthly' ? 'Monthly' : '—'
                  const renewalDate = org.plan_started_at && org.plan_period
                    ? fmtShort(new Date(new Date(org.plan_started_at).getTime() + (org.plan_period === 'yearly' ? 365 : 30) * 86400000).toISOString())
                    : null

                  return (
                    <tr key={org.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#2563eb' }}>{org.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{org.owner_email}</div>
                        </div>
                      </td>
                      <td><PlanPill plan={org.plan}/></td>
                      <td><StatusPill status={org.status}/></td>
                      <td>
                        {mrr > 0
                          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>${mrr}<span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>/mo</span></span>
                          : <span style={{ fontSize: 12, color: '#94a3b8' }}>Free</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>{periodLabel}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{org.plan_started_at ? fmtShort(org.plan_started_at) : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td>
                        {renewalDate
                          ? <span style={{ fontSize: 12, color: '#475569' }}>{renewalDate} <DaysChip days={daysLeft}/></span>
                          : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                        }
                      </td>
                      <td><CapacityBar count={org.bus_count} limit={org.bus_limit}/></td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '3px 10px', whiteSpace: 'nowrap' }}
                          onClick={e => { e.stopPropagation(); router.push(`/super-admin/organizations/${org.id}`) }}
                        >View →</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
