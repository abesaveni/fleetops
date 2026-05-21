'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useState, useEffect } from 'react'

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function SuperAdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? '')
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/super-admin/dashboard') return pathname === '/super-admin/dashboard'
    return pathname.startsWith(href)
  }

  const NavLink = ({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) => (
    <Link href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
      {icon}{label}
    </Link>
  )

  return (
    <aside className="sidebar sa-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">
            <StarIcon/>
          </div>
          <div>
            <h1>FleetOps</h1>
            <p>Super Admin</p>
          </div>
        </div>
      </div>

      {/* SA badge */}
      <div className="sa-badge">
        <span className="sa-badge-dot"/>
        <span className="sa-badge-text">Super Admin</span>
      </div>

      <nav className="sidebar-nav" style={{ marginTop: 4 }}>
        <div className="nav-section-label">Platform</div>
        <NavLink href="/super-admin/dashboard" label="Dashboard" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        }/>

        <div className="nav-section-label" style={{ marginTop: 4 }}>Management</div>
        <NavLink href="/super-admin/organizations" label="Organizations" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        }/>
        <NavLink href="/super-admin/billing" label="Billing" icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        }/>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          {email && <span className="sidebar-user-email" title={email}>{email}</span>}
          <span className="role-badge role-badge-superadmin">Super Admin</span>
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
