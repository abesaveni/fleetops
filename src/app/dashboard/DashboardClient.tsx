'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { BusRecord } from '@/types'
import StatusBadge from '@/components/StatusBadge'

interface Props {
  counts: { total:number; IS:number; OOS:number; InPro:number; WP:number }
  buses:  BusRecord[]
}

const IconBus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
    <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconWrench = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconArrow = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const STAT_CONFIG = [
  { key:'total', label:'Total Buses',    sub:'Fleet size',        icon: IconBus,    accent:'#3b82f6', bg:'#eff6ff', iconBg:'#dbeafe' },
  { key:'IS',    label:'In Service',     sub:'Operational',       icon: IconCheck,  accent:'#16a34a', bg:'#f0fdf4', iconBg:'#dcfce7' },
  { key:'OOS',   label:'Out of Service', sub:'Need attention',    icon: IconAlert,  accent:'#dc2626', bg:'#fef2f2', iconBg:'#fee2e2' },
  { key:'InPro', label:'Under Repair',   sub:'In maintenance',    icon: IconWrench, accent:'#ea580c', bg:'#fff7ed', iconBg:'#ffedd5' },
  { key:'WP',    label:'Pending',        sub:'Awaiting sign-off', icon: IconClock,  accent:'#7c3aed', bg:'#f5f3ff', iconBg:'#ede9fe' },
]

const STATUS_COLORS: Record<string,string> = { IS:'#22c55e', OOS:'#ef4444', InPro:'#f97316', WP:'#3b82f6' }
const PIE_DATA = [
  { key:'IS',    name:'In Service',     color:'#22c55e' },
  { key:'OOS',   name:'Out of Service', color:'#ef4444' },
  { key:'InPro', name:'Under Repair',   color:'#f97316' },
  { key:'WP',    name:'Pending',        color:'#3b82f6' },
]

function fmt(d: string|null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

function DonutCenter({ viewBox, pct }: { viewBox?: { cx:number; cy:number }; pct:number }) {
  const { cx, cy } = viewBox ?? { cx:0, cy:0 }
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-5" fontSize="17" fontWeight="700" fill="#0f172a">{pct}%</tspan>
      <tspan x={cx} dy="16" fontSize="9" fontWeight="400" fill="#94a3b8">operational</tspan>
    </text>
  )
}

/* Reusable card title style */
const sectionTitle = { fontSize:13, fontWeight:600, color:'#0f172a', fontFamily:'var(--font-body)' } as const
const mutedLabel   = { fontSize:11, color:'#94a3b8', fontWeight:400 } as const

export default function DashboardClient({ counts, buses }: Props) {
  const router = useRouter()
  const healthPct = counts.total > 0 ? Math.round((counts.IS / counts.total) * 100) : 0

  const pieData = useMemo(() =>
    PIE_DATA.map(d => ({ ...d, value: counts[d.key as keyof typeof counts] })).filter(d => d.value > 0),
    [counts]
  )
  const attention = useMemo(() => buses.filter(b => b.bus_status !== 'IS').slice(0, 6), [buses])
  const recent    = useMemo(() => buses.slice(0, 7), [buses])
  const today     = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <p style={{ ...mutedLabel, margin:'0 0 4px', letterSpacing:'0.04em', textTransform:'uppercase' }}>{today}</p>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0, letterSpacing:'-0.02em', color:'#0f172a', fontFamily:'var(--font-body)' }}>Fleet Overview</h1>
          <p style={{ fontSize:12, color:'#64748b', margin:'3px 0 0', fontWeight:400 }}>
            {counts.IS} of {counts.total} buses operational &middot; {healthPct}% fleet availability
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" style={{ fontSize:12, padding:'6px 12px', fontWeight:500 }} onClick={() => router.push('/fleet-board')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
            Fleet Board
          </button>
          <button className="btn btn-primary" style={{ fontSize:12, padding:'6px 12px', fontWeight:500 }} onClick={() => router.push('/buses/new')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Bus
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10 }}>
        {STAT_CONFIG.map(({ key, label, sub, icon: Icon, accent, bg, iconBg }) => {
          const val = counts[key as keyof typeof counts]
          const pct = counts.total > 0 && key !== 'total' ? Math.round((val / counts.total) * 100) : null
          return (
            <button
              key={key}
              onClick={() => router.push(key === 'total' ? '/buses' : `/buses?status=${key}`)}
              style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 16px', textAlign:'left', cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s', position:'relative', overflow:'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.07)` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:accent }}/>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10, marginTop:2 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
                  <Icon/>
                </div>
                {pct !== null && (
                  <span style={{ fontSize:10, fontWeight:500, color:accent, background:bg, padding:'2px 6px', borderRadius:9999 }}>{pct}%</span>
                )}
              </div>
              <div style={{ fontSize:24, fontWeight:700, color:'#0f172a', lineHeight:1, letterSpacing:'-0.03em', marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:12, fontWeight:500, color:'#334155', marginBottom:1 }}>{label}</div>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:400 }}>{sub}</div>
            </button>
          )
        })}
      </div>

      {/* Middle row */}
      <div style={{ display:'grid', gridTemplateColumns:'210px 1fr 1fr', gap:12 }}>

        {/* Donut */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'16px 14px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
            <span style={sectionTitle}>Fleet Split</span>
          </div>
          {counts.total === 0 ? (
            <div style={{ padding:'30px 0', fontSize:12, color:'#94a3b8', textAlign:'center' }}>No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={145}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={62} dataKey="value" paddingAngle={2} stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    <DonutCenter viewBox={{ cx: 105, cy: 72 }} pct={healthPct}/>
                  </Pie>
                  <Tooltip
                    contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, padding:'8px 12px', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', fontFamily:'var(--font-body)' }}
                    labelStyle={{ display:'none' }}
                    itemStyle={{ color:'#0f172a', fontWeight:500 }}
                    formatter={(v: number, name: string) => [`${v} buses`, name]}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:2 }}>
                {pieData.map(d => (
                  <div key={d.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:d.color, display:'inline-block', flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:'#64748b', fontWeight:400 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:'#0f172a' }}>{counts[d.key as keyof typeof counts]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status bars */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <span style={sectionTitle}>Status Breakdown</span>
            <span style={mutedLabel}>{counts.total} buses total</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {[
              { key:'IS',    label:'In Service',     color:'#22c55e', bg:'#dcfce7', textColor:'#15803d' },
              { key:'OOS',   label:'Out of Service', color:'#ef4444', bg:'#fee2e2', textColor:'#b91c1c' },
              { key:'InPro', label:'Under Repair',   color:'#f97316', bg:'#ffedd5', textColor:'#c2410c' },
              { key:'WP',    label:'Pending',        color:'#3b82f6', bg:'#dbeafe', textColor:'#1d4ed8' },
            ].map(({ key, label, color, bg, textColor }) => {
              const val = counts[key as keyof typeof counts]
              const pct = counts.total > 0 ? (val / counts.total) * 100 : 0
              return (
                <div key={key}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block' }}/>
                      <span style={{ fontSize:12, fontWeight:400, color:'#334155' }}>{label}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{val}</span>
                      <span style={{ fontSize:10, fontWeight:500, color:textColor, background:bg, padding:'1px 6px', borderRadius:9999 }}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div style={{ height:4, borderRadius:9999, background:'#f1f5f9', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:9999, transition:'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop:18, paddingTop:14, borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:500, marginBottom:3 }}>Fleet Health Score</div>
              <div style={{ fontSize:18, fontWeight:700, color: healthPct >= 70 ? '#15803d' : healthPct >= 50 ? '#c2410c' : '#b91c1c', letterSpacing:'-0.02em' }}>
                {healthPct}%
                <span style={{ fontSize:11, fontWeight:400, color:'#94a3b8', marginLeft:5 }}>availability</span>
              </div>
            </div>
            <div style={{ width:36, height:36, borderRadius:'50%', background: healthPct >= 70 ? '#f0fdf4' : healthPct >= 50 ? '#fff7ed' : '#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={healthPct >= 70 ? '#16a34a' : healthPct >= 50 ? '#ea580c' : '#dc2626'} strokeWidth="2" strokeLinecap="round">
                {healthPct >= 70
                  ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                  : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                }
              </svg>
            </div>
          </div>
        </div>

        {/* Needs attention */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'16px 18px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span style={sectionTitle}>Needs Attention</span>
            <span style={{ fontSize:10, background:'#fee2e2', color:'#b91c1c', padding:'2px 8px', borderRadius:9999, fontWeight:500 }}>
              {counts.OOS + counts.InPro + counts.WP} buses
            </span>
          </div>
          {attention.length === 0 ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px 0' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:6 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ fontSize:12, color:'#94a3b8', fontWeight:400 }}>All buses operational</span>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1, overflowY:'auto' }}>
              {attention.map(bus => {
                const color = STATUS_COLORS[bus.bus_status] ?? '#94a3b8'
                const bgMap: Record<string,string> = { OOS:'#fff5f5', InPro:'#fff8f0', WP:'#f5f8ff' }
                return (
                  <button
                    key={bus.id}
                    onClick={() => router.push(`/buses/${bus.id}`)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, background:bgMap[bus.bus_status]??'#f8fafc', border:`1px solid ${color}18`, cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left', transition:'background 0.1s', width:'100%' }}
                    onMouseEnter={e => { e.currentTarget.style.background = bgMap[bus.bus_status] ?? '#f1f5f9' }}
                    onMouseLeave={e => { e.currentTarget.style.background = bgMap[bus.bus_status] ?? '#f8fafc' }}
                  >
                    <span style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block' }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:12, color:'#0f172a' }}>{bus.bus_id}</div>
                      <div style={{ fontSize:10, color:'#64748b', fontWeight:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {bus.problem_description ?? bus.maintenance_comments ?? bus.bus_system ?? '—'}
                      </div>
                    </div>
                    <IconArrow/>
                  </button>
                )
              })}
            </div>
          )}
          {attention.length > 0 && (
            <button className="btn btn-secondary" style={{ marginTop:10, justifyContent:'center', fontSize:12, padding:'6px 12px', fontWeight:500 }} onClick={() => router.push('/buses?status=OOS')}>
              View all issues
            </button>
          )}
        </div>
      </div>

      {/* Recent buses table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'12px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={sectionTitle}>Recent Buses</span>
            <span style={mutedLabel}>Latest {Math.min(7, buses.length)} records</span>
          </div>
          <button className="btn btn-secondary" style={{ padding:'4px 12px', fontSize:12, display:'flex', alignItems:'center', gap:5, fontWeight:500 }} onClick={() => router.push('/buses')}>
            View all <IconArrow/>
          </button>
        </div>
        {buses.length === 0 ? (
          <div className="empty-state">No buses added yet</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Bus ID','Status','System','Location','OOS Date','BIS Date'].map(h => (
                  <th key={h} style={{ padding:'8px 16px', textAlign:'left', fontSize:10, fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((bus, i) => (
                <tr
                  key={bus.id}
                  onClick={() => router.push(`/buses/${bus.id}`)}
                  style={{ cursor:'pointer', transition:'background 0.1s', borderBottom: i < recent.length-1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/></svg>
                      </div>
                      <span style={{ fontWeight:600, color:'#1d6fce', fontSize:12 }}>{bus.bus_id}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px' }}><StatusBadge status={bus.bus_status}/></td>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'#475569', fontWeight:400 }}>{bus.bus_system ?? '—'}</td>
                  <td style={{ padding:'10px 16px', fontSize:12, color:'#475569', fontWeight:400 }}>{bus.location ?? '—'}</td>
                  <td style={{ padding:'10px 16px', fontSize:11, color:'#94a3b8', fontWeight:400 }}>{fmt(bus.out_of_service_date)}</td>
                  <td style={{ padding:'10px 16px', fontSize:11, color:'#94a3b8', fontWeight:400 }}>{fmt(bus.back_in_service_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
