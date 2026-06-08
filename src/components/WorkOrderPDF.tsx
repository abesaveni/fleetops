import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { WorkOrder } from '@/types'

const WO_STATUS_LABELS: Record<string, string> = {
  open:          'Open',
  under_repair:  'Under Repair',
  pending_parts: 'Pending Parts',
  completed:     'Completed',
  closed:        'Closed',
}

const STATUS_BG: Record<string, string> = {
  open:          '#fee2e2',
  under_repair:  '#fff7ed',
  pending_parts: '#fef9c3',
  completed:     '#dcfce7',
  closed:        '#f1f5f9',
}

const STATUS_COLOR: Record<string, string> = {
  open:          '#991b1b',
  under_repair:  '#9a3412',
  pending_parts: '#854d0e',
  completed:     '#166534',
  closed:        '#475569',
}

const s = StyleSheet.create({
  page:       { fontFamily: 'Helvetica', fontSize: 9, color: '#0f172a', backgroundColor: '#fff', padding: '32pt 40pt' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, paddingBottom: 18, borderBottom: '2pt solid #0f172a' },
  woLabel:    { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 4 },
  woNum:      { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', letterSpacing: -0.5 },
  badge:      { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, fontSize: 8, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start', marginBottom: 5 },
  printedOn:  { fontSize: 8, color: '#94a3b8', textAlign: 'right' },
  secTitle:   { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 8, paddingBottom: 4, borderBottom: '0.5pt solid #e2e8f0' },
  sec:        { marginBottom: 18 },
  grid3:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell:       { width: '30%', marginBottom: 8 },
  cellLabel:  { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 2 },
  cellValue:  { fontSize: 9, color: '#0f172a' },
  cellBold:   { fontSize: 9, color: '#0f172a', fontFamily: 'Helvetica-Bold' },
  textBox:    { fontSize: 9, color: '#0f172a', lineHeight: 1.6, borderRadius: 5, padding: '8 12' },
  table:      { width: '100%' },
  thead:      { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottom: '0.5pt solid #e2e8f0', paddingVertical: 5 },
  th:         { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: 10 },
  tr:         { flexDirection: 'row', borderBottom: '0.5pt solid #f1f5f9', paddingVertical: 7 },
  td:         { fontSize: 9, paddingHorizontal: 10, color: '#0f172a' },
  totalRow:   { flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 8, borderRadius: 4, marginTop: 2 },
  totalTd:    { fontSize: 9, paddingHorizontal: 10, color: '#fff', fontFamily: 'Helvetica-Bold' },
  footer:     { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5pt solid #e2e8f0', paddingTop: 8 },
  footerText: { fontSize: 7.5, color: '#94a3b8' },
})

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'
}

function InfoCell({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.cell}>
      <Text style={s.cellLabel}>{label}</Text>
      <Text style={bold ? s.cellBold : s.cellValue}>{value || '—'}</Text>
    </View>
  )
}

export default function WorkOrderPDF({ wo }: { wo: WorkOrder }) {
  const totalCost = (wo.labour_cost ?? 0) + (wo.parts_cost ?? 0)
  const woNum     = wo.wo_number ?? 'N/A'
  const bg        = STATUS_BG[wo.status]   ?? '#f1f5f9'
  const fg        = STATUS_COLOR[wo.status] ?? '#475569'
  const label     = WO_STATUS_LABELS[wo.status] ?? wo.status
  const printed   = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.woLabel}>Work Order</Text>
            <Text style={s.woNum}>{woNum}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.badge, { backgroundColor: bg, color: fg }]}>{label}</Text>
            <Text style={s.printedOn}>Printed {printed}</Text>
          </View>
        </View>

        {/* Bus Information */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Bus Information</Text>
          <View style={s.grid3}>
            <InfoCell label="Bus ID"                value={wo.bus?.bus_id ?? '—'}         bold />
            <InfoCell label="Manufacturer"          value={wo.bus?.manufacturer ?? '—'}           />
            <InfoCell label="Status"                value={label}                                  />
            <InfoCell label="Bus System"            value={wo.bus_system ?? '—'}                   />
            <InfoCell label="Asset Location"        value={wo.asset_location ?? '—'}               />
            <InfoCell label="Estimated Repair Time" value={wo.estimated_repair_time ?? '—'}        />
          </View>
        </View>

        {/* Dates */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Dates</Text>
          <View style={s.grid3}>
            <InfoCell label="Date Out of Service" value={fmt(wo.date_out_of_service)} />
            <InfoCell label="Back in Service"     value={fmt(wo.back_in_service_date)} />
            <InfoCell label="Work Order Created"  value={fmt(wo.created_at)} />
            {wo.closed_at ? <InfoCell label="Work Order Closed" value={fmt(wo.closed_at)} /> : null}
          </View>
        </View>

        {/* Problem / Issue */}
        {wo.problem_description ? (
          <View style={s.sec}>
            <Text style={s.secTitle}>Problem / Issue</Text>
            <View style={[s.textBox, { backgroundColor: '#fef2f2', border: '0.5pt solid #fecaca' }]}>
              <Text>{wo.problem_description}</Text>
            </View>
          </View>
        ) : null}

        {/* Maintenance Notes */}
        {wo.maintenance_comments ? (
          <View style={s.sec}>
            <Text style={s.secTitle}>Maintenance Notes</Text>
            <View style={[s.textBox, { backgroundColor: '#fff7ed', border: '0.5pt solid #fed7aa' }]}>
              <Text>{wo.maintenance_comments}</Text>
            </View>
          </View>
        ) : null}

        {/* Cost Summary */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Cost Summary</Text>
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.th, { flex: 1 }]}>Description</Text>
              <Text style={[s.th, { width: 80, textAlign: 'right' }]}>Amount</Text>
            </View>
            <View style={s.tr}>
              <Text style={[s.td, { flex: 1 }]}>Labour</Text>
              <Text style={[s.td, { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                {wo.labour_cost != null ? `$${wo.labour_cost.toFixed(2)}` : '—'}
              </Text>
            </View>
            <View style={s.tr}>
              <Text style={[s.td, { flex: 1 }]}>Parts</Text>
              <Text style={[s.td, { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                {wo.parts_cost != null ? `$${wo.parts_cost.toFixed(2)}` : '—'}
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={[s.totalTd, { flex: 1 }]}>Total</Text>
              <Text style={[s.totalTd, { width: 80, textAlign: 'right', fontSize: 10 }]}>
                {(wo.labour_cost != null || wo.parts_cost != null) ? `$${totalCost.toFixed(2)}` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Trackitlio — From Issue to Resolution</Text>
          <Text style={s.footerText}>{woNum}</Text>
        </View>

      </Page>
    </Document>
  )
}
