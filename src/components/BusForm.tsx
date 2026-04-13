'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord } from '@/types'

const STATUS_OPTIONS = [
  { value:'IS', label:'In Service' },
  { value:'OOS', label:'Out of Service' },
  { value:'InPro', label:'Under Repair' },
  { value:'WP', label:'Pending Commissioning' },
]

export default function BusForm({ bus, mode }: { bus?: BusRecord; mode: 'new'|'edit' }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    bus_id: bus?.bus_id ?? '',
    bus_status: bus?.bus_status ?? 'IS',
    bus_system: bus?.bus_system ?? '',
    location: bus?.location ?? '',
    bus_age: bus?.bus_age ?? '',
    out_of_service_date: bus?.out_of_service_date ?? '',
    back_in_service_date: bus?.back_in_service_date ?? '',
    estimated_repair_time: bus?.estimated_repair_time ?? '',
    problem_description: bus?.problem_description ?? '',
    maintenance_comments: bus?.maintenance_comments ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const url = mode === 'new' ? '/api/buses' : `/api/buses/${bus!.id}`
    const method = mode === 'new' ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json().catch(()=>({})); setError(d.error ?? 'Error'); setSaving(false); return }
    const saved = await res.json()
    router.push(`/buses/${saved.id}`)
    router.refresh()
  }

  const F = ({ name, label, type='text', full=false, options }: { name:string; label:string; type?:string; full?:boolean; options?:{value:string;label:string}[] }) => (
    <div className={`form-group${full?' full-width':''}`}>
      <label className="form-label">{label}</label>
      {options ? (
        <select className="input" value={(form as any)[name]} onChange={e=>set(name,e.target.value)}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type==='textarea' ? (
        <textarea className="input" rows={3} style={{resize:'vertical'}} value={(form as any)[name]} onChange={e=>set(name,e.target.value)}/>
      ) : (
        <input className="input" type={type} value={(form as any)[name]} onChange={e=>set(name,e.target.value)} required={name==='bus_id'}/>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="form-grid">
          <F name="bus_id" label="Bus ID *"/>
          <F name="bus_status" label="Bus Status" options={STATUS_OPTIONS}/>
          <F name="bus_system" label="Bus System"/>
          <F name="location" label="Location"/>
          <F name="bus_age" label="Age of Bus"/>
          <F name="estimated_repair_time" label="Estimated Repair Time"/>
          <F name="out_of_service_date" label="Out of Service Date" type="date"/>
          <F name="back_in_service_date" label="Back in Service Date" type="date"/>
          <F name="problem_description" label="Operations Problem Description" type="textarea" full/>
          <F name="maintenance_comments" label="Maintenance Comments" type="textarea" full/>
        </div>
        {error && <div style={{ marginTop:16, background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, fontSize:13 }}>{error}</div>}
        <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={()=>router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : mode==='new' ? 'Add Bus' : 'Save Changes'}</button>
        </div>
      </div>
    </form>
  )
}
