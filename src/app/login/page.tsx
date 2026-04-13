'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'var(--sidebar-bg)', borderRadius:14, marginBottom:16 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="7" width="22" height="13" rx="2" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
              <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
              <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="1.5"/>
              <path d="M8 11h8M8 14h5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 4px' }}>FleetOps</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0 }}>Bus Fleet Management</p>
        </div>
        <div className="card" style={{ padding:'28px 32px' }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 20px' }}>Sign in</h2>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoFocus/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            </div>
            {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, fontSize:13 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:4, justifyContent:'center', padding:'11px 16px' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)', marginTop:20 }}>Contact your administrator to get access.</p>
      </div>
    </div>
  )
}
