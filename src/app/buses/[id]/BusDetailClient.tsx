'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord } from '@/types'
import { STATUS_LABELS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'

function Field({ label, value }: { label:string; value?:string|null }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize:15, color:value?'var(--text-primary)':'var(--text-muted)' }}>{value||'—'}</span>
    </div>
  )
}

export default function BusDetailClient({ bus, userRole }: { bus:BusRecord; userRole:string }) {
  const router = useRouter()
  const [toast, setToast] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const isAdmin = userRole==='Admin'
  const fmt = (d:string|null) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}) : null

  function showToast(msg:string){ setToast(msg); setTimeout(()=>setToast(null),3000) }

  async function handleDelete() {
    if (!confirm(`Delete bus ${bus.bus_id}? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/buses/${bus.id}`,{ method:'DELETE' })
    if (res.ok) { router.push('/buses'); router.refresh() }
    else { showToast('Error deleting bus'); setDeleting(false) }
  }

  async function handleNotify() {
    const to = prompt('Send notification to email:'); if(!to) return
    const res = await fetch('/api/notify',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({to,bus,type:'status'}) })
    showToast(res.ok ? `Notification sent to ${to}` : 'Error sending notification')
  }

  return (
    <>
      {toast&&<Toast message={toast}/>}
      <div style={{ marginBottom:24 }}>
        <button className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:13, marginBottom:16 }} onClick={()=>router.back()}>← Back</button>
        <div className="page-header" style={{ marginBottom:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, background:'var(--brand-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <div><h1 className="page-title" style={{ fontSize:22 }}>{bus.bus_id}</h1><StatusBadge status={bus.bus_status}/></div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-secondary" onClick={handleNotify}>✉ Notify</button>
            {isAdmin&&<>
              <button className="btn btn-primary" onClick={()=>router.push(`/buses/${bus.id}/edit`)}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting?'Deleting…':'Delete'}</button>
            </>}
          </div>
        </div>
      </div>
      <div className="card" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'24px 32px' }}>
        <Field label="Bus ID" value={bus.bus_id}/>
        <Field label="Bus System" value={bus.bus_system}/>
        <Field label="Location" value={bus.location}/>
        <Field label="Age" value={bus.bus_age}/>
        <Field label="Out of Service Date" value={fmt(bus.out_of_service_date)}/>
        <Field label="Back in Service Date" value={fmt(bus.back_in_service_date)}/>
        <Field label="Estimated Repair Time" value={bus.estimated_repair_time}/>
        <div style={{ gridColumn:'1/-1', borderTop:'1px solid var(--border)', paddingTop:20 }}>
          <Field label="Operations Problem Description" value={bus.problem_description}/>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <Field label="Maintenance Comments" value={bus.maintenance_comments}/>
        </div>
      </div>
      <div style={{ marginTop:16, fontSize:12, color:'var(--text-muted)', display:'flex', gap:20 }}>
        <span>Added: {fmt(bus.created_at)}</span>
        <span>Updated: {fmt(bus.updated_at)}</span>
      </div>
    </>
  )
}
