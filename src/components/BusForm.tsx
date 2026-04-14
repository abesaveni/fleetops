'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord } from '@/types'

const STATUS_OPTIONS = [
  { value:'IS',    label:'In Service' },
  { value:'OOS',   label:'Out of Service' },
  { value:'InPro', label:'Outfitting and Commissioning' },
  { value:'WP',    label:'Pending' },
]

type FormState = {
  bus_id: string
  bus_status: string
  bus_system: string
  location: string
  bus_age: string
  out_of_service_date: string
  back_in_service_date: string
  estimated_repair_time: string
  problem_description: string
  maintenance_comments: string
}

/* Field component defined OUTSIDE BusForm so React never remounts inputs on re-render */
function Field({
  name, label, type = 'text', full = false, options, value, onChange,
}: {
  name: string
  label: string
  type?: string
  full?: boolean
  options?: { value: string; label: string }[]
  value: string
  onChange: (name: string, value: string) => void
}) {
  return (
    <div className={`form-group${full ? ' full-width' : ''}`}>
      <label className="form-label">{label}</label>
      {options ? (
        <select className="input" value={value} onChange={e => onChange(name, e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="input" rows={3} style={{ resize:'vertical' }} value={value} onChange={e => onChange(name, e.target.value)}/>
      ) : (
        <input className="input" type={type} value={value} onChange={e => onChange(name, e.target.value)} required={name === 'bus_id'}/>
      )}
    </div>
  )
}

export default function BusForm({ bus, mode }: { bus?: BusRecord; mode: 'new' | 'edit' }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [form,   setForm]   = useState<FormState>({
    bus_id:                bus?.bus_id                ?? '',
    bus_status:            bus?.bus_status            ?? 'IS',
    bus_system:            bus?.bus_system            ?? '',
    location:              bus?.location              ?? '',
    bus_age:               bus?.bus_age               ?? '',
    out_of_service_date:   bus?.out_of_service_date   ?? '',
    back_in_service_date:  bus?.back_in_service_date  ?? '',
    estimated_repair_time: bus?.estimated_repair_time ?? '',
    problem_description:   bus?.problem_description   ?? '',
    maintenance_comments:  bus?.maintenance_comments  ?? '',
  })

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const url    = mode === 'new' ? '/api/buses' : `/api/buses/${bus!.id}`
    const method = mode === 'new' ? 'POST' : 'PATCH'
    const res    = await fetch(url, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Error saving')
      setSaving(false)
      return
    }
    const saved = await res.json()
    router.push(`/buses/${saved.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="form-grid">
          <Field name="bus_id"                label="Bus ID *"                                  value={form.bus_id}                onChange={set} />
          <Field name="bus_status"            label="Bus Status"            options={STATUS_OPTIONS} value={form.bus_status}     onChange={set} />
          <Field name="bus_system"            label="Bus System"                                value={form.bus_system}            onChange={set} />
          <Field name="location"              label="Location"                                  value={form.location}              onChange={set} />
          <Field name="bus_age"               label="Age of Bus"                                value={form.bus_age}               onChange={set} />
          <Field name="estimated_repair_time" label="Estimated Repair Time"                     value={form.estimated_repair_time} onChange={set} />
          <Field name="out_of_service_date"   label="Out of Service Date"   type="date"         value={form.out_of_service_date}   onChange={set} />
          <Field name="back_in_service_date"  label="Back in Service Date"  type="date"         value={form.back_in_service_date}  onChange={set} />
          <Field name="problem_description"   label="Problem Description"   type="textarea" full value={form.problem_description}  onChange={set} />
          <Field name="maintenance_comments"  label="Maintenance Comments"  type="textarea" full value={form.maintenance_comments}  onChange={set} />
        </div>

        {error && (
          <div style={{ marginTop:16, background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, fontSize:13 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : mode === 'new' ? 'Add Bus' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
