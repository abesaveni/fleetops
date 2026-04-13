'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord, BusStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import Toast from '@/components/Toast'

const COLUMNS: { key: BusStatus; label: string; bg: string; text: string; border: string; dot: string; headerBg: string }[] = [
  { key:'IS',    label:'In Service',            bg:'#f0fdf4', text:'#166534', border:'#bbf7d0', dot:'#22c55e', headerBg:'#dcfce7' },
  { key:'OOS',   label:'Out of Service',        bg:'#fff5f5', text:'#991b1b', border:'#fecaca', dot:'#ef4444', headerBg:'#fee2e2' },
  { key:'InPro', label:'Under Repair',          bg:'#fff8f0', text:'#9a3412', border:'#fed7aa', dot:'#f97316', headerBg:'#fff7ed' },
  { key:'WP',    label:'Pending Commissioning', bg:'#eff6ff', text:'#1e40af', border:'#bfdbfe', dot:'#3b82f6', headerBg:'#dbeafe' },
]

export default function FleetBoardClient({ buses, userRole }: { buses: BusRecord[]; userRole: string }) {
  const router = useRouter()
  const isAdmin = userRole === 'Admin'
  const [search, setSearch]     = useState('')
  const [toast, setToast]       = useState<string|null>(null)
  const [exportMenu, setExportMenu] = useState<string|null>(null)
  const [genPdf, setGenPdf]     = useState<string|null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function exportCsv(colBuses: BusRecord[], label: string) {
    const headers = ['Bus ID','Status','Bus System','Location','Age','OOS Date','BIS Date','Problem Description','Maintenance Comments']
    const rows = colBuses.map(b => [
      b.bus_id, b.bus_status, b.bus_system??'', b.location??'', b.bus_age??'',
      b.out_of_service_date??'', b.back_in_service_date??'',
      (b.problem_description??'').replace(/,/g,' '), (b.maintenance_comments??'').replace(/,/g,' ')
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `FleetOps_${label.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    showToast(`${label} CSV downloaded`)
    setExportMenu(null)
  }

  async function exportPdf(colBuses: BusRecord[], key: string, label: string) {
    setGenPdf(key)
    setExportMenu(null)
    try {
      const res = await fetch('/api/invoice', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ buses: colBuses }) })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `FleetOps_${label.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`; a.click()
      URL.revokeObjectURL(url)
      showToast(`${label} PDF downloaded`)
    } catch { showToast('Error generating PDF') }
    finally { setGenPdf(null) }
  }

  const filtered = useMemo(() => {
    if (!search) return buses
    const q = search.toLowerCase()
    return buses.filter(b =>
      b.bus_id.toLowerCase().includes(q) ||
      (b.bus_system ?? '').toLowerCase().includes(q) ||
      (b.location ?? '').toLowerCase().includes(q)
    )
  }, [buses, search])

  const byStatus = useMemo(() => {
    const map: Record<string, BusRecord[]> = { IS:[], OOS:[], InPro:[], WP:[] }
    filtered.forEach(b => { if (map[b.bus_status]) map[b.bus_status].push(b) })
    return map
  }, [filtered])

  return (
    <>
      {toast && <Toast message={toast}/>}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Board</h1>
          <p className="page-subtitle">{buses.length} buses across {COLUMNS.length} status groups</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input" style={{ paddingLeft:32, width:200 }} placeholder="Search buses…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => router.push('/buses/new')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Bus
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, alignItems:'start' }}>
        {COLUMNS.map(col => {
          const colBuses = byStatus[col.key] ?? []
          return (
            <div key={col.key} style={{ borderRadius:14, border:`1.5px solid ${col.border}`, overflow:'hidden' }}>
              {/* Column Header */}
              <div style={{ background:col.headerBg, padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:col.dot, display:'inline-block', flexShrink:0 }}/>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:col.text }}>{col.label}</span>
                  <span style={{ background:col.bg, color:col.text, border:`1px solid ${col.border}`, borderRadius:9999, fontSize:11, fontWeight:700, padding:'1px 8px' }}>
                    {colBuses.length}
                  </span>
                </div>
                {/* Export dropdown */}
                <div style={{ position:'relative' }}>
                  <button
                    onClick={() => setExportMenu(exportMenu === col.key ? null : col.key)}
                    style={{ background:'rgba(255,255,255,0.6)', border:`1px solid ${col.border}`, borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:11, color:col.text, fontFamily:'inherit', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}
                  >
                    {genPdf === col.key ? '…' : (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export</>
                    )}
                  </button>
                  {exportMenu === col.key && (
                    <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:'var(--surface)', border:'1px solid var(--border-2)', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:50, minWidth:140, overflow:'hidden' }}
                      onMouseLeave={() => setExportMenu(null)}>
                      <button onClick={() => exportCsv(colBuses, col.label)}
                        style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'var(--text-primary)', textAlign:'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background='var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background='none')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Export CSV
                      </button>
                      <button onClick={() => exportPdf(colBuses, col.key, col.label)}
                        style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', background:'none', border:'none', borderTop:'1px solid var(--border)', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'var(--text-primary)', textAlign:'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background='var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background='none')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bus Cards */}
              <div style={{ background:'var(--surface)', display:'flex', flexDirection:'column', gap:0, maxHeight:'calc(100vh - 220px)', overflowY:'auto' }}>
                {colBuses.length === 0 ? (
                  <div style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No buses</div>
                ) : (
                  colBuses.map((bus, i) => (
                    <button
                      key={bus.id}
                      onClick={() => router.push(`/buses/${bus.id}`)}
                      style={{
                        display:'block', width:'100%', textAlign:'left',
                        padding:'12px 16px', background:'transparent', border:'none',
                        borderBottom: i < colBuses.length - 1 ? `1px solid ${col.border}` : 'none',
                        cursor:'pointer', transition:'background 0.12s', fontFamily:'inherit',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = col.headerBg)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: bus.bus_system || bus.location ? 4 : 0 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:col.text }}>{bus.bus_id}</span>
                        {isAdmin && (
                          <span
                            onClick={e => { e.stopPropagation(); router.push(`/buses/${bus.id}/edit`) }}
                            style={{ fontSize:11, color:'var(--text-muted)', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border-2)', background:'var(--surface)', cursor:'pointer' }}
                          >
                            Edit
                          </span>
                        )}
                      </div>
                      {(bus.bus_system || bus.location) && (
                        <div style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', gap:8, flexWrap:'wrap' }}>
                          {bus.bus_system && <span>{bus.bus_system}</span>}
                          {bus.bus_system && bus.location && <span style={{ color:'var(--text-muted)' }}>·</span>}
                          {bus.location && <span>{bus.location}</span>}
                        </div>
                      )}
                      {bus.problem_description && (
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>
                          {bus.problem_description}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
