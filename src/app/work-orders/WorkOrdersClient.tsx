'use client'
import { useState, useMemo } from 'react'
import type { WorkOrder } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  open:                'Open',
  under_repair:        'Under Repair',
  pending_parts:       'Pending Parts',
  completed:           'Completed',
  closed:              'Closed',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:                { bg: '#fee2e2', text: '#991b1b' },
  under_repair:        { bg: '#fff7ed', text: '#9a3412' },
  pending_parts:       { bg: '#fef9c3', text: '#854d0e' },
  completed:           { bg: '#dcfce7', text: '#166534' },
  closed:              { bg: '#f1f5f9', text: '#475569' },
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

/* ── Individual Work Order Print Document ─────────────────────── */
function WOPrintModal({ wo, onClose }: { wo: WorkOrder; onClose: () => void }) {
  const totalCost  = (wo.labour_cost ?? 0) + (wo.parts_cost ?? 0)
  const statusConf = STATUS_COLORS[wo.status] ?? { bg: '#f1f5f9', text: '#475569' }
  const printedOn  = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
  const woNum      = wo.wo_number ?? 'N/A'

  function buildDocHTML() {
    const esc = (s: string | null | undefined) => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Work Order ${esc(woNum)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#0f172a;background:#fff;padding:32px 40px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #0f172a}
.wo-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b;margin-bottom:4px}
.wo-num{font-size:28px;font-weight:900;font-family:monospace;letter-spacing:-.03em;color:#0f172a}
.badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;background:${statusConf.bg};color:${statusConf.text};margin-bottom:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdate{font-size:11px;color:#94a3b8;text-align:right}
.sec{margin-bottom:20px}
.sec-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 24px}
.clbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:3px}
.cval{font-size:14px;color:#0f172a;font-weight:500}
.cval.b{font-weight:700}
.issue{font-size:14px;color:#0f172a;line-height:1.65;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.maint{font-size:14px;color:#0f172a;line-height:1.65;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
table{width:100%;border-collapse:collapse;font-size:14px}
thead tr{background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact}
th{text-align:left;padding:8px 14px;font-weight:600;color:#475569;font-size:12px;border-bottom:1px solid #e2e8f0}
th.r{text-align:right}
td{padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a}
td.r{text-align:right;font-family:monospace}
.tot{background:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.tot td{color:#fff;font-weight:700;border-bottom:none}
.tot td.r{font-size:15px}
.ftr{margin-top:24px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
.ftxt{font-size:11px;color:#94a3b8}
</style></head><body>
<div class="hdr">
  <div><div class="wo-lbl">Work Order</div><div class="wo-num">${esc(woNum)}</div></div>
  <div style="text-align:right"><div class="badge">${esc(STATUS_LABELS[wo.status] ?? wo.status)}</div><div class="pdate">Printed ${esc(printedOn)}</div></div>
</div>
<div class="sec">
  <div class="sec-title">Bus Information</div>
  <div class="g3">
    <div><div class="clbl">Bus ID</div><div class="cval b">${esc(wo.bus?.bus_id)}</div></div>
    <div><div class="clbl">Manufacturer</div><div class="cval">${esc(wo.bus?.manufacturer) || '—'}</div></div>
    <div><div class="clbl">Status</div><div class="cval">${esc(STATUS_LABELS[wo.status] ?? wo.status)}</div></div>
    <div><div class="clbl">Bus System</div><div class="cval">${esc(wo.bus_system) || '—'}</div></div>
    <div><div class="clbl">Asset Location</div><div class="cval">${esc(wo.asset_location) || '—'}</div></div>
    <div><div class="clbl">Estimated Repair Time</div><div class="cval">${esc(wo.estimated_repair_time) || '—'}</div></div>
  </div>
</div>
<div class="sec">
  <div class="sec-title">Dates</div>
  <div class="g3">
    <div><div class="clbl">Date Out of Service</div><div class="cval">${fmt(wo.date_out_of_service)}</div></div>
    <div><div class="clbl">Back in Service</div><div class="cval">${fmt(wo.back_in_service_date)}</div></div>
    <div><div class="clbl">Work Order Created</div><div class="cval">${fmt(wo.created_at)}</div></div>
    ${wo.closed_at ? `<div><div class="clbl">Work Order Closed</div><div class="cval">${fmt(wo.closed_at)}</div></div>` : ''}
  </div>
</div>
${wo.problem_description ? `<div class="sec"><div class="sec-title">Problem / Issue</div><div class="issue">${esc(wo.problem_description)}</div></div>` : ''}
${wo.maintenance_comments ? `<div class="sec"><div class="sec-title">Maintenance Notes</div><div class="maint">${esc(wo.maintenance_comments)}</div></div>` : ''}
<div class="sec">
  <div class="sec-title">Cost Summary</div>
  <table>
    <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
    <tbody>
      <tr><td>Labour</td><td class="r">${wo.labour_cost != null ? `$${wo.labour_cost.toFixed(2)}` : '—'}</td></tr>
      <tr><td>Parts</td><td class="r">${wo.parts_cost != null ? `$${wo.parts_cost.toFixed(2)}` : '—'}</td></tr>
      <tr class="tot"><td>Total</td><td class="r">${(wo.labour_cost != null || wo.parts_cost != null) ? `$${totalCost.toFixed(2)}` : '—'}</td></tr>
    </tbody>
  </table>
</div>
<div class="ftr">
  <span class="ftxt">Trackitlio — From Issue to Resolution</span>
  <span class="ftxt" style="font-family:monospace">${esc(woNum)}</span>
</div>
</body></html>`
  }

  function doPrint() {
    const w = window.open('', '_blank', 'width=820,height=900')
    if (!w) { alert('Please allow pop-ups for this site to enable printing.'); return }
    w.document.write(buildDocHTML())
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 600)
  }

  function doDownload() {
    const blob = new Blob([buildDocHTML()], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `WorkOrder_${woNum}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 400 }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 'min(720px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
          background: '#fff', borderRadius: 12, zIndex: 401,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Work Order — {woNum}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={doPrint}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button
              onClick={doDownload}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            <button onClick={onClose} style={{ padding: '8px 14px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
              Close
            </button>
          </div>
        </div>

        {/* Document body */}
        <div style={{ padding: '28px 32px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

          {/* Doc header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid #0f172a' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginBottom: 4 }}>Work Order</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{woNum}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, background: statusConf.bg, color: statusConf.text, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                {STATUS_LABELS[wo.status] ?? wo.status}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Printed {printedOn}</div>
            </div>
          </div>

          {/* Section: Bus Information */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #e2e8f0' }}>
              Bus Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
              <InfoCell label="Bus ID" value={wo.bus?.bus_id ?? '—'} bold />
              <InfoCell label="Manufacturer" value={wo.bus?.manufacturer ?? '—'} />
              <InfoCell label="Status" value={STATUS_LABELS[wo.status] ?? wo.status} />
              <InfoCell label="Bus System" value={wo.bus_system ?? '—'} />
              <InfoCell label="Asset Location" value={wo.asset_location ?? '—'} />
              <InfoCell label="Estimated Repair Time" value={wo.estimated_repair_time ?? '—'} />
            </div>
          </div>

          {/* Section: Dates */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #e2e8f0' }}>
              Dates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
              <InfoCell label="Date Out of Service" value={fmt(wo.date_out_of_service)} />
              <InfoCell label="Back in Service" value={fmt(wo.back_in_service_date)} />
              <InfoCell label="Work Order Created" value={fmt(wo.created_at)} />
              {wo.closed_at && <InfoCell label="Work Order Closed" value={fmt(wo.closed_at)} />}
            </div>
          </div>

          {/* Section: Issue */}
          {wo.problem_description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #e2e8f0' }}>
                Problem / Issue
              </div>
              <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.65, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px' }}>
                {wo.problem_description}
              </div>
            </div>
          )}

          {/* Section: Maintenance */}
          {wo.maintenance_comments && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #e2e8f0' }}>
                Maintenance Notes
              </div>
              <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.65, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px' }}>
                {wo.maintenance_comments}
              </div>
            </div>
          )}

          {/* Section: Costs */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #e2e8f0' }}>
              Cost Summary
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 600, color: '#475569', fontSize: 12, borderBottom: '1px solid #e2e8f0' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, color: '#475569', fontSize: 12, borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>Labour</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#0f172a', fontFamily: 'monospace' }}>
                    {wo.labour_cost != null ? `$${wo.labour_cost.toFixed(2)}` : '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>Parts</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#0f172a', fontFamily: 'monospace' }}>
                    {wo.parts_cost != null ? `$${wo.parts_cost.toFixed(2)}` : '—'}
                  </td>
                </tr>
                <tr style={{ background: '#0f172a' }}>
                  <td style={{ padding: '11px 14px', color: '#fff', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '11px 14px', textAlign: 'right', color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>
                    {(wo.labour_cost != null || wo.parts_cost != null) ? `$${totalCost.toFixed(2)}` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Trackitlio — From Issue to Resolution</span>
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{woNum}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCell({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#0f172a', fontWeight: bold ? 700 : 500, letterSpacing: bold ? '-0.01em' : undefined }}>{value}</div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function WorkOrdersClient({ workOrders }: { workOrders: WorkOrder[]; userRole: string }) {
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSystem, setFilterSystem] = useState('')
  const [filterMfr, setFilterMfr]       = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [printWO, setPrintWO]           = useState<WorkOrder | null>(null)

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

  const totalLabour = filtered.reduce((s, w) => s + (w.labour_cost ?? 0), 0)
  const totalParts  = filtered.reduce((s, w) => s + (w.parts_cost ?? 0), 0)

  return (
    <>
      {/* Print modal */}
      {printWO && <WOPrintModal wo={printWO} onClose={() => setPrintWO(null)} />}

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Work Order Reports</h1>
          <p className="page-subtitle">{filtered.length} of {workOrders.length} work orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>Print All</button>
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Work Orders', value: filtered.length.toString(), color: '#3b82f6' },
            { label: 'Total Labour', value: `$${totalLabour.toFixed(2)}`, color: '#f97316' },
            { label: 'Total Parts', value: `$${totalParts.toFixed(2)}`, color: '#8b5cf6' },
            { label: 'Total Cost', value: `$${(totalLabour + totalParts).toFixed(2)}`, color: '#0ea5e9' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '10px 16px', flex: '1 1 120px', borderTop: `3px solid ${color}` }}>
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
                <th></th>
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
                  <td>
                    <button
                      onClick={() => setPrintWO(w)}
                      title="Print this work order"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#475569', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0f172a' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
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
