import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { LogoFull } from '@/components/Logo'

export default async function Home() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoFull size={36} showTagline />
          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', padding: '9px 18px', borderRadius: 8, transition: 'background 0.15s' }}>Sign In</Link>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', padding: '10px 22px', borderRadius: 9, textDecoration: 'none', boxShadow: '0 2px 10px rgba(37,99,235,0.4)', letterSpacing: '-0.01em' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(170deg, #f0f7ff 0%, #e8f0fe 40%, #f8faff 100%)', padding: '96px 32px 88px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #dbeafe 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' }}/>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 24, marginBottom: 32, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(37,99,235,0.1)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', display: 'inline-block', boxShadow: '0 0 0 2px rgba(37,99,235,0.25)' }}/>
            Trusted by Transit Agencies Worldwide
          </div>
          <h1 style={{ fontSize: 62, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.045em', lineHeight: 1.06, margin: '0 0 24px' }}>
            From Issue to<br/>
            <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Resolution.</span>
          </h1>
          <p style={{ fontSize: 20, color: '#475569', lineHeight: 1.65, margin: '0 0 44px', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
            The complete fleet management platform for transit agencies. Track every bus, manage work orders, and keep your fleet moving — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', padding: '15px 34px', borderRadius: 11, textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.4)', letterSpacing: '-0.01em' }}>
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#0f172a', background: '#fff', padding: '15px 28px', borderRadius: 11, textDecoration: 'none', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              Sign In to Your Account
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 16 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              No credit card required
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 16 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              10 buses free
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Cancel anytime
            </span>
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#0f172a', padding: '40px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, textAlign: 'center' }}>
          {[
            { value: '500+', label: 'Agencies Onboarded' },
            { value: '10,000+', label: 'Buses Tracked' },
            { value: '99.9%', label: 'Platform Uptime' },
            { value: '< 1 min', label: 'Avg. Report Time' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '8px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '88px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 14px' }}>The complete work order workflow</h2>
            <p style={{ fontSize: 17, color: '#64748b', margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>Three roles, one streamlined process — from breakdown to back in service.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {[
              {
                step: '01',
                role: 'Dispatch',
                color: '#ef4444',
                bg: '#fef2f2',
                border: '#fecaca',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                ),
                title: 'Report a breakdown',
                desc: 'Dispatcher logs the bus out of service — date, location, problem description. A work order is created automatically.',
                tags: ['Date Out of Service', 'Auto Work Order', 'Status → OOS'],
              },
              {
                step: '02',
                role: 'Maintenance',
                color: '#f97316',
                bg: '#fff7ed',
                border: '#fed7aa',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                ),
                title: 'Complete the repair',
                desc: 'Maintenance team fills in system, repair time, costs, and comments. Work order tracks every detail of the repair.',
                tags: ['Labour & Parts Cost', 'Bus System', 'Repair Time'],
              },
              {
                step: '03',
                role: 'Back in Service',
                color: '#16a34a',
                bg: '#f0fdf4',
                border: '#bbf7d0',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ),
                title: 'Return to service',
                desc: 'Set the back-in-service date — work order closes automatically, bus status updates to Returned to Service.',
                tags: ['Auto WO Close', 'Status → RS', 'Full Audit Trail'],
              },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: item.bg, border: `1px solid ${item.border}`, color: item.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.role}
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.05em', position: 'absolute', top: 16, right: 24, lineHeight: 1 }}>{item.step}</div>
                <div style={{ width: 48, height: 48, background: item.bg, border: `1px solid ${item.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.65 }}>{item.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11.5, fontWeight: 600, color: item.color, background: item.bg, border: `1px solid ${item.border}`, padding: '3px 10px', borderRadius: 6 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '80px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Platform Features</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 14px' }}>Everything your agency needs</h2>
            <p style={{ fontSize: 17, color: '#64748b', margin: 0, lineHeight: 1.6 }}>Built specifically for transit operations teams — dispatchers, maintenance, and management.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                color: '#2563eb',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                title: 'Live Fleet Status',
                desc: 'Real-time visibility across your entire fleet. Every bus status — In Service, OOS, Under Repair — updated the moment it changes.',
              },
              {
                color: '#7c3aed',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
                title: 'Visual Fleet Board',
                desc: 'Color-coded grid view of your full fleet. Instantly spot which buses are available and which need attention.',
              },
              {
                color: '#0891b2',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
                title: 'Automated Work Orders',
                desc: 'Work orders created automatically when a bus goes out of service. No manual entry — no missed paperwork.',
              },
              {
                color: '#16a34a',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                title: 'PDF & CSV Reports',
                desc: 'Generate professional fleet reports in seconds. Export work order history, costs, and status summaries for any period.',
              },
              {
                color: '#d97706',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                title: 'Cost Tracking',
                desc: 'Track labour and parts costs per work order. Get a clear picture of maintenance spend across your whole fleet.',
              },
              {
                color: '#db2777',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Role-Based Access',
                desc: 'Admin, Dispatch, Maintenance, and View-Only roles. Each team member sees exactly what they need — nothing more.',
              },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ width: 46, height: 46, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles Section ── */}
      <section style={{ padding: '80px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Built for Every Role</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 14px' }}>The right tool for every team member</h2>
            <p style={{ fontSize: 17, color: '#64748b', margin: 0, lineHeight: 1.6 }}>Each role has purpose-built access — no training required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { role: 'Admin', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'Full fleet control. Manage buses, users, view all reports, and oversee the entire operation.', perms: ['Manage all buses', 'Invite & manage users', 'View all reports', 'All access'] },
              { role: 'Dispatch', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', desc: 'Report and manage bus outages. Set out-of-service dates and trigger the work order workflow.', perms: ['Report breakdowns', 'Set OOS date', 'Auto-create WO', 'Update location'] },
              { role: 'Maintenance', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', desc: 'Complete work orders. Log repair details, costs, and mark buses back in service when done.', perms: ['Fill work orders', 'Log repair costs', 'Set back-in-service', 'Close work orders'] },
              { role: 'View Only', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', desc: 'Read-only access for management and auditors. View fleet status and reports without making changes.', perms: ['View fleet status', 'View work orders', 'View reports', 'No edit access'] },
            ].map((r, i) => (
              <div key={i} style={{ background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: 14, padding: '26px 22px' }}>
                <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: r.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{r.role}</div>
                <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>{r.desc}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.perms.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get Started Steps ── */}
      <section style={{ padding: '80px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Get Started</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 14px' }}>Up and running in minutes</h2>
            <p style={{ fontSize: 17, color: '#64748b', margin: 0, lineHeight: 1.6 }}>No IT department required. Set up your fleet in three simple steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, position: 'relative' }}>
            {[
              { step: '1', title: 'Create your account', desc: 'Sign up with your work email. Your organization is set up automatically — ready in under two minutes.' },
              { step: '2', title: 'Add your fleet', desc: 'Enter bus IDs and starting statuses. Assign manufacturers, locations, and any buses already out of service.' },
              { step: '3', title: 'Invite your team', desc: 'Add dispatchers, maintenance staff, and managers. Assign the right role to each person and you\'re live.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)', padding: '88px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#93c5fd', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 24, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }}/>
            Start for Free Today
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.1 }}>
            Ready to modernize<br/>your fleet management?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', margin: '0 0 36px', lineHeight: 1.65, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Join transit agencies worldwide using Trackitlio to track every bus, manage every repair, and generate every report — all in one platform.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1e40af', background: '#fff', padding: '15px 36px', borderRadius: 11, textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.25)', letterSpacing: '-0.01em' }}>
              Start Your Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', padding: '15px 28px', borderRadius: 11, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20, marginBottom: 0 }}>No credit card required · 10 buses free · Upgrade anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0a0f1e', padding: '40px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
            {/* Brand */}
            <div style={{ maxWidth: 280 }}>
              <div style={{ marginBottom: 12 }}>
                <LogoFull size={32} darkBg showTagline />
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.65 }}>Built for transit agencies worldwide.</p>
            </div>
            {/* Links */}
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Product</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link href="/signup" style={{ fontSize: 13.5, color: '#64748b', textDecoration: 'none' }}>Get Started</Link>
                  <Link href="/login" style={{ fontSize: 13.5, color: '#64748b', textDecoration: 'none' }}>Sign In</Link>
                  <Link href="/upgrade" style={{ fontSize: 13.5, color: '#64748b', textDecoration: 'none' }}>Pricing</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12.5, color: '#334155' }}>© {new Date().getFullYear()} Trackitlio. All rights reserved.</span>
            <span style={{ fontSize: 12.5, color: '#334155' }}>Fleet Management · From Issue to Resolution</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
