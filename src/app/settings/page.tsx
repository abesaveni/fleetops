'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'

export default function SettingsPage() {
  const router  = useRouter()
  const { user } = useUser()
  const supabase = createClient()

  const [confirmName, setConfirmName]   = useState('')
  const [deleting,    setDeleting]      = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error,       setError]         = useState<string | null>(null)

  const isAdmin   = user?.role === 'Admin'
  const orgName   = user?.org_name ?? ''
  const nameMatch = confirmName.trim().toLowerCase() === orgName.trim().toLowerCase()

  async function handleDeleteOrg() {
    if (!nameMatch) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/org/delete', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ confirmName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to delete organization'); setDeleting(false); return }
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <div style={{ maxWidth: 680 }}>

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your organization account</p>
            </div>
          </div>

          {/* Organization info card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 18px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Organization
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
              {[
                { label: 'Organization Name', value: orgName || '—' },
                { label: 'Your Role',         value: user?.role || '—' },
                { label: 'Plan',              value: user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : '—' },
                { label: 'Bus Limit',         value: user?.bus_limit != null ? `${user.bus_limit} buses` : 'Unlimited' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Account actions */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 18px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Account
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => router.push('/upgrade')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Upgrade Plan
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => router.push('/admin/users')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Manage Users
              </button>
            </div>
          </div>

          {/* Danger zone — admin only */}
          {isAdmin && (
            <div className="danger-zone">
              <p className="danger-zone-title">Danger Zone</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 18px', lineHeight: 1.6 }}>
                Permanently delete your organization and all associated data — buses, users, and records.
                This action <strong style={{ color: '#be123c' }}>cannot be undone</strong>.
              </p>

              {!showConfirm ? (
                <button
                  className="btn btn-danger"
                  onClick={() => setShowConfirm(true)}
                  style={{ fontSize: 13 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Delete Organization
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#be123c', margin: '0 0 4px' }}>
                      Type your organization name to confirm deletion:
                    </p>
                    <p style={{ fontSize: 12, color: '#9f1239', margin: 0 }}>
                      "<strong>{orgName}</strong>"
                    </p>
                  </div>
                  <input
                    className="input"
                    placeholder={`Type "${orgName}" to confirm`}
                    value={confirmName}
                    onChange={e => setConfirmName(e.target.value)}
                    style={{ borderColor: confirmName && !nameMatch ? '#fca5a5' : undefined }}
                  />
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteOrg}
                      disabled={!nameMatch || deleting}
                      style={{ fontSize: 13 }}
                    >
                      {deleting ? 'Deleting everything…' : 'Permanently Delete Organization'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setShowConfirm(false); setConfirmName(''); setError(null) }}
                      style={{ fontSize: 13 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
