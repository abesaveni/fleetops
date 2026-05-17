export default function NoAccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f9', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: '#0f172a', borderRadius: 16, marginBottom: 16, boxShadow: '0 4px 16px rgba(15,23,42,0.25)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="7" width="22" height="13" rx="2" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
              <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
              <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="1.5"/>
              <path d="M8 11h8M8 14h5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 5px', color: '#0f172a' }}>FleetOps</h1>
          <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>Bus Fleet Management Platform</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#fef2f2', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#0f172a', letterSpacing: '-0.01em' }}>Access Denied</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
            Your account is not active or has been suspended.<br/>
            Contact your administrator to regain access.
          </p>
          <a href="/login" className="btn btn-primary" style={{ textDecoration: 'none', justifyContent: 'center', padding: '11px 16px', fontSize: 14, fontWeight: 600, display: 'flex' }}>
            Back to Login
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: '#94a3b8', marginTop: 20 }}>
          Access is granted by your administrator.
        </p>
      </div>
    </div>
  )
}
