'use client'
import { useState, useEffect, useCallback } from 'react'
import Toast from '@/components/Toast'

interface UserSub { id: string; user_email: string; subscription_type: string; is_active: boolean }

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function UsersClient({ currentUserEmail }: { currentUserEmail: string }) {
  const [users, setUsers]       = useState<UserSub[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast]       = useState<string|null>(null)
  const [form, setForm]         = useState({ email:'', password:'', role:'Viewer' })
  const [saving, setSaving]     = useState(false)
  const [created, setCreated]   = useState<{email:string;password:string}|null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  function openModal() {
    const pw = generatePassword()
    setForm({ email:'', password:pw, role:'Viewer' })
    setCreated(null)
    setShowModal(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { showToast(data.error ?? 'Error creating user'); setSaving(false); return }
    setCreated({ email: form.email, password: form.password })
    loadUsers()
    setSaving(false)
  }

  async function toggleActive(user: UserSub) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.user_email, is_active: !user.is_active }),
    })
    showToast(`${user.user_email} ${!user.is_active ? 'activated' : 'deactivated'}`)
    loadUsers()
  }

  async function changeRole(user: UserSub, role: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.user_email, role }),
    })
    showToast(`Role updated to ${role}`)
    loadUsers()
  }

  return (
    <>
      {toast && <Toast message={toast}/>}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} users registered</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>
                    {u.user_email}
                    {u.user_email === currentUserEmail && (
                      <span style={{ marginLeft:8, fontSize:11, background:'var(--brand-light)', color:'var(--brand)', padding:'2px 8px', borderRadius:9999, fontWeight:600 }}>You</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="input"
                      style={{ width:'auto', padding:'4px 8px', fontSize:13 }}
                      value={u.subscription_type}
                      disabled={u.user_email === currentUserEmail}
                      onChange={e => changeRole(u, e.target.value)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      padding:'3px 10px', borderRadius:9999, fontSize:12, fontWeight:500,
                      background: u.is_active ? '#dcfce7' : '#f1f5f9',
                      color: u.is_active ? '#166534' : '#64748b',
                    }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background: u.is_active ? '#22c55e' : '#94a3b8', display:'inline-block' }}/>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.user_email !== currentUserEmail && (
                      <button
                        className={`btn ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding:'4px 12px', fontSize:12 }}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => !created && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {!created ? (
              <>
                <div className="modal-header">
                  <h2 className="modal-title">Add New User</h2>
                  <button className="btn btn-secondary" style={{ padding:'4px 10px' }} onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="form-grid" style={{ gridTemplateColumns:'1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="input" type="email" required placeholder="user@example.com"
                        value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div style={{ display:'flex', gap:8 }}>
                        <input className="input" type="text" required value={form.password}
                          onChange={e => setForm(f => ({...f, password:e.target.value}))}/>
                        <button type="button" className="btn btn-secondary" style={{ whiteSpace:'nowrap', padding:'8px 12px', fontSize:12 }}
                          onClick={() => setForm(f => ({...f, password:generatePassword()}))}>
                          Regenerate
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select className="input" value={form.role} onChange={e => setForm(f => ({...f, role:e.target.value}))}>
                        <option value="Viewer">Viewer — can view all buses</option>
                        <option value="Admin">Admin — full access</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h2 className="modal-title">User Created</h2>
                </div>
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'16px 20px', marginBottom:20 }}>
                  <p style={{ fontSize:14, color:'#166534', margin:'0 0 12px', fontWeight:500 }}>Share these credentials with the user:</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#475569' }}>Email:</span>
                      <code style={{ fontSize:13, fontWeight:600, color:'#0f172a', background:'#fff', padding:'3px 10px', borderRadius:6, border:'1px solid #e2e8f0' }}>{created.email}</code>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:'#475569' }}>Password:</span>
                      <code style={{ fontSize:13, fontWeight:600, color:'#0f172a', background:'#fff', padding:'3px 10px', borderRadius:6, border:'1px solid #e2e8f0' }}>{created.password}</code>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Make sure to copy and securely share these credentials. The password will not be shown again.</p>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => {
                    navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`)
                    showToast('Credentials copied!')
                  }}>Copy Credentials</button>
                  <button className="btn btn-primary" onClick={() => setShowModal(false)}>Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
