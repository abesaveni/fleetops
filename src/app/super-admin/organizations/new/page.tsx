'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function NewOrgPage() {
  const router = useRouter()
  const [toast,  setToast]  = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState<{ org_name: string; admin_email: string; admin_password: string } | null>(null)
  const [form,   setForm]   = useState({
    org_name:       '',
    admin_email:    '',
    admin_password: generatePassword(),
    plan:           'basic',
    notes:          '',
  })

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(null), 3500) }
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/super-admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { showToast(data.error ?? 'Failed to create organization'); setSaving(false); return }
    setDone({ org_name: form.org_name, admin_email: form.admin_email, admin_password: form.admin_password })
    setSaving(false)
  }

  if (done) {
    return (
      <div style={{ maxWidth: 560 }}>
        {toast && <Toast message={toast}/>}
        <div className="page-header">
          <div><h1 className="page-title">Organization Created</h1></div>
        </div>
        <div className="card">
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <strong>{done.org_name}</strong> has been created successfully. Share the credentials below with the admin.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Admin Email</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <code style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace' }}>{done.admin_email}</code>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => { navigator.clipboard.writeText(done.admin_email); showToast('Copied!') }}>Copy</button>
              </div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Admin Password</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <code style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace' }}>{done.admin_password}</code>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => { navigator.clipboard.writeText(done.admin_password); showToast('Copied!') }}>Copy</button>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 12px', alignSelf: 'flex-start' }}
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${done.admin_email}\nPassword: ${done.admin_password}`)
                showToast('Both credentials copied!')
              }}
            >Copy Both</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, marginBottom: 0 }}>The password will not be shown again. Make sure to copy and share it securely.</p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => router.push('/super-admin/organizations')}>Go to Organizations</button>
            <button className="btn btn-secondary" onClick={() => { setDone(null); setForm({ org_name: '', admin_email: '', admin_password: generatePassword(), plan: 'basic', notes: '' }) }}>Create Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>
      {toast && <Toast message={toast}/>}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px', marginBottom: 12 }} onClick={() => router.back()}>← Back</button>
          <h1 className="page-title">New Organization</h1>
          <p className="page-subtitle">Create a new customer organization and their admin account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="form-group">
              <label className="form-label">Organization Name *</label>
              <input className="input" type="text" required placeholder="e.g. CityBus Transit" value={form.org_name} onChange={e => set('org_name', e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label">Plan</label>
              <select className="input" value={form.plan} onChange={e => set('plan', e.target.value)}>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>Admin Account</p>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email *</label>
              <input className="input" type="email" required placeholder="admin@organization.com" value={form.admin_email} onChange={e => set('admin_email', e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Password *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" type="text" required value={form.admin_password} onChange={e => set('admin_password', e.target.value)}/>
                <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '8px 12px' }}
                  onClick={() => set('admin_password', generatePassword())}>Regenerate</button>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-generated. Share this with the admin after creation.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="input" rows={2} style={{ resize: 'vertical' }} placeholder="Any notes about this organization…"
                value={form.notes} onChange={e => set('notes', e.target.value)}/>
            </div>

          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Organization'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
