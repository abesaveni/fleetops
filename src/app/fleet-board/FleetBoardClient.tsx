'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord } from '@/types'
import Toast from '@/components/Toast'

const STATUS_CONFIG = {
  IS:    { label:'In Service',            cellBg:'#16a34a', cellText:'#ffffff', legendBg:'#dcfce7', legendText:'#15803d' },
  OOS:   { label:'Out of Service',        cellBg:'#dc2626', cellText:'#ffffff', legendBg:'#fee2e2', legendText:'#b91c1c' },
  InPro: { label:'Under Repair',          cellBg:'#ea580c', cellText:'#ffffff', legendBg:'#ffedd5', legendText:'#c2410c' },
  WP:    { label:'Pending',               cellBg:'#cbd5e1', cellText:'#334155', legendBg:'#f1f5f9', legendText:'#475569' },
} as const

export default function FleetBoardClient({ buses, userRole }: { buses: BusRecord[]; userRole: string }) {
  const router  = useRouter()
  const isAdmin = userRole === 'Admin'
  const [search,    setSearch]    = useState('')
  const [toast,     setToast]     = useState<string|null>(null)
  const [exportMenu, setExportMenu] = useState(false)
  const [genPdf,    setGenPdf]    = useState(false)
  const [hovered,   setHovered]   = useState<string|null>(null)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase()
  const timeStr = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function exportCsv(busList: BusRecord[], label: string) {
    const headers = ['Bus ID','Status','Bus System','Location','Age','OOS Date','BIS Date','Problem Description','Maintenance Comments']
    const rows = busList.map(b => [
      b.bus_id, b.bus_status, b.bus_system??'', b.location??'', b.bus_age??'',
      b.out_of_service_date??'', b.back_in_service_date??'',
      (b.problem_description??'').replace(/,/g,' '), (b.maintenance_comments??'').replace(/,/g,' ')
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `FleetOps_${label}_${now.toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    showToast(`${label} CSV downloaded`)
    setExportMenu(false)
  }

  async function exportPdf(busList: BusRecord[], label: string) {
    setGenPdf(true); setExportMenu(false)
    try {
      const res  = await fetch('/api/invoice', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ buses: busList }) })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a'); a.href = url
      a.download = `FleetOps_${label}_${now.toISOString().slice(0,10)}.pdf`; a.click()
      URL.revokeObjectURL(url)
      showToast(`PDF downloaded`)
    } catch { showToast('Error generating PDF') }
    finally { setGenPdf(false) }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return buses
      .filter(b => !q || b.bus_id.toLowerCase().includes(q) || (b.bus_system??'').toLowerCase().includes(q) || (b.location??'').toLowerCase().includes(q))
      .sort((a, b) => a.bus_id.localeCompare(b.bus_id, undefined, { numeric:true }))
  }, [buses, search])

  const counts = useMemo(() => ({
    IS:    buses.filter(b => b.bus_status === 'IS').length,
    OOS:   buses.filter(b => b.bus_status === 'OOS').length,
    InPro: buses.filter(b => b.bus_status === 'InPro').length,
    WP:    buses.filter(b => b.bus_status === 'WP').length,
  }), [buses])

  const hoveredBus = hovered ? buses.find(b => b.id === hovered) : null

  return (
    <>
      {toast && <Toast message={toast}/>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0, color:'#0f172a', letterSpacing:'-0.02em' }}>Fleet Board</h1>
          <p style={{ fontSize:12, color:'#94a3b8', margin:'3px 0 0', fontWeight:400 }}>{buses.length} buses · {dateStr} · {timeStr}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="input" style={{ paddingLeft:30, width:180, fontSize:12, height:34 }}
              placeholder="Search buses…" value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Export */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => setExportMenu(!exportMenu)}
              className="btn btn-secondary"
              style={{ fontSize:12, padding:'6px 12px', height:34 }}
            >
              {genPdf ? 'Generating…' : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export</>
              )}
            </button>
            {exportMenu && (
              <div
                style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.10)', zIndex:50, minWidth:160, overflow:'hidden' }}
                onMouseLeave={() => setExportMenu(false)}
              >
                {(['All','IS','OOS','InPro','WP'] as const).map((key, i) => {
                  const busList = key === 'All' ? filtered : filtered.filter(b => b.bus_status === key)
                  const label   = key === 'All' ? 'All Buses' : STATUS_CONFIG[key].label
                  return (
                    <div key={key} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ padding:'6px 14px 2px', fontSize:10, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:500 }}>{label}</div>
                      <div style={{ display:'flex' }}>
                        <button
                          onClick={() => exportCsv(busList, label)}
                          style={{ flex:1, padding:'6px 14px', background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#334155', textAlign:'left', fontFamily:'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background='none')}
                        >CSV</button>
                        <button
                          onClick={() => exportPdf(busList, label)}
                          style={{ flex:1, padding:'6px 14px', background:'none', border:'none', borderLeft:'1px solid #f1f5f9', cursor:'pointer', fontSize:12, color:'#334155', textAlign:'left', fontFamily:'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background='none')}
                        >PDF</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {isAdmin && (
            <button className="btn btn-primary" style={{ fontSize:12, padding:'6px 12px', height:34 }} onClick={() => router.push('/buses/new')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Bus
            </button>
          )}
        </div>
      </div>

      {/* Grid board */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        {/* Grid */}
        <div style={{ padding:'16px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(96px, 1fr))', gap:5 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn:'1/-1', padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>No buses found</div>
          ) : filtered.map(bus => {
            const cfg = STATUS_CONFIG[bus.bus_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.WP
            const isHov = hovered === bus.id
            return (
              <button
                key={bus.id}
                onClick={() => router.push(`/buses/${bus.id}`)}
                onMouseEnter={() => setHovered(bus.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHov ? (bus.bus_status === 'IS' ? '#15803d' : bus.bus_status === 'OOS' ? '#b91c1c' : bus.bus_status === 'InPro' ? '#c2410c' : '#94a3b8') : cfg.cellBg,
                  color: cfg.cellText,
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  textAlign: 'center',
                  transition: 'all 0.1s',
                  minHeight: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transform: isHov ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: isHov ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                  zIndex: isHov ? 2 : 1,
                  position: 'relative',
                }}
              >
                <span style={{ fontSize:13, fontWeight:700, letterSpacing:'0.01em', lineHeight:1.2 }}>{bus.bus_id}</span>
                {bus.bus_status === 'WP' && (
                  <span style={{ fontSize:11, fontWeight:500, opacity:0.7 }}>PENDING</span>
                )}
                {bus.bus_status === 'InPro' && (
                  <span style={{ fontSize:11, fontWeight:500, opacity:0.8 }}>REPAIR</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredBus && (
          <div style={{ margin:'0 16px', padding:'10px 14px', background:'#f8fafc', borderRadius:8, border:'1px solid #e2e8f0', fontSize:12, display:'flex', gap:20, flexWrap:'wrap', marginBottom:0 }}>
            <span><strong style={{ color:'#0f172a', fontWeight:600 }}>{hoveredBus.bus_id}</strong></span>
            <span style={{ color:'#64748b' }}>{STATUS_CONFIG[hoveredBus.bus_status as keyof typeof STATUS_CONFIG]?.label}</span>
            {hoveredBus.bus_system && <span style={{ color:'#64748b' }}>{hoveredBus.bus_system}</span>}
            {hoveredBus.location && <span style={{ color:'#64748b' }}>{hoveredBus.location}</span>}
            {hoveredBus.problem_description && <span style={{ color:'#dc2626' }}>{hoveredBus.problem_description}</span>}
            {isAdmin && (
              <button
                onClick={e => { e.stopPropagation(); router.push(`/buses/${hoveredBus.id}/edit`) }}
                style={{ marginLeft:'auto', fontSize:11, color:'#1d6fce', background:'none', border:'1px solid #bfdbfe', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontFamily:'inherit' }}
              >Edit</button>
            )}
          </div>
        )}

        {/* Legend / summary bar */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #f1f5f9', display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(key => (
            <div
              key={key}
              onClick={() => router.push(`/buses?status=${key}`)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:7, background:STATUS_CONFIG[key].legendBg, cursor:'pointer', border:`1px solid ${STATUS_CONFIG[key].legendBg}` }}
            >
              <span style={{ width:8, height:8, borderRadius:2, background:STATUS_CONFIG[key].cellBg, display:'inline-block', flexShrink:0 }}/>
              <span style={{ fontSize:11, color:STATUS_CONFIG[key].legendText, fontWeight:400 }}>{STATUS_CONFIG[key].label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:STATUS_CONFIG[key].legendText }}>{counts[key]}</span>
            </div>
          ))}
          <div style={{ marginLeft:'auto', fontSize:11, color:'#94a3b8', fontWeight:400 }}>
            {filtered.length} of {buses.length} buses shown
          </div>
        </div>
      </div>
    </>
  )
}
