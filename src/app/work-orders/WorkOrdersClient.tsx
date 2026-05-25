'use client'
import { useState, useMemo } from 'react'
import type { WorkOrder } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  open:                'Open',
  under_repair:        'Under Repair',
  pending_parts:       'Pending Parts',
  completed:           'Completed',
  closed:              'Closed',
  returned_to_service: 'Returned to Service',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:                { bg: '#fee2e2', text: '#991b1b' },
  under_repair:        { bg: '#fff7ed', text: '#9a3412' },
  pending_parts:       { bg: '#fef9c3', text: '#854d0e' },
  completed:           { bg: '#dcfce7', text: '#166534' },
  closed:              { bg: '#f1f5f9', text: '#475569' },
  returned_to_service: { bg: '#d0f4f7', text: '#0e7490' },
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#f1f5f9', text: '#475569' }
  return (
    <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function WorkOrdersClient({ workOrders, userRole }: { workOrders: WorkOrder[]; userRole: string }) {
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSystem, setFilterSystem] = useState('')
  const [filterMfr, setFilterMfr]   = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')

  const allSystems   = useMemo(() => [...new Set(workOrders.map(w => w.bus_system).filter(Boolean))].sort(), [workOrders])
  const allLocations = useMemo(() => [...new Set(workOrders.map(w => w.asset_location).filter(Boolean))].sort(), [workOrders])
  const allMfrs      = useMemo(() => [...new Set(workOrders.map(w => w.bus?.manufacturer).filter(Boolean))].sort(), [workOrders])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return workOrders.filter(w => {
      if (q && !w.wo_number?.toLowerCase().includes(q) && !w.bus?.bus_id?.toLowerCase().includes(q) && !w.problem_description?.toLowerCase().includes(q)) return false
      if (filterStatus   && w.status !== filterStatus)           return false
      if (filterSystem   && w.bus_system !== filterSystem)       return false
      if (filterMfr      && w.bus?.manufacturer !== filterMfr)   return false
      if (filterLocation && w.asset_location !== filterLocation) return false
      if (dateFrom && w.date_out_of_service && w.date_out_of_service < dateFrom) return false
      if (dateTo   && w.date_out_of_service && w.date_out_of_service > dateTo)   return false
      return true
    })
  }, [workOrders, search, filterStatus, filterSystem, filterMfr, filterLocation, dateFrom, dateTo])

  function exportCSV() {
    const headers = ['WO Number','Bus Number','Manufacturer','Status','Bus System','Asset Location','Date Out of Service','Back in Service','Est. Repair Time','Labour Cost','Parts Cost','Total Cost','Problem Description','Maintenance Comments']
    const rows = filtered.map(w => [
      w.wo_number,
      w.bus?.bus_id ?? '',
      w.bus?.manufacturer ?? '',
      STATUS_LABELS[w.status] ?? w.status,
      w.bus_system ?? '',
      w.asset_location ?? '',
      w.date_out_of_service ?? '',
      w.back_in_service_date ?? '',
      w.estimated_repair_time ?? '',
      w.labour_cost?.toFixed(2) ?? '',
      w.parts_cost?.toFixed(2) ?? '',
      ((w.labour_cost ?? 0) + (w.parts_cost ?? 0)).toFixed(2),
      (w.problem_description ?? '').replace(/,/g, ';'),
      (w.maintenance_comments ?? '').replace(/,/g, ';'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `WorkOrders_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function handlePrint() { window.print() }

  const totalLabour = filtered.reduce((s, w) => s + (w.labour_cost ?? 0), 0)
  const totalParts  = filtered.reduce((s, w) => s + (w.parts_cost ?? 0), 0)

  return (
    <>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Work Order Reports</h1>
          <p className="page-subtitle">{filtered.length} of {workOrders.length} work orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handlePrint}>Print</button>
          <button className="btn btn-secondary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          <input
            className="input" placeholder="Search bus, WO#, issue…"
            style={{ gridColumn: 'span 2', fontSize: 13 }}
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="input" style={{ fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input" style={{ fontSize: 13 }} value={filterSystem} onChange={e => setFilterSystem(e.target.value)}>
            <option value="">All Bus Systems</option>
            {allSystems.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
          </select>
          <select className="input" style={{ fontSize: 13 }} value={filterMfr} onChange={e => setFilterMfr(e.target.value)}>
            <option value="">All Manufacturers</option>
            {allMfrs.map(m => <option key={m as string} value={m as string}>{m as string}</option>)}
          </select>
          <select className="input" style={{ fontSize: 13 }} value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            <option value="">All Locations</option>
            {allLocations.map(l => <option key={l as string} value={l as string}>{l as string}</option>)}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date OOS From</span>
            <input className="input" type="date" style={{ fontSize: 13 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date OOS To</span>
            <input className="input" type="date" style={{ fontSize: 13 }} value={dateTo} onChange={e => setDateTo(e.target.value)}/>
          </div>
          {(search || filterStatus || filterSystem || filterMfr || filterLocation || dateFrom || dateTo) && (
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', alignSelf: 'flex-end' }}
              onClick={() => { setSearch(''); setFilterStatus(''); setFilterSystem(''); setFilterMfr(''); setFilterLocation(''); setDateFrom(''); setDateTo('') }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Cost summary row */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Work Orders', value: filtered.length.toString(), color: '#3b82f6' },
            { label: 'Total Labour', value: `$${totalLabour.toFixed(2)}`, color: '#f97316' },
            { label: 'Total Parts', value: `$${totalParts.toFixed(2)}`, color: '#8b5cf6' },
            { label: 'Total Cost', value: `$${(totalLabour + totalParts).toFixed(2)}`, color: '#0ea5e9' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '10px 16px', flex: 1, borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">No work orders match your filters</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>WO Number</th>
                <th>Bus</th>
                <th>Manufacturer</th>
                <th>Status</th>
                <th>Bus System</th>
                <th>Asset Location</th>
                <th>Date OOS</th>
                <th>Back In Service</th>
                <th>Labour</th>
                <th>Parts</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{w.wo_number}</td>
                  <td style={{ fontWeight: 600 }}>{w.bus?.bus_id ?? '—'}</td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{w.bus?.manufacturer ?? '—'}</td>
                  <td><StatusPill status={w.status}/></td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{w.bus_system ?? '—'}</td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{w.asset_location ?? '—'}</td>
                  <td style={{ fontSize: 13 }}>{fmt(w.date_out_of_service)}</td>
                  <td style={{ fontSize: 13 }}>{fmt(w.back_in_service_date)}</td>
                  <td style={{ fontSize: 13 }}>{w.labour_cost != null ? `$${w.labour_cost.toFixed(2)}` : '—'}</td>
                  <td style={{ fontSize: 13 }}>{w.parts_cost != null ? `$${w.parts_cost.toFixed(2)}` : '—'}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>
                    {(w.labour_cost != null || w.parts_cost != null)
                      ? `$${((w.labour_cost ?? 0) + (w.parts_cost ?? 0)).toFixed(2)}`
                      : '—'}
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
