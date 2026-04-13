import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export interface InvoiceLineItem {
  description: string
  qty: number
  unit_price: number
}

export interface InvoiceData {
  invoice_number: string
  invoice_date: string
  due_date: string
  bill_to_name: string
  bill_to_address: string
  bill_to_email: string
  bill_from_name: string
  bill_from_address: string
  bill_from_email: string
  items: InvoiceLineItem[]
  tax_rate: number
  notes: string
}

const s = StyleSheet.create({
  page:       { fontFamily:'Helvetica', fontSize:9.5, color:'#0f172a', backgroundColor:'#fff', padding:'0' },
  header:     { backgroundColor:'#0d1b2e', padding:'32pt 40pt 28pt', flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  logo:       { fontSize:22, fontFamily:'Helvetica-Bold', color:'#fff' },
  logoSub:    { fontSize:8.5, color:'#94b4d4', marginTop:3, letterSpacing:1 },
  invLabel:   { fontSize:11, color:'#94b4d4', textAlign:'right' },
  invNum:     { fontSize:20, fontFamily:'Helvetica-Bold', color:'#fff', textAlign:'right', marginTop:4 },
  body:       { padding:'28pt 40pt' },
  row2:       { flexDirection:'row', gap:0, marginBottom:24 },
  section:    { flex:1 },
  sectionLabel:{ fontSize:8, fontFamily:'Helvetica-Bold', color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 },
  sectionVal: { fontSize:10, color:'#0f172a', lineHeight:1.6 },
  sectionBold:{ fontSize:12, fontFamily:'Helvetica-Bold', color:'#0f172a', marginBottom:3 },
  divider:    { height:0.5, backgroundColor:'#e2e8f0', marginBottom:20 },
  metaRow:    { flexDirection:'row', gap:24, marginBottom:24 },
  metaBox:    { flexDirection:'row', gap:6, alignItems:'center' },
  metaLabel:  { fontSize:8.5, color:'#94a3b8' },
  metaVal:    { fontSize:8.5, fontFamily:'Helvetica-Bold', color:'#0f172a' },
  // Table
  thead:      { flexDirection:'row', backgroundColor:'#f8fafc', borderRadius:6, padding:'9pt 12pt', marginBottom:2 },
  th:         { fontSize:8, fontFamily:'Helvetica-Bold', color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 },
  tr:         { flexDirection:'row', padding:'10pt 12pt', borderBottom:'0.5pt solid #f1f5f9' },
  td:         { fontSize:9.5, color:'#0f172a' },
  // Totals
  totalsWrap: { flexDirection:'row', justifyContent:'flex-end', marginTop:16 },
  totalsBox:  { width:'42%' },
  totalRow:   { flexDirection:'row', justifyContent:'space-between', padding:'6pt 0', borderBottom:'0.5pt solid #f1f5f9' },
  totalLabel: { fontSize:9.5, color:'#475569' },
  totalVal:   { fontSize:9.5, color:'#0f172a', fontFamily:'Helvetica-Bold' },
  grandRow:   { flexDirection:'row', justifyContent:'space-between', backgroundColor:'#0d1b2e', padding:'10pt 14pt', borderRadius:8, marginTop:10 },
  grandLabel: { fontSize:11, fontFamily:'Helvetica-Bold', color:'#fff' },
  grandVal:   { fontSize:14, fontFamily:'Helvetica-Bold', color:'#60a5fa' },
  // Notes
  notesBox:   { backgroundColor:'#f8fafc', borderRadius:8, padding:'14pt 16pt', marginTop:24, border:'0.5pt solid #e2e8f0' },
  notesLabel: { fontSize:8, fontFamily:'Helvetica-Bold', color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 },
  notesText:  { fontSize:9, color:'#475569', lineHeight:1.6 },
  footer:     { position:'absolute', bottom:20, left:40, right:40, borderTop:'0.5pt solid #e2e8f0', paddingTop:8, flexDirection:'row', justifyContent:'space-between' },
  footerT:    { fontSize:7.5, color:'#94a3b8' },
  statusBadge:{ backgroundColor:'#dcfce7', borderRadius:99, paddingHorizontal:10, paddingVertical:3 },
  statusText: { fontSize:8, fontFamily:'Helvetica-Bold', color:'#166534' },
})

const fmt = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

export default function InvoicePDF({ data }: { data: InvoiceData }) {
  const subtotal   = data.items.reduce((s, i) => s + i.qty * i.unit_price, 0)
  const taxAmount  = subtotal * (data.tax_rate / 100)
  const total      = subtotal + taxAmount

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>FleetOps</Text>
            <Text style={s.logoSub}>BUS FLEET MANAGEMENT</Text>
          </View>
          <View>
            <Text style={s.invLabel}>INVOICE</Text>
            <Text style={s.invNum}>#{data.invoice_number}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Meta row */}
          <View style={s.metaRow}>
            <View style={s.metaBox}><Text style={s.metaLabel}>Date:</Text><Text style={s.metaVal}>{data.invoice_date}</Text></View>
            <View style={s.metaBox}><Text style={s.metaLabel}>Due:</Text><Text style={s.metaVal}>{data.due_date}</Text></View>
            <View style={[s.metaBox, { marginLeft:'auto' }]}>
              <View style={s.statusBadge}><Text style={s.statusText}>UNPAID</Text></View>
            </View>
          </View>

          <View style={s.divider}/>

          {/* Bill From / Bill To */}
          <View style={s.row2}>
            <View style={s.section}>
              <Text style={s.sectionLabel}>From</Text>
              <Text style={s.sectionBold}>{data.bill_from_name || 'FleetOps'}</Text>
              <Text style={s.sectionVal}>{data.bill_from_address}</Text>
              <Text style={s.sectionVal}>{data.bill_from_email}</Text>
            </View>
            <View style={[s.section, { backgroundColor:'#f8fafc', borderRadius:10, padding:'14pt 16pt' }]}>
              <Text style={s.sectionLabel}>Bill To</Text>
              <Text style={s.sectionBold}>{data.bill_to_name}</Text>
              <Text style={s.sectionVal}>{data.bill_to_address}</Text>
              <Text style={s.sectionVal}>{data.bill_to_email}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={s.thead}>
            <Text style={[s.th, { flex:3 }]}>Description</Text>
            <Text style={[s.th, { width:50, textAlign:'center' }]}>Qty</Text>
            <Text style={[s.th, { width:80, textAlign:'right' }]}>Unit Price</Text>
            <Text style={[s.th, { width:80, textAlign:'right' }]}>Amount</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={[s.tr, i % 2 === 1 ? { backgroundColor:'#fafafa' } : {}]}>
              <Text style={[s.td, { flex:3 }]}>{item.description}</Text>
              <Text style={[s.td, { width:50, textAlign:'center', color:'#64748b' }]}>{item.qty}</Text>
              <Text style={[s.td, { width:80, textAlign:'right', color:'#64748b' }]}>{fmt(item.unit_price)}</Text>
              <Text style={[s.td, { width:80, textAlign:'right', fontFamily:'Helvetica-Bold' }]}>{fmt(item.qty * item.unit_price)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={s.totalsWrap}>
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalVal}>{fmt(subtotal)}</Text>
              </View>
              {data.tax_rate > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Tax ({data.tax_rate}%)</Text>
                  <Text style={s.totalVal}>{fmt(taxAmount)}</Text>
                </View>
              )}
              <View style={s.grandRow}>
                <Text style={s.grandLabel}>Total Due</Text>
                <Text style={s.grandVal}>{fmt(total)}</Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {data.notes && (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Notes / Terms</Text>
              <Text style={s.notesText}>{data.notes}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerT}>FleetOps · Invoice #{data.invoice_number}</Text>
          <Text style={s.footerT} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}/>
        </View>
      </Page>
    </Document>
  )
}
