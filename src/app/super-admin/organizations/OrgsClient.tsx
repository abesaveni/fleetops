'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'

const PLAN_MONTHLY: Record<string, number> = { pro: 49, business: 149, enterprise: 0 }
const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  pro:        { bg: '#eff6ff', color: '#2563eb' },
  business:   { bg: '#f5f3ff', color: '#7c3aed' },
  enterprise: { bg: '#fef3c7', color: '#d97706' },
  trial:      { bg: '#f1f5f9', color: '#64748b' },
  basic:      { bg: '#f1f5f9', color: '#64748b' },
}

interface OrgRow {
  id: string; name: string; slug: string; owner_email: string
  plan: string; status: string; bus_count: number
  bus_limit: number | null; plan_period: string | null
  plan_started_at: string | null; created_at: string; notes: string | null
}

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default function OrgsClient({ orgs }: { orgs: OrgRow[] }) {
  const router = useRouter()
  const [toast,    setToast]   = useState<string | null>(null)
  const [search,   setSearch]  = useState('')
  const [filter,   setFilter]  = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 3000) }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orgs.filter(o => {
      const matchStatus = filter === 'all' || o.status === filter
      const matchSearch = !q || o.name.toLowerCase().includes(q) || o.owner_email.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [orgs, search, filter])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    const res = await fetch(`/api/super-admin/organizations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { showToast(`Organization ${status}`); router.refresh() }
    else showToast('Failed to update status')
    setUpdating(null)
  }

  return (
    <>
      {toast && <Toast message={toast}/>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">{orgs.length} organizations on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/super-admin/organizations/new')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Organization
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'trial', 'suspended', 'payment_failed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 9999, border: `1px solid ${filter === s ? 'var(--brand)' : 'var(--border-2)'}`,
                background: filter === s ? 'var(--brand-light)' : 'var(--surface)',
                color: filter === s ? 'var(--brand)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              }}
            >{s === 'all' ? 'All' : s === 'payment_failed' ? 'Pay. Failed' : s}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Search organizations…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No organizations found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Monthly Value</th>
                <th>Fleet</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(org => {
                const planColor = PLAN_COLORS[org.plan] ?? PLAN_COLORS.trial
                const monthly   = PLAN_MONTHLY[org.plan] ?? 0
                const mrr       = monthly > 0 && org.plan_period === 'yearly'
                  ? Math.round(monthly * 12 * 0.85 / 12)
                  : monthly
                return (
                  <tr key={org.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>
                          {org.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{org.owner_email}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: planColor.bg, color: planColor.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                        {org.plan}
                      </span>
                      {org.plan_period && (
                        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>{org.plan_period === 'yearly' ? 'ann.' : 'mo.'}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill status-${org.status}`}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                        {org.status === 'payment_failed' ? 'Pay. Failed' : org.status}
                      </span>
                    </td>
                    <td>
                      {mrr > 0
                        ? <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 13 }}>${mrr}<span style={{ fontSize: 10, fontWeight: 400, color: '#64748b' }}>/mo</span></span>
                        : <span style={{ fontSize: 12, color: '#94a3b8' }}>Free</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{org.bus_count}</span>
                        {org.bus_limit && <span style={{ fontSize: 11, color: '#94a3b8' }}>/ {org.bus_limit}</span>}
                      </div>
                      {org.bus_limit && (
                        <div style={{ height: 3, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden', marginTop: 3, width: 60 }}>
                          <div style={{
                            height: '100%', borderRadius: 9999,
                            width: `${Math.min((org.bus_count / org.bus_limit) * 100, 100)}%`,
                            background: org.bus_count >= org.bus_limit ? '#ef4444' : '#2563eb',
                          }}/>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(org.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>View</button>
                        {org.status === 'active' ? (
                          <button className="btn btn-warning" style={{ fontSize: 12, padding: '3px 10px' }} disabled={updating === org.id} onClick={() => updateStatus(org.id, 'suspended')}>
                            {updating === org.id ? '…' : 'Suspend'}
                          </button>
                        ) : (
                          <button className="btn btn-success" style={{ fontSize: 12, padding: '3px 10px' }} disabled={updating === org.id} onClick={() => updateStatus(org.id, 'active')}>
                            {updating === org.id ? '…' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
