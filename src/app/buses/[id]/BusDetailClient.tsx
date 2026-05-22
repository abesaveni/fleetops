'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusRecord, BusStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 15, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>{value || '—'}</span>
    </div>
  )
}

const ALL_STATUSES: BusStatus[] = ['IS', 'OOS', 'InPro', 'WP']

function StatusModal({ current, onSelect, onClose }: { current: BusStatus; onSelect: (s: BusStatus) => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px', width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Update Bus Status</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Select the new operational status for this bus.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_STATUSES.map(s => {
            const c = STATUS_COLORS[s]
            const isCurrent = s === current
            return (
              <button key={s} onClick={() => onSelect(s)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                background: isCurrent ? c.bg : '#f8fafc',
                border: `1.5px solid ${isCurrent ? c.dot : '#e2e8f0'}`,
                borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'border-color 0.15s',
              }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>
                <span style={{ fontSize: 14, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? c.text : '#374151', flex: 1 }}>{STATUS_LABELS[s]}</span>
                {isCurrent && <span style={{ fontSize: 11, fontWeight: 600, color: c.text, background: c.bg, padding: '2px 8px', borderRadius: 20, border: `1px solid ${c.dot}` }}>Current</span>}
              </button>
            )
          })}
        </div>
        <button onClick={onClose} style={{ marginTop: 14, width: '100%', padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function BusDetailClient({ bus: initialBus, userRole }: { bus: BusRecord; userRole: string }) {
  const router = useRouter()
  const [bus, setBus] = useState(initialBus)
  const [toast, setToast] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const isAdmin = userRole === 'Admin'
  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : null

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function handleDelete() {
    if (!confirm(`Delete bus ${bus.bus_id}? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/buses/${bus.id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/buses'); router.refresh() }
    else { showToast('Error deleting bus'); setDeleting(false) }
  }

  async function handleNotify() {
    const to = prompt('Send notification to email:'); if (!to) return
    const res = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, bus, type: 'status' }) })
    showToast(res.ok ? `Notification sent to ${to}` : 'Error sending notification')
  }

  async function handleStatusChange(newStatus: BusStatus) {
    if (newStatus === bus.bus_status) { setShowStatusModal(false); return }
    setUpdatingStatus(true)
    setShowStatusModal(false)
    const res = await fetch(`/api/buses/${bus.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bus_status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBus(updated)
      showToast(`Status updated to ${STATUS_LABELS[newStatus]}`)
    } else {
      showToast('Failed to update status')
    }
    setUpdatingStatus(false)
  }

  return (
    <>
      {toast && <Toast message={toast}/>}
      {showStatusModal && <StatusModal current={bus.bus_status} onSelect={handleStatusChange} onClose={() => setShowStatusModal(false)}/>}

      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 13, marginBottom: 16 }} onClick={() => router.back()}>← Back</button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: 'var(--brand-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="7" width="22" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
                <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: 22 }}>{bus.bus_id}</h1>
              <StatusBadge status={bus.bus_status}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={handleNotify}>✉ Notify</button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowStatusModal(true)}
              disabled={updatingStatus}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {updatingStatus ? 'Updating…' : 'Update Status'}
            </button>
            <button className="btn btn-primary" onClick={() => router.push(`/buses/${bus.id}/edit`)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px 32px' }}>
        <Field label="Bus ID" value={bus.bus_id}/>
        <Field label="Bus System" value={bus.bus_system}/>
        <Field label="Location" value={bus.location}/>
        <Field label="Age" value={bus.bus_age}/>
        <Field label="Out of Service Date" value={fmt(bus.out_of_service_date)}/>
        <Field label="Back in Service Date" value={fmt(bus.back_in_service_date)}/>
        <Field label="Estimated Repair Time" value={bus.estimated_repair_time}/>
        <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <Field label="Operations Problem Description" value={bus.problem_description}/>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Maintenance Comments" value={bus.maintenance_comments}/>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 20 }}>
        <span>Added: {fmt(bus.created_at)}</span>
        <span>Updated: {fmt(bus.updated_at)}</span>
      </div>
    </>
  )
}
