'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export default function BusLimitBanner() {
  const router    = useRouter()
  const { user }  = useUser()

  if (!user || user.bus_limit === null) return null  // unlimited plan

  const { bus_count, bus_limit, plan } = user
  const count   = bus_count ?? 0
  const pct     = Math.min((count / bus_limit) * 100, 100)
  const atLimit = count >= bus_limit
  const nearLimit = !atLimit && pct >= 80

  if (!atLimit && !nearLimit) return null   // no banner below 80%

  const barColor   = atLimit ? '#ef4444' : '#f59e0b'
  const bgColor    = atLimit ? '#fef2f2' : '#fffbeb'
  const borderColor = atLimit ? '#fecaca' : '#fde68a'
  const textColor  = atLimit ? '#991b1b' : '#92400e'

  return (
    <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 10, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2" strokeLinecap="round">
            {atLimit
              ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
            }
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>
            {atLimit
              ? `You've reached your free limit of ${bus_limit} buses.`
              : `Approaching your ${bus_limit}-bus limit — ${bus_limit - count} spot${bus_limit - count === 1 ? '' : 's'} remaining.`
            }
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 5, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden', maxWidth: 320 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 0.5s ease' }}/>
        </div>
        <div style={{ fontSize: 11, color: textColor, marginTop: 4, opacity: 0.8 }}>
          {count} of {bus_limit} buses used
        </div>
      </div>
      {plan === 'trial' || plan === 'starter' ? (
        <button
          onClick={() => router.push('/upgrade')}
          style={{ padding: '9px 20px', background: atLimit ? '#ef4444' : '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {atLimit ? 'Upgrade Now →' : 'View Plans →'}
        </button>
      ) : null}
    </div>
  )
}
