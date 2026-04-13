import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { BusRecord } from '@/types'
import { STATUS_LABELS } from '@/types'

const STATUS_COLOR: Record<string,string> = { IS:'#166534', OOS:'#991b1b', InPro:'#9a3412', WP:'#1e40af' }
const STATUS_BG: Record<string,string>    = { IS:'#dcfce7', OOS:'#fee2e2', InPro:'#fff7ed', WP:'#dbeafe' }

const s = StyleSheet.create({
  page:    { fontFamily:'Helvetica', fontSize:9, color:'#0f172a', backgroundColor:'#fff', padding:'36pt 40pt' },
  header:  { flexDirection:'row', justifyContent:'space-between', marginBottom:24, paddingBottom:16, borderBottom:'1pt solid #e2e8f0' },
  logo:    { fontSize:20, fontFamily:'Helvetica-Bold', color:'#0d1b2e' },
  tagline: { fontSize:8, color:'#94a3b8', marginTop:2 },
  statsRow:{ flexDirection:'row', gap:10, marginBottom:20 },
  statBox: { flex:1, borderRadius:8, padding:'10 8', backgroundColor:'#f8fafc', border:'0.5pt solid #e2e8f0', alignItems:'center' },
  statLbl: { fontSize:7, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 },
  statNum: { fontSize:20, fontFamily:'Helvetica-Bold', marginTop:2 },
  secTitle:{ fontSize:10, fontFamily:'Helvetica-Bold', marginBottom:8 },
  tWrap:   { border:'0.5pt solid #e2e8f0', borderRadius:8, overflow:'hidden' },
  thead:   { flexDirection:'row', backgroundColor:'#f8fafc', borderBottom:'0.5pt solid #e2e8f0' },
  th:      { fontSize:7, fontFamily:'Helvetica-Bold', color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.4, padding:'7 10' },
  tr:      { flexDirection:'row', borderBottom:'0.5pt solid #f1f5f9' },
  td:      { fontSize:8.5, padding:'8 10' },
  badge:   { borderRadius:99, paddingHorizontal:7, paddingVertical:2, fontSize:7.5, fontFamily:'Helvetica-Bold' },
  footer:  { position:'absolute', bottom:28, left:40, right:40, borderTop:'0.5pt solid #e2e8f0', paddingTop:10, flexDirection:'row', justifyContent:'space-between' },
  footerT: { fontSize:7.5, color:'#94a3b8' },
})

const W = { id:'12%', status:'18%', system:'18%', location:'16%', age:'10%', oos:'13%', bis:'13%' }

export default function FleetReportPDF({ buses }: { buses: BusRecord[] }) {
  const date  = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})
  const IS    = buses.filter(b=>b.bus_status==='IS').length
  const OOS   = buses.filter(b=>b.bus_status==='OOS').length
  const InPro = buses.filter(b=>b.bus_status==='InPro').length
  const WP    = buses.filter(b=>b.bus_status==='WP').length
  const fmt   = (d:string|null) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.header}>
          <View><Text style={s.logo}>FleetOps</Text><Text style={s.tagline}>Bus Fleet Management System</Text></View>
          <View><Text style={[s.secTitle,{fontSize:11}]}>Fleet Report</Text><Text style={{fontSize:9,color:'#475569'}}>{date}</Text></View>
        </View>
        <View style={s.statsRow}>
          {([['Total Buses',buses.length,'#1d6fce'],['In Service',IS,'#22c55e'],['Out of Service',OOS,'#ef4444'],['Under Repair',InPro,'#f97316'],['Pending',WP,'#3b82f6']] as const).map(([l,v,c])=>(
            <View key={String(l)} style={s.statBox}><Text style={s.statLbl}>{l}</Text><Text style={[s.statNum,{color:c}]}>{v}</Text></View>
          ))}
        </View>
        <Text style={s.secTitle}>Bus Records ({buses.length})</Text>
        <View style={s.tWrap}>
          <View style={s.thead}>
            <Text style={[s.th,{width:W.id}]}>Bus ID</Text>
            <Text style={[s.th,{width:W.status}]}>Status</Text>
            <Text style={[s.th,{width:W.system}]}>System</Text>
            <Text style={[s.th,{width:W.location}]}>Location</Text>
            <Text style={[s.th,{width:W.age}]}>Age</Text>
            <Text style={[s.th,{width:W.oos}]}>OOS Date</Text>
            <Text style={[s.th,{width:W.bis}]}>BIS Date</Text>
          </View>
          {buses.map((bus,i)=>(
            <View key={bus.id} style={[s.tr,i%2===1?{backgroundColor:'#fafafa'}:{}]}>
              <Text style={[s.td,{width:W.id,fontFamily:'Helvetica-Bold'}]}>{bus.bus_id}</Text>
              <View style={{width:W.status,padding:'6 10',justifyContent:'center'}}>
                <Text style={[s.badge,{backgroundColor:STATUS_BG[bus.bus_status],color:STATUS_COLOR[bus.bus_status]}]}>{STATUS_LABELS[bus.bus_status]}</Text>
              </View>
              <Text style={[s.td,{width:W.system,color:'#475569'}]}>{bus.bus_system??'—'}</Text>
              <Text style={[s.td,{width:W.location,color:'#475569'}]}>{bus.location??'—'}</Text>
              <Text style={[s.td,{width:W.age,color:'#475569'}]}>{bus.bus_age??'—'}</Text>
              <Text style={[s.td,{width:W.oos,color:'#475569'}]}>{fmt(bus.out_of_service_date)}</Text>
              <Text style={[s.td,{width:W.bis,color:'#475569'}]}>{fmt(bus.back_in_service_date)}</Text>
            </View>
          ))}
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerT}>FleetOps · {date}</Text>
          <Text style={s.footerT} render={({pageNumber,totalPages})=>`Page ${pageNumber} of ${totalPages}`}/>
        </View>
      </Page>
    </Document>
  )
}
