import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function Home() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#0f172a', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="7" width="22" height="13" rx="2" stroke="#fff" strokeWidth="1.6"/>
                <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
                <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="1.6"/>
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>FleetOps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', padding: '8px 16px' }}>Sign In</Link>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', padding: '9px 20px', borderRadius: 8, textDecoration: 'none' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(160deg, #f8faff 0%, #eef3ff 50%, #f0f4f9 100%)', padding: '80px 24px 72px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#dbeafe', color: '#1d4ed8', fontSize: 12.5, fontWeight: 600, padding: '5px 14px', borderRadius: 20, marginBottom: 28, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}/>
            Built for U.S. Transit Agencies
          </div>
          <h1 style={{ fontSize: 54, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px' }}>
            Fleet Operations,<br/><span style={{ color: '#2563eb' }}>Simplified.</span>
          </h1>
          <p style={{ fontSize: 19, color: '#475569', lineHeight: 1.65, margin: '0 0 40px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Track every bus in real time. Monitor service status, manage maintenance, and generate reports — all in one platform built for transit professionals.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ fontSize: 15, fontWeight: 700, color: '#fff', background: '#2563eb', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
              Start Free Trial →
            </Link>
            <Link href="/login" style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', background: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              Sign In
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 18 }}>No credit card required &nbsp;·&nbsp; Free 14-day trial &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#0f172a', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, textAlign: 'center' }}>
          {[
            { value: '10,000+', label: 'Buses Tracked' },
            { value: '99.9%', label: 'Platform Uptime' },
            { value: '< 1 min', label: 'Avg. Report Time' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 24px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Everything your team needs</h2>
            <p style={{ fontSize: 16.5, color: '#64748b', margin: 0 }}>Designed for operations managers, dispatchers, and maintenance crews.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                ),
                title: 'Real-Time Status',
                desc: 'See every bus\'s live status — In Service, Out of Service, Outfitting, or Pending — updated instantly across your entire team.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>
                  </svg>
                ),
                title: 'Visual Fleet Board',
                desc: 'A color-coded grid of your full fleet. Spot problems instantly — no spreadsheets, no hunting through lists.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                  </svg>
                ),
                title: 'Instant Reports',
                desc: 'Generate PDF and CSV fleet reports in seconds. Filter by status, export for FTA compliance or internal review.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: 'Role-Based Access',
                desc: 'Admins control the fleet; field staff update statuses. Right access for every team member — no over-provisioning.',
              },
            ].map((f, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '72px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 12px' }}>Up and running in minutes</h2>
            <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>No IT department required. Set up your fleet in three steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up with your work email and set up your agency\'s organization in under two minutes.' },
              { step: '02', title: 'Add your fleet', desc: 'Enter your bus IDs and initial statuses. Import from a spreadsheet or add them one by one.' },
              { step: '03', title: 'Invite your team', desc: 'Add dispatchers and maintenance staff. Assign roles so everyone has the right level of access.' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', letterSpacing: '0.12em', marginBottom: 10 }}>{s.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 14px' }}>Ready to modernize your fleet ops?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', lineHeight: 1.6 }}>
            Join transit agencies across the U.S. using FleetOps to stay on top of their fleet every single day.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', fontSize: 15, fontWeight: 700, color: '#1e40af', background: '#fff', padding: '14px 36px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            Start Your Free Trial →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#1e293b', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="7" width="22" height="13" rx="2" stroke="#60a5fa" strokeWidth="1.6"/>
                <circle cx="6" cy="20" r="2" fill="#60a5fa"/>
                <circle cx="18" cy="20" r="2" fill="#60a5fa"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#60a5fa" strokeWidth="1.6"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>FleetOps</span>
            <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/login" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Sign In</Link>
            <Link href="/signup" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
