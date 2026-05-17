'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Organization, UserSubscription } from '@/types'
import Toast from '@/components/Toast'

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 14, color: value ? '#0f172a' : '#94a3b8' }}>{value || '—'}</span>
    </div>
  )
}

export default function OrgDetailClient({ org, users, busCount }: { org: Organization; users: UserSubscription[]; busCount: number }) {
  const router  = useRouter()
  const [toast,    setToast]    = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 3500) }

  async function updateStatus(status: string) {
    setUpdating(true)
    const res = await fetch(`/api/super-admin/organizations/${org.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { showToast(`Organization ${status}`); router.refresh() }
    else showToast('Failed to update status')
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${org.name}"? This will permanently delete all their buses and users. This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/super-admin/organizations/${org.id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/super-admin/organizations'); router.refresh() }
    else { showToast('Failed to delete organization'); setDeleting(false) }
  }

  return (
    <>
      {toast && <Toast message={toast}/>}

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px', marginBottom: 14 }} onClick={() => router.back()}>← Back</button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
            <div>
              <h1 className="page-title" style={{ marginBottom: 4 }}>{org.name}</h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`status-pill status-${org.status}`}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                  {org.status}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>/{org.slug}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Buses', value: busCount,       color: '#2563eb', bg: '#eff6ff' },
          { label: 'Team Members', value: users.length,  color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Plan',         value: org.plan,      color: '#d97706', bg: '#fffbeb', isText: true },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: s.isText ? 16 : 28, fontWeight: 700, color: s.color, letterSpacing: s.isText ? 0 : '-0.03em', textTransform: s.isText ? 'capitalize' : 'none' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Org details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: '#0f172a' }}>Organization Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 32px' }}>
          <InfoField label="Organization Name" value={org.name}/>
          <InfoField label="Slug"              value={`/${org.slug}`}/>
          <InfoField label="Owner Email"       value={org.owner_email}/>
          <InfoField label="Plan"              value={org.plan}/>
          <InfoField label="Bus Limit"         value={org.bus_limit ? `${org.bus_limit} buses` : 'Unlimited'}/>
          <InfoField label="Created"           value={fmt(org.created_at)}/>
          {org.notes && <div style={{ gridColumn: '1/-1' }}><InfoField label="Notes" value={org.notes}/></div>}
        </div>
      </div>

      {/* Users table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Team Members</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{users.length} users</span>
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
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
