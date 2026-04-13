'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord, BusStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'

const FILTERS = [
  { key:'all', label:'All' },
  { key:'IS', label:'In Service' },
  { key:'OOS', label:'Out of Service' },
  { key:'InPro', label:'Under Repair' },
  { key:'WP', label:'Pending' },
]

export default function BusListClient({ buses, initialStatus, initialSearch, userRole }: { buses:BusRecord[]; initialStatus:BusStatus|null; initialSearch:string; userRole:string }) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>(initialStatus??'all')
  const [search, setSearch] = useState(initialSearch)
  const [toast, setToast] = useState<string|null>(null)
  const [genPdf, setGenPdf] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const isAdmin = userRole==='Admin'

  const filtered = useMemo(()=>buses.filter(b=>{
    const ms = filter==='all'||b.bus_status===filter
    const mq = search===''||b.bus_id.toLowerCase().includes(search.toLowerCase())||(b.bus_system??'').toLowerCase().includes(search.toLowerCase())||(b.location??'').toLowerCase().includes(search.toLowerCase())
    return ms&&mq
  }),[buses,filter,search])

  function showToast(msg:string){ setToast(msg); setTimeout(()=>setToast(null),3000) }

  function handleCsv() {
    const headers = ['Bus ID','Status','Bus System','Location','Age','OOS Date','Back In Service Date','Est. Repair Time','Problem Description','Maintenance Comments']
    const rows = filtered.map(b => [
      b.bus_id, b.bus_status, b.bus_system??'', b.location??'', b.bus_age??'',
      b.out_of_service_date??'', b.back_in_service_date??'', b.estimated_repair_time??'',
      (b.problem_description??'').replace(/,/g,' '), (b.maintenance_comments??'').replace(/,/g,' ')
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`FleetOps_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    showToast('CSV downloaded')
  }

  async function handlePdf() {
    setGenPdf(true)
    try {
      const res = await fetch('/api/invoice',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({buses:filtered}) })
      if(!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download=`FleetOps_${new Date().toISOString().slice(0,10)}.pdf`; a.click()
      URL.revokeObjectURL(url)
      showToast('PDF downloaded')
    } catch { showToast('Error generating PDF') }
    finally { setGenPdf(false) }
  }

  async function handleEmail() {
    const to = prompt('Send report to email:'); if(!to) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/notify',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({to,buses:filtered,type:'report'}) })
      showToast(res.ok ? `Report sent to ${to}` : 'Error sending email')
    } catch { showToast('Error sending email') }
    finally { setSendingEmail(false) }
  }

  return (
    <>
      {toast&&<Toast message={toast}/>}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet</h1>
          <p className="page-subtitle">{filtered.length} of {buses.length} buses</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button className="btn btn-secondary" onClick={handleCsv}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handlePdf} disabled={genPdf}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {genPdf?'Generating…':'Export PDF'}
          </button>
          <button className="btn btn-secondary" onClick={handleEmail} disabled={sendingEmail}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            {sendingEmail?'Sending…':'Email Report'}
          </button>
          {isAdmin&&<button className="btn btn-primary" onClick={()=>router.push('/buses/new')}>+ Add Bus</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{ padding:'6px 14px', borderRadius:9999, border:`1px solid ${filter===f.key?'var(--brand)':'var(--border-2)'}`, background:filter===f.key?'var(--brand-light)':'var(--surface)', color:filter===f.key?'var(--brand)':'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft:'auto', position:'relative', minWidth:220 }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input" style={{ paddingLeft:32 }} placeholder="Search bus ID, system…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="table-wrap">
        {filtered.length===0 ? <div className="empty-state"><p>No buses match your filter</p></div> : (
          <table>
            <thead><tr><th>Bus ID</th><th>Status</th><th>System</th><th>Location</th><th>Age</th><th>OOS Date</th><th></th></tr></thead>
            <tbody>
              {filtered.map(bus=>(
                <tr key={bus.id} style={{ cursor:'pointer' }} onClick={()=>router.push(`/buses/${bus.id}`)}>
                  <td style={{ fontWeight:600, color:'var(--brand)' }}>{bus.bus_id}</td>
                  <td><StatusBadge status={bus.bus_status}/></td>
                  <td style={{ color:'var(--text-secondary)' }}>{bus.bus_system??'—'}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{bus.location??'—'}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{bus.bus_age??'—'}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{bus.out_of_service_date ? new Date(bus.out_of_service_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    {isAdmin&&<button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>router.push(`/buses/${bus.id}/edit`)}>Edit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
