'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const FLEET_SIZES = ['1–10 buses', '11–25 buses', '26–50 buses', '51–100 buses', '101–250 buses', '250+ buses']

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

type Step = 1 | 2 | 3

export default function SignupPage() {
  const router  = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1 fields
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')

  // Step 2 fields
  const [orgName,    setOrgName]    = useState('')
  const [state,      setState]      = useState('')
  const [fleetSize,  setFleetSize]  = useState('')
  const [phone,      setPhone]      = useState('')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function validateStep1() {
    if (!firstName.trim() || !lastName.trim()) return 'Please enter your full name.'
    if (!email.trim()) return 'Please enter your work email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    return null
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim()) { setError('Please enter your organization name.'); return }
    if (!state) { setError('Please select your state.'); return }
    if (!fleetSize) { setError('Please select your approximate fleet size.'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, orgName, state, fleetSize, phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); setLoading(false); return }

      // Sign in automatically with the new org admin credentials
      const supabase = createClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        setError('Account created! Please sign in.')
        router.push('/login')
        return
      }
      setStep(3)
      router.refresh()          // flush Next.js server-component cache for new session
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', fontSize: 14, border: '1px solid #e2e8f0',
    borderRadius: 8, outline: 'none', fontFamily: 'inherit', color: '#0f172a', background: '#fff',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  }
  const rowStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(160deg, #f8faff 0%, #eef3ff 50%, #f0f4f9 100%)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left panel */}
      <div style={{ display: 'none', flex: 1, background: '#0f172a', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', maxWidth: 480 }}
        className="signup-panel">
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: '#1e293b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="7" width="22" height="13" rx="2" stroke="#60a5fa" strokeWidth="1.6"/>
                <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
                <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#60a5fa" strokeWidth="1.6"/>
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>FleetOps</span>
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 16px' }}>
            Modern fleet management for U.S. transit agencies
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            Track every bus. Know who's in service and who's down — in real time.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Real-time status for your entire fleet', 'Role-based access for your team', 'PDF & CSV reports in one click', 'No credit card required to start'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, background: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 14, color: '#cbd5e1' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right / main area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Logo (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, background: '#0f172a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="7" width="22" height="13" rx="2" stroke="#fff" strokeWidth="1.6"/>
                <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
                <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="1.6"/>
              </svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>FleetOps</span>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step >= s ? '#2563eb' : '#e2e8f0',
                      color: step >= s ? '#fff' : '#94a3b8',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {step > s ? <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> : s}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: step === s ? 600 : 400, color: step === s ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                      {s === 1 ? 'Your Account' : 'Your Organization'}
                    </span>
                  </div>
                  {s < 2 && <div style={{ flex: 1, height: 1, background: step > 1 ? '#2563eb' : '#e2e8f0', margin: '0 12px' }}/>}
                </div>
              ))}
            </div>
          )}

          {/* Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 60, height: 60, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>You're all set!</h2>
                <p style={{ fontSize: 14.5, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Your FleetOps account and organization are ready.<br/>Taking you to your dashboard…
                </p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', animation: 'pulse 1s infinite' }}/>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#93c5fd' }}/>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dbeafe' }}/>
                </div>
              </div>
            )}

            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Create your account</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px' }}>Start your free 14-day trial — no credit card required.</p>

                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={rowStyle}>
                      <label style={labelStyle}>First Name</label>
                      <input style={inputStyle} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required autoFocus/>
                    </div>
                    <div style={rowStyle}>
                      <label style={labelStyle}>Last Name</label>
                      <input style={inputStyle} type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required/>
                    </div>
                  </div>
                  <div style={rowStyle}>
                    <label style={labelStyle}>Work Email</label>
                    <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@transitagency.gov" required/>
                  </div>
                  <div style={rowStyle}>
                    <label style={labelStyle}>Password</label>
                    <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required/>
                  </div>
                  <div style={rowStyle}>
                    <label style={labelStyle}>Confirm Password</label>
                    <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required/>
                  </div>

                  {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>
                  )}

                  <button type="submit" style={{ marginTop: 4, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Continue →
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: Organization ── */}
            {step === 2 && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Set up your organization</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px' }}>Tell us about your transit agency or fleet operator.</p>

                <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={rowStyle}>
                    <label style={labelStyle}>Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input style={inputStyle} type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Metro Transit Authority" required autoFocus/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={rowStyle}>
                      <label style={labelStyle}>State <span style={{ color: '#ef4444' }}>*</span></label>
                      <select style={{ ...inputStyle, background: '#fff' }} value={state} onChange={e => setState(e.target.value)} required>
                        <option value="">Select state…</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={rowStyle}>
                      <label style={labelStyle}>Fleet Size <span style={{ color: '#ef4444' }}>*</span></label>
                      <select style={{ ...inputStyle, background: '#fff' }} value={fleetSize} onChange={e => setFleetSize(e.target.value)} required>
                        <option value="">Select range…</option>
                        {FLEET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={rowStyle}>
                    <label style={labelStyle}>Phone Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                    <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000"/>
                  </div>

                  {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => { setStep(1); setError('') }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {loading ? 'Creating your account…' : 'Create Account →'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {step < 3 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
