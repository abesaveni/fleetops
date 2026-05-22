'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useUser } from '@/context/UserContext'

function BusUsageBar({ count, limit }: { count: number; limit: number }) {
  const pct      = Math.min((count / limit) * 100, 100)
  const atLimit  = count >= limit
  const barColor = atLimit ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#3b82f6'
  return (
    <div style={{ padding: '10px 14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Fleet Capacity</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: atLimit ? '#f87171' : 'rgba(148,163,184,0.8)' }}>{count}/{limit}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 0.4s ease' }}/>
      </div>
      {atLimit && (
        <Link href="/upgrade" style={{ display: 'block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#f59e0b', textDecoration: 'none', textAlign: 'center', background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '5px 0', border: '1px solid rgba(245,158,11,0.2)' }}>
          ⚡ Upgrade to add more buses
        </Link>
      )}
    </div>
  )
}

const BusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
    <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
  </svg>
)

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const { user } = useUser()

  const role    = user?.role    ?? ''
  const orgName = user?.org_name ?? ''
  const email   = user?.email   ?? ''
  const isAdmin = role === 'Admin'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    if (base === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(base)
  }

  const NavLink = ({ href, label, icon, sub }: { href: string; label: string; icon?: React.ReactNode; sub?: boolean }) => (
    <Link href={href} className={`nav-item${sub ? ' sub-item' : ''} ${isActive(href) ? 'active' : ''}`}>
      {icon}{label}
    </Link>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">
            <BusIcon/>
          </div>
          <div>
            <h1>FleetOps</h1>
            <p>Fleet Management</p>
          </div>
        </div>
      </div>

      {orgName && (
        <div className="sidebar-org-badge">
          <span className="sidebar-org-dot"/>
          <span className="sidebar-org-name">{orgName}</span>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        <NavLink href="/dashboard" label="Dashboard" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        }/>

        <div className="nav-section-label" style={{ marginTop: 4 }}>Fleet</div>
        <NavLink href="/fleet-board" label="Fleet Board" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>
          </svg>
        }/>
        <NavLink href="/buses"              label="All Buses"      icon={<BusIcon/>}/>
        <NavLink href="/buses?status=IS"    label="In Service"     sub icon={<span className="dot dot-IS"/>}/>
        <NavLink href="/buses?status=OOS"   label="Out of Service" sub icon={<span className="dot dot-OOS"/>}/>
        <NavLink href="/buses?status=InPro" label="Outfitting"     sub icon={<span className="dot dot-InPro"/>}/>
        <NavLink href="/buses?status=WP"    label="Pending"        sub icon={<span className="dot dot-WP"/>}/>
        <NavLink href="/buses/new" label="Add Bus" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        }/>

        <div className="nav-section-label" style={{ marginTop: 4 }}>Reports</div>
        <NavLink href="/admin/invoice" label="Fleet Report" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
          </svg>
        }/>

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: 4 }}>Admin</div>
            <NavLink href="/admin/users" label="Manage Users" icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }/>
          </>
        )}

        <div className="nav-section-label" style={{ marginTop: 4 }}>Account</div>
        <NavLink href="/settings" label="Settings" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        }/>
      </nav>

      <div className="sidebar-footer">
        {/* Show bus capacity bar for orgs with a limit */}
        {user?.bus_limit !== null && user?.bus_limit !== undefined && user.bus_count !== null && (
          <div style={{ marginBottom: 10 }}>
            <BusUsageBar count={user.bus_count ?? 0} limit={user.bus_limit}/>
          </div>
        )}
        <div className="sidebar-user-info">
          {email && <span className="sidebar-user-email" title={email}>{email}</span>}
          {role  && <span className={`role-badge role-badge-${role.toLowerCase()}`}>{role}</span>}
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ width: '100%' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
