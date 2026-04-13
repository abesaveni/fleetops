'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('user_subscriptions').select('subscription_type').eq('user_email', session.user.email!).single()
        .then(({ data }) => setIsAdmin(data?.subscription_type === 'Admin'))
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    if (base === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(base)
  }

  const navLink = (href: string, label: string, icon: React.ReactNode) => (
    <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
      {icon}{label}
    </Link>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>FleetOps</h1>
        <p>Bus Management</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        {navLink('/dashboard', 'Dashboard',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        )}

        <div className="nav-section-label">Fleet</div>
        {navLink('/fleet-board', 'Fleet Board',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="5" height="15" rx="1.5"/>
          </svg>
        )}
        {navLink('/buses', 'All Buses',
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
            <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
          </svg>
        )}
        {([['IS','In Service'],['OOS','Out of Service'],['InPro','Under Repair'],['WP','Pending']] as const).map(([s,l]) =>
          navLink(`/buses?status=${s}`, l, <span className={`dot dot-${s}`}/>)
        )}

        {isAdmin && (
          <>
            <div className="nav-section-label">Admin</div>
            {navLink('/admin/invoice', 'Invoice Generator',
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
            )}
            {navLink('/admin/users', 'User Management',
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            )}
          </>
        )}

        <div style={{ flex:1 }}/>
        <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button className="nav-item" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </nav>
    </aside>
  )
}
