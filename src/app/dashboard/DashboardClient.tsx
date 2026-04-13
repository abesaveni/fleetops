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

/* ── icons ── */
const IconBus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
    <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconWrench = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const STAT_CONFIG = [
  { key:'total', label:'Total Buses',          sub:'Fleet size',             icon: IconBus,   accent:'#1d6fce', bg:'#eff6ff', iconBg:'#dbeafe' },
  { key:'IS',    label:'In Service',            sub:'Operational',            icon: IconCheck, accent:'#16a34a', bg:'#f0fdf4', iconBg:'#dcfce7' },
  { key:'OOS',   label:'Out of Service',        sub:'Need attention',         icon: IconAlert, accent:'#dc2626', bg:'#fef2f2', iconBg:'#fee2e2' },
  { key:'InPro', label:'Under Repair',          sub:'In maintenance bay',     icon: IconWrench,accent:'#ea580c', bg:'#fff7ed', iconBg:'#ffedd5' },
  { key:'WP',    label:'Pending Commissioning', sub:'Awaiting sign-off',      icon: IconClock, accent:'#2563eb', bg:'#eff6ff', iconBg:'#dbeafe' },
]

const STATUS_COLORS: Record<string,string> = { IS:'#22c55e', OOS:'#ef4444', InPro:'#f97316', WP:'#3b82f6' }
const PIE_DATA = [
  { key:'IS',    name:'In Service',            color:'#22c55e' },
  { key:'OOS',   name:'Out of Service',        color:'#ef4444' },
  { key:'InPro', name:'Under Repair',          color:'#f97316' },
  { key:'WP',    name:'Pending',               color:'#3b82f6' },
]

function fmt(d: string|null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

/* ── custom donut centre label ── */
function DonutCenter({ viewBox, pct }: any) {
  const { cx, cy } = viewBox ?? {}
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" fontSize="22" fontWeight="800" fill="#0f172a">{pct}%</tspan>
      <tspan x={cx} dy="20"  fontSize="10" fill="#94a3b8">In Service</tspan>
    </text>
  )
}

export default function DashboardClient({ counts, buses }: Props) {
  const router = useRouter()

  const healthPct = counts.total > 0 ? Math.round((counts.IS / counts.total) * 100) : 0

  const pieData = useMemo(() =>
    PIE_DATA.map(d => ({ ...d, value: counts[d.key as keyof typeof counts] })).filter(d => d.value > 0),
    [counts]
  )

  const attention = useMemo(() =>
    buses.filter(b => b.bus_status !== 'IS').slice(0, 6),
    [buses]
  )

  const recent = useMemo(() => buses.slice(0, 7), [buses])

  const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 4px', letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:500 }}>{today}</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, margin:0, letterSpacing:'-0.03em', color:'var(--text-primary)' }}>
            Fleet Overview
          </h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)', margin:'4px 0 0' }}>
            {counts.IS} of {counts.total} buses operational · {healthPct}% fleet availability
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary" onClick={() => router.push('/fleet-board')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
            Fleet Board
          </button>
          <button className="btn btn-primary" onClick={() => router.push('/buses/new')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Bus
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14 }}>
        {STAT_CONFIG.map(({ key, label, sub, icon: Icon, accent, bg, iconBg }) => {
          const val = counts[key as keyof typeof counts]
          const pct = counts.total > 0 && key !== 'total' ? Math.round((val / counts.total) * 100) : null
          return (
            <button
              key={key}
              onClick={() => router.push(key === 'total' ? '/buses' : `/buses?status=${key}`)}
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'18px 20px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', position:'relative', overflow:'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor=accent }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)' }}
            >
              {/* Accent strip */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent, borderRadius:'16px 16px 0 0' }}/>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, marginTop:6 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
                  <Icon/>
                </div>
                {pct !== null && (
                  <span style={{ fontSize:11, fontWeight:600, color:accent, background:bg, padding:'2px 8px', borderRadius:9999 }}>{pct}%</span>
                )}
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1, letterSpacing:'-0.04em', marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{sub}</div>
            </button>
          )
        })}
      </div>

      {/* ── Middle row: chart + status bars + attention ── */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 1fr', gap:16 }}>

        {/* Donut chart */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700 }}>Fleet Split</span>
          </div>
          {counts.total === 0 ? (
            <div className="empty-state" style={{ padding:'40px 0', fontSize:13 }}>No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={54} outerRadius={78} dataKey="value" paddingAngle={3} stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    <DonutCenter viewBox={{ cx: 130, cy: 85 }} pct={healthPct}/>
                  </Pie>
                  <Tooltip
                    contentStyle={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}
                    labelStyle={{ display:'none' }}
                    itemStyle={{ color:'#0f172a', fontWeight:600, padding:'2px 0' }}
                    formatter={(v: number, name: string) => [`${v} buses`, name]}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
                {pieData.map(d => (
                  <div key={d.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:d.color, display:'inline-block', flexShrink:0 }}/>
                      <span style={{ color:'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{counts[d.key as keyof typeof counts]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status progress bars */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700 }}>Status Breakdown</span>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{counts.total} total</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {[
              { key:'IS',    label:'In Service',            color:'#22c55e', bg:'#dcfce7', textColor:'#166534' },
              { key:'OOS',   label:'Out of Service',        color:'#ef4444', bg:'#fee2e2', textColor:'#991b1b' },
              { key:'InPro', label:'Under Repair',          color:'#f97316', bg:'#ffedd5', textColor:'#9a3412' },
              { key:'WP',    label:'Pending Commissioning', color:'#3b82f6', bg:'#dbeafe', textColor:'#1e40af' },
            ].map(({ key, label, color, bg, textColor }) => {
              const val = counts[key as keyof typeof counts]
              const pct = counts.total > 0 ? (val / counts.total) * 100 : 0
              return (
                <div key={key}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ width:9, height:9, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block' }}/>
                      <span style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{label}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, color:'var(--text-primary)' }}>{val}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:textColor, background:bg, padding:'2px 8px', borderRadius:9999, minWidth:38, textAlign:'center' }}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div style={{ height:7, borderRadius:9999, background:'var(--surface-2)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:9999, transition:'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fleet health score */}
          <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginBottom:3 }}>Fleet Health</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color: healthPct >= 70 ? '#16a34a' : healthPct >= 50 ? '#ea580c' : '#dc2626' }}>
                {healthPct}%
                <span style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', marginLeft:6 }}>availability</span>
              </div>
            </div>
            <div style={{ width:52, height:52, borderRadius:'50%', background: healthPct >= 70 ? '#f0fdf4' : healthPct >= 50 ? '#fff7ed' : '#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={healthPct >= 70 ? '#16a34a' : healthPct >= 50 ? '#ea580c' : '#dc2626'} strokeWidth="2" strokeLinecap="round">
                {healthPct >= 70
                  ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                  : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                }
              </svg>
            </div>
          </div>
        </div>

        {/* Needs attention */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 22px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700 }}>Needs Attention</span>
            <span style={{ fontSize:11, background:'#fee2e2', color:'#991b1b', padding:'2px 10px', borderRadius:9999, fontWeight:600 }}>
              {counts.OOS + counts.InPro + counts.WP} buses
            </span>
          </div>
          {attention.length === 0 ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 0', color:'var(--text-muted)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom:8 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ fontSize:13 }}>All buses operational</span>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1, overflowY:'auto' }}>
              {attention.map(bus => {
                const color = STATUS_COLORS[bus.bus_status] ?? '#94a3b8'
                const bgMap: Record<string,string> = { OOS:'#fef2f2', InPro:'#fff7ed', WP:'#eff6ff' }
                return (
                  <button
                    key={bus.id}
                    onClick={() => router.push(`/buses/${bus.id}`)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:bgMap[bus.bus_status]??'var(--surface-2)', border:`1px solid ${color}22`, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateX(3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateX(0)' }}
                  >
                    <span style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0, display:'inline-block', boxShadow:`0 0 0 3px ${color}33` }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>{bus.bus_id}</div>
                      <div style={{ fontSize:11, color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
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
            <button className="btn btn-secondary" style={{ marginTop:14, justifyContent:'center', fontSize:13 }} onClick={() => router.push('/buses?status=OOS')}>
              View all issues
            </button>
          )}
        </div>
      </div>

      {/* ── Recent buses table ── */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700 }}>Recent Buses</span>
            <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:10 }}>Latest {Math.min(7, buses.length)} records</span>
          </div>
          <button className="btn btn-secondary" style={{ padding:'5px 14px', fontSize:13, display:'flex', alignItems:'center', gap:6 }} onClick={() => router.push('/buses')}>
            View all <IconArrow/>
          </button>
        </div>
        {buses.length === 0 ? (
          <div className="empty-state">No buses added yet</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                {['Bus ID','Status','System','Location','OOS Date','BIS Date'].map(h => (
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((bus, i) => (
                <tr
                  key={bus.id}
                  onClick={() => router.push(`/buses/${bus.id}`)}
                  style={{ cursor:'pointer', transition:'background 0.1s', borderBottom: i < recent.length-1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding:'13px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:'var(--brand-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"><rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/></svg>
                      </div>
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--brand)', fontSize:14 }}>{bus.bus_id}</span>
                    </div>
                  </td>
                  <td style={{ padding:'13px 20px' }}>
                    <StatusBadge status={bus.bus_status}/>
                  </td>
                  <td style={{ padding:'13px 20px', color:'var(--text-secondary)' }}>{bus.bus_system ?? '—'}</td>
                  <td style={{ padding:'13px 20px', color:'var(--text-secondary)' }}>{bus.location ?? '—'}</td>
                  <td style={{ padding:'13px 20px', color:'var(--text-secondary)', fontSize:12 }}>{fmt(bus.out_of_service_date)}</td>
                  <td style={{ padding:'13px 20px', color:'var(--text-secondary)', fontSize:12 }}>{fmt(bus.back_in_service_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
