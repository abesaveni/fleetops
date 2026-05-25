'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Organization, UserSubscription } from '@/types'
import Toast from '@/components/Toast'

const PLANS = [
  { id: 'trial',      label: 'Trial (Free)',   limit: 10,  mrr: 0 },
  { id: 'pro',        label: 'Pro',            limit: 50,  mrr: 49 },
  { id: 'business',   label: 'Business',       limit: 250, mrr: 149 },
  { id: 'enterprise', label: 'Enterprise',     limit: null, mrr: 0 },
]

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  pro:        { bg: '#eff6ff', color: '#2563eb' },
  business:   { bg: '#f5f3ff', color: '#7c3aed' },
  enterprise: { bg: '#fef3c7', color: '#d97706' },
  trial:      { bg: '#f1f5f9', color: '#64748b' },
  basic:      { bg: '#f1f5f9', color: '#64748b' },
}
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active:         { bg: '#dcfce7', color: '#16a34a' },
  trial:          { bg: '#fef9c3', color: '#a16207' },
  suspended:      { bg: '#fee2e2', color: '#dc2626' },
  payment_failed: { bg: '#fee2e2', color: '#dc2626' },
}

const fmtLong  = (d: string) => new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'long',  year: 'numeric' })
const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

function InfoField({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? '#0f172a' : '#94a3b8', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  )
}

function CapBar({ count, limit }: { count: number; limit: number | null }) {
  if (!limit) return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{count} buses · Unlimited capacity</div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999 }}/>
    </div>
  )
  const pct   = Math.min((count / limit) * 100, 100)
  const color = count >= limit ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#2563eb'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
        <span>{count} buses used</span>
        <span style={{ color }}>{count} / {limit} ({Math.round(pct)}%)</span>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.4s' }}/>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 5 }}>
        {limit - count > 0 ? `${limit - count} slots remaining` : 'At capacity — upgrade required to add more'}
      </div>
    </div>
  )
}

function getDaysLeft(startedAt: string | null, period: string | null): number | null {
  if (!startedAt || !period) return null
  const start = new Date(startedAt)
  const days  = period === 'yearly' ? 365 : 30
  const renewal = new Date(start.getTime() + days * 86400000)
  return Math.ceil((renewal.getTime() - Date.now()) / 86400000)
}

export default function OrgDetailClient({ org, users, busCount }: { org: Organization; users: UserSubscription[]; busCount: number }) {
  const router  = useRouter()
  const [toast,       setToast]      = useState<string | null>(null)
  const [updating,    setUpdating]   = useState(false)
  const [deleting,    setDeleting]   = useState(false)
  const [planEditor,  setPlanEditor] = useState(false)
  const [editPlan,    setEditPlan]   = useState(org.plan)
  const [editLimit,   setEditLimit]  = useState<string>(org.bus_limit?.toString() ?? '')
  const [editStatus,  setEditStatus] = useState<Organization['status']>(org.status)
  const [savingPlan,  setSavingPlan] = useState(false)

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 3500) }

  async function updateStatus(status: string) {
    setUpdating(true)
    const res = await fetch(`/api/super-admin/organizations/${org.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { showToast(`Organization ${status}`); router.refresh() }
    else showToast('Failed to update status')
    setUpdating(false)
  }

  async function savePlanOverride() {
    setSavingPlan(true)
    const payload: Record<string, unknown> = {
      plan:   editPlan,
      status: editStatus,
    }
    const limitNum = editLimit ? parseInt(editLimit, 10) : null
    payload.bus_limit = isNaN(limitNum as number) ? null : limitNum

    const res = await fetch(`/api/super-admin/organizations/${org.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      showToast('Plan updated')
      setPlanEditor(false)
      router.refresh()
    } else {
      showToast('Failed to update plan')
    }
    setSavingPlan(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${org.name}"? This permanently deletes all their buses and users.`)) return
    setDeleting(true)
    const res = await fetch(`/api/super-admin/organizations/${org.id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/super-admin/organizations'); router.refresh() }
    else { showToast('Failed to delete organization'); setDeleting(false) }
  }

  const planColor  = PLAN_COLORS[org.plan]  ?? PLAN_COLORS.trial
  const statusColor = STATUS_COLORS[org.status] ?? STATUS_COLORS.suspended
  const daysLeft   = getDaysLeft(org.plan_started_at, org.plan_period)
  const renewalDate = org.plan_started_at && org.plan_period
    ? new Date(new Date(org.plan_started_at).getTime() + (org.plan_period === 'yearly' ? 365 : 30) * 86400000)
    : null

  const currentPlanDef = PLANS.find(p => p.id === org.plan)
  const mrr = currentPlanDef?.mrr ?? 0

  return (
    <>
      {toast && <Toast message={toast}/>}

      {/* Back + header */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px', marginBottom: 14 }} onClick={() => router.back()}>← Back</button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏢</div>
            <div>
              <h1 className="page-title" style={{ marginBottom: 6 }}>{org.name}</h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: statusColor.bg, color: statusColor.color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor.color }}/>
                  {org.status === 'payment_failed' ? 'Payment Failed' : org.status}
                </span>
                <span style={{ background: planColor.bg, color: planColor.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, textTransform: 'capitalize' }}>
                  {org.plan}
                </span>
                {org.plan_period && (
                  <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: 20 }}>
                    {org.plan_period === 'yearly' ? 'Annual billing' : 'Monthly billing'}
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8' }}>/{org.slug}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setPlanEditor(e => !e)}>
              {planEditor ? 'Cancel Edit' : '✏ Override Plan'}
            </button>
            {org.status === 'active' ? (
              <button className="btn btn-warning" style={{ fontSize: 13 }} disabled={updating} onClick={() => updateStatus('suspended')}>
                {updating ? 'Updating…' : 'Suspend'}
              </button>
            ) : (
              <button className="btn btn-success" style={{ fontSize: 13 }} disabled={updating} onClick={() => updateStatus('active')}>
                {updating ? 'Updating…' : 'Activate'}
              </button>
            )}
            <button className="btn btn-danger" style={{ fontSize: 13 }} disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting…' : 'Delete Org'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Buses',        value: busCount,      color: '#2563eb', bg: '#eff6ff', sub: org.bus_limit ? `of ${org.bus_limit}` : 'unlimited' },
          { label: 'Team Members', value: users.length,  color: '#16a34a', bg: '#f0fdf4', sub: `${users.filter(u => u.is_active).length} active` },
          { label: 'Monthly Value', value: mrr > 0 ? `$${mrr}` : 'Free', color: '#d97706', bg: '#fffbeb', sub: mrr > 0 ? `$${mrr * 12}/yr` : 'no charge' },
          { label: 'Days to Renew', value: daysLeft !== null ? (daysLeft < 0 ? 'Overdue' : `${daysLeft}d`) : '—', color: daysLeft !== null && daysLeft <= 7 ? '#dc2626' : '#7c3aed', bg: daysLeft !== null && daysLeft <= 7 ? '#fef2f2' : '#f5f3ff', sub: renewalDate ? `Renews ${fmtShort(renewalDate.toISOString())}` : 'No renewal' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan override editor */}
      {planEditor && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Manual Plan Override — Super Admin Only
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Plan</label>
              <select
                className="input"
                value={editPlan}
                onChange={e => {
                  const p = PLANS.find(x => x.id === e.target.value)
                  setEditPlan(e.target.value)
                  if (p) setEditLimit(p.limit?.toString() ?? '')
                }}
                style={{ fontSize: 13 }}
              >
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Bus Limit (blank = unlimited)</label>
              <input
                className="input"
                type="number"
                min="1"
                value={editLimit}
                onChange={e => setEditLimit(e.target.value)}
                placeholder="e.g. 50"
                style={{ fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Account Status</label>
              <select className="input" value={editStatus} onChange={e => setEditStatus(e.target.value as Organization['status'])} style={{ fontSize: 13 }}>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="payment_failed">Payment Failed</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ fontSize: 13 }} disabled={savingPlan} onClick={savePlanOverride}>
              {savingPlan ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Fleet capacity */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: '#0f172a' }}>Fleet Capacity</h3>
        <CapBar count={busCount} limit={org.bus_limit}/>
      </div>

      {/* Billing & subscription */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: '#0f172a' }}>Billing & Subscription</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 32px' }}>
          <InfoField label="Plan"             value={org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}/>
          <InfoField label="Billing Period"   value={org.plan_period ? (org.plan_period === 'yearly' ? 'Annual (15% off)' : 'Monthly') : '—'}/>
          <InfoField label="Monthly Value"    value={mrr > 0 ? `$${mrr}/mo` : 'Free'}/>
          <InfoField label="Plan Started"     value={org.plan_started_at ? fmtLong(org.plan_started_at) : '—'}/>
          <InfoField label="Next Renewal"     value={renewalDate ? fmtLong(renewalDate.toISOString()) : '—'}/>
          <InfoField label="Days Until Renewal" value={daysLeft !== null ? (daysLeft < 0 ? 'Overdue' : `${daysLeft} days`) : '—'}/>
          <InfoField label="Braintree Customer ID" value={org.braintree_customer_id}  mono/>
          <div style={{ gridColumn: '2 / -1' }}>
            <InfoField label="Last Transaction ID" value={org.braintree_last_transaction_id} mono/>
          </div>
        </div>
        {org.braintree_customer_id && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
            To view full transaction history, search customer ID <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>{org.braintree_customer_id}</code> in the Braintree dashboard.
          </div>
        )}
      </div>

      {/* Org details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: '#0f172a' }}>Organization Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 32px' }}>
          <InfoField label="Organization Name" value={org.name}/>
          <InfoField label="Slug"              value={`/${org.slug}`}/>
          <InfoField label="Owner Email"       value={org.owner_email}/>
          <InfoField label="Created"           value={fmtLong(org.created_at)}/>
          <InfoField label="Last Updated"      value={fmtLong(org.updated_at)}/>
          {org.notes && <div style={{ gridColumn: '1/-1' }}><InfoField label="Notes" value={org.notes}/></div>}
        </div>
      </div>

      {/* Team members */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Team Members</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{users.length} users · {users.filter(u => u.is_active).length} active</span>
        </div>
        {users.length === 0 ? (
          <div className="empty-state"><p>No users in this organization</p></div>
        ) : (
          <table>
            <thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.user_email}</td>
                  <td><span className={`role-badge role-badge-${u.subscription_type.toLowerCase()}`}>{u.subscription_type}</span></td>
                  <td>
                    <span className={`status-pill ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{fmtShort(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
