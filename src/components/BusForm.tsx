'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord } from '@/types'

const MANUFACTURERS = [
  'BYD (EV)', 'Golden Dragon (EV)', 'MAN Bus and Truck', 'Volvo (EV)',
  'Mercedes-Benz (EV)', 'New Flyer (EV)', 'Gillig (EV)', 'Alexander Dennis (EV)',
  'Proterra (EV)', 'Blue Bird (EV)', 'Nova Bus (EV)', 'Yutong (EV)',
  'Solaris Bus & Coach (EV)', 'Scania', 'Wrightbus (EV)', 'Van Hool (EV)',
  'Tata Motors (EV)', 'Ashok Leyland (EV)', 'Zhongtong Bus (EV)', 'King Long (EV)',
  'Optare / Switch Mobility (EV)', 'MCI – Motor Coach Industries', 'Prevost',
  'Temsa (EV)', 'Iveco Bus (EV)', 'Ebusco (EV)', 'NFI Group (EV)',
  'ENC – ElDorado National California (EV)', 'Vicinity Motor Corp (EV)',
  'Lion Electric (EV)', 'Karsan (EV)', 'Irizar (EV)', 'Higer Bus (EV)',
  'Foton (EV)', 'Hyundai (EV)', 'Other',
]

const BUS_SYSTEMS = [
  'Steering', 'Transmission', 'Engine', 'Bodywork', 'Electrical', 'Keys',
  'Mechanical', 'HVAC', 'Brakes', 'Suspension', 'Doors', 'Lighting',
  'Cooling System', 'Air System', 'Battery System', 'Charging System',
  'Tires/Wheels', 'Software/Diagnostics', 'Interior', 'Exterior', 'Other',
]

type FormState = {
  bus_id:                string
  manufacturer:          string
  year_of_manufacture:   string
  out_of_service_date:   string
  problem_description:   string
  location:              string
  bus_system:            string
  estimated_repair_time: string
  back_in_service_date:  string
  maintenance_comments:  string
  labour_cost:           string
  parts_cost:            string
}

function SectionHeader({ title, subtitle, color }: { title: string; subtitle: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 4, height: 36, background: color, borderRadius: 3, flexShrink: 0 }}/>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  )
}

export default function BusForm({ bus, mode, userRole }: { bus?: BusRecord; mode: 'new' | 'edit'; userRole?: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [form,   setForm]   = useState<FormState>({
    bus_id:                bus?.bus_id                ?? '',
    manufacturer:          bus?.manufacturer          ?? '',
    year_of_manufacture:   bus?.year_of_manufacture   ?? '',
    out_of_service_date:   bus?.out_of_service_date   ? bus.out_of_service_date.slice(0, 10) : '',
    problem_description:   bus?.problem_description   ?? '',
    location:              bus?.location              ?? '',
    bus_system:            bus?.bus_system            ?? '',
    estimated_repair_time: bus?.estimated_repair_time ?? '',
    back_in_service_date:  bus?.back_in_service_date  ? bus.back_in_service_date.slice(0, 10) : '',
    maintenance_comments:  bus?.maintenance_comments  ?? '',
    labour_cost:           bus?.labour_cost?.toString()  ?? '0.00',
    parts_cost:            bus?.parts_cost?.toString()   ?? '0.00',
  })

  const role = userRole ?? 'Admin'
  const isAdmin       = role === 'Admin'
  const isDispatch    = role === 'Dispatch' || isAdmin
  const isMaintenance = role === 'Maintenance' || isAdmin
  const isViewOnly    = role === 'ViewOnly'

  const totalCost = (parseFloat(form.labour_cost) || 0) + (parseFloat(form.parts_cost) || 0)

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isViewOnly) return
    setSaving(true); setError('')
    const url    = mode === 'new' ? '/api/buses' : `/api/buses/${bus!.id}`
    const method = mode === 'new' ? 'POST' : 'PATCH'
    const payload = {
      ...form,
      labour_cost: parseFloat(form.labour_cost) || 0,
      parts_cost:  parseFloat(form.parts_cost)  || 0,
    }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      if (d.code === 'LIMIT_REACHED') { router.push('/upgrade'); return }
      setError(d.error ?? 'Error saving')
      setSaving(false)
      return
    }
    const saved = await res.json()
    router.push(`/buses/${saved.id}`)
    router.refresh()
  }

  const inputClass = 'input'
  const disabledStyle: React.CSSProperties = { background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }

  return (
    <form onSubmit={handleSubmit}>

      {/* ── Section 1: Bus Details (Admin only) ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionHeader title="Bus Details" subtitle="Admin — core bus identification" color="#3b82f6"/>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Bus Number *</label>
            <input
              className={inputClass}
              type="text"
              value={form.bus_id}
              onChange={e => set('bus_id', e.target.value)}
              required
              disabled={!isAdmin && mode === 'edit'}
              style={!isAdmin && mode === 'edit' ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturer</label>
            <select
              className={inputClass}
              value={form.manufacturer}
              onChange={e => set('manufacturer', e.target.value)}
              disabled={!isAdmin}
              style={!isAdmin ? disabledStyle : undefined}
            >
              <option value="">Select manufacturer…</option>
              {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year of Manufacture</label>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. 2022"
              value={form.year_of_manufacture}
              onChange={e => set('year_of_manufacture', e.target.value)}
              disabled={!isAdmin}
              style={!isAdmin ? disabledStyle : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Dispatch Information ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionHeader title="Dispatch Information" subtitle="Dispatch — complete when bus is taken out of service" color="#ef4444"/>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Date Out of Service</label>
            <input
              className={inputClass}
              type="date"
              value={form.out_of_service_date}
              onChange={e => set('out_of_service_date', e.target.value)}
              disabled={!isDispatch}
              style={!isDispatch ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Problem Description</label>
            <textarea
              className={inputClass}
              rows={3}
              style={{ resize: 'vertical', ...((!isDispatch) ? disabledStyle : {}) }}
              value={form.problem_description}
              onChange={e => set('problem_description', e.target.value)}
              disabled={!isDispatch}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Asset Location</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Depot / location"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              disabled={!isDispatch}
              style={!isDispatch ? disabledStyle : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Maintenance / Work Order ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SectionHeader title="Maintenance / Work Order" subtitle="Maintenance — complete repair details to close work order" color="#f97316"/>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Bus System</label>
            <select
              className={inputClass}
              value={form.bus_system}
              onChange={e => set('bus_system', e.target.value)}
              disabled={!isMaintenance}
              style={!isMaintenance ? disabledStyle : undefined}
            >
              <option value="">Select system…</option>
              {BUS_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Repair Time (hours)</label>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. 4"
              value={form.estimated_repair_time}
              onChange={e => set('estimated_repair_time', e.target.value)}
              disabled={!isMaintenance}
              style={!isMaintenance ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date Back in Service</label>
            <input
              className={inputClass}
              type="date"
              value={form.back_in_service_date}
              onChange={e => set('back_in_service_date', e.target.value)}
              disabled={!isMaintenance}
              style={!isMaintenance ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Maintenance Comments</label>
            <textarea
              className={inputClass}
              rows={3}
              style={{ resize: 'vertical', ...((!isMaintenance) ? disabledStyle : {}) }}
              value={form.maintenance_comments}
              onChange={e => set('maintenance_comments', e.target.value)}
              disabled={!isMaintenance}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Labour Cost ($)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.labour_cost}
              onChange={e => set('labour_cost', e.target.value)}
              disabled={!isMaintenance}
              style={!isMaintenance ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Parts Cost ($)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.parts_cost}
              onChange={e => set('parts_cost', e.target.value)}
              disabled={!isMaintenance}
              style={!isMaintenance ? disabledStyle : undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Cost ($)</label>
            <input
              className={inputClass}
              type="text"
              value={totalCost.toFixed(2)}
              disabled
              style={{ ...disabledStyle, fontWeight: 600, color: '#0f172a', background: '#f0fdf4' }}
            />
          </div>
        </div>

        {mode === 'edit' && isMaintenance && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12.5, color: '#1e40af' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: 'inline', marginRight: 6 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            A work order will be created when maintenance information is saved. The bus status will update automatically when the bus is back in service.
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16, background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {!isViewOnly && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : mode === 'new' ? 'Add Bus' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  )
}
