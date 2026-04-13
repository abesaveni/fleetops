export default function NoAccessPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ width:64, height:64, background:'#fee2e2', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:'0 0 10px' }}>No Access</h1>
        <p style={{ fontSize:15, color:'var(--text-secondary)', margin:'0 0 28px', lineHeight:1.6 }}>Your account is not active. Contact your administrator to get access.</p>
        <a href="/login" className="btn btn-primary" style={{ textDecoration:'none' }}>Back to Login</a>
      </div>
    </div>
  )
}
