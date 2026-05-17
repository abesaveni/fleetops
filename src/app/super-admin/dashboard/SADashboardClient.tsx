'use client'
import { useRouter } from 'next/navigation'
import type { Organization } from '@/types'

interface Stats {
  totalOrgs: number; activeOrgs: number; suspendedOrgs: number; trialOrgs: number
  totalBuses: number; busesIS: number; busesOOS: number
}

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default function SADashboardClient({ stats, orgs }: { stats: Stats; orgs: Organization[] }) {
  const router = useRouter()

  const kpis = [
    { label: 'Total Organizations', value: stats.totalOrgs,     color: '#2563eb', bg: '#eff6ff', icon: '🏢' },
    { label: 'Active',              value: stats.activeOrgs,    color: '#16a34a', bg: '#f0fdf4', icon: '✓' },
    { label: 'Suspended',           value: stats.suspendedOrgs, color: '#dc2626', bg: '#fef2f2', icon: '⊘' },
    { label: 'Trial',               value: stats.trialOrgs,     color: '#d97706', bg: '#fffbeb', icon: '⏱' },
    { label: 'Total Buses',         value: stats.totalBuses,    color: '#7c3aed', bg: '#f5f3ff', icon: '🚌' },
    { label: 'In Service',          value: stats.busesIS,       color: '#16a34a', bg: '#f0fdf4', icon: '⚡' },
    { label: 'Out of Service',      value: stats.busesOOS,      color: '#dc2626', bg: '#fef2f2', icon: '⚠' },
  ]

  const recent = orgs.slice(0, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 600 }}>Super Admin</p>
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Platform Overview</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '3px 0 0' }}>{stats.totalOrgs} organizations · {stats.totalBuses} buses total</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: 13, padding: '8px 16px' }}
          onClick={() => router.push('/super-admin/organizations/new')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Organization
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.color, borderRadius: '9999px 9999px 0 0', margin: '-14px -16px 0' }}/>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4, fontWeight: 500 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent organizations */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Recent Organizations</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: '#94a3b8' }}>Latest {recent.length}</span>
          </div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => router.push('/super-admin/organizations')}>
            View all →
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state"><p>No organizations yet. Create the first one.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map(org => (
                <tr key={org.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/super-admin/organizations/${org.id}`)}>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{org.name}</td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{org.owner_email}</td>
                  <td style={{ color: '#475569', fontSize: 13, textTransform: 'capitalize' }}>{org.plan}</td>
                  <td>
                    <span className={`status-pill status-${org.status}`}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                      {org.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(org.created_at)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '3px 10px' }}
                      onClick={e => { e.stopPropagation(); router.push(`/super-admin/organizations/${org.id}`) }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
