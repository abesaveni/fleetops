import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { BusRecord } from '@/types'
import { STATUS_LABELS } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'FleetOps <onboarding@resend.dev>'

function statusHtml(bus: BusRecord) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f0f4fa;">
  <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">FleetOps</h1>
    <p style="font-size:13px;color:#94a3b8;margin:0 0 24px;">Bus Fleet Management</p>
    <h2 style="font-size:18px;color:#0f172a;margin:0 0 20px;">Bus Status Notification</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:10px 0;color:#475569;border-bottom:1px solid #f1f5f9;width:40%">Bus ID</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #f1f5f9;">${bus.bus_id}</td></tr>
      <tr><td style="padding:10px 0;color:#475569;border-bottom:1px solid #f1f5f9;">Status</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${STATUS_LABELS[bus.bus_status]}</td></tr>
      ${bus.bus_system?`<tr><td style="padding:10px 0;color:#475569;">System</td><td style="padding:10px 0;">${bus.bus_system}</td></tr>`:''}
      ${bus.location?`<tr><td style="padding:10px 0;color:#475569;">Location</td><td style="padding:10px 0;">${bus.location}</td></tr>`:''}
      ${bus.problem_description?`<tr><td style="padding:10px 0;color:#475569;vertical-align:top;">Problem</td><td style="padding:10px 0;">${bus.problem_description}</td></tr>`:''}
    </table>
  </div></div>`
}

function reportHtml(buses: BusRecord[]) {
  const total=buses.length, IS=buses.filter(b=>b.bus_status==='IS').length, OOS=buses.filter(b=>b.bus_status==='OOS').length, InPro=buses.filter(b=>b.bus_status==='InPro').length, WP=buses.filter(b=>b.bus_status==='WP').length
  const date=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})
  const rows=buses.map(b=>`<tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-weight:500;">${b.bus_id}</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">${STATUS_LABELS[b.bus_status]}</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#475569;">${b.bus_system??'—'}</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#475569;">${b.location??'—'}</td></tr>`).join('')
  return `<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:32px 24px;background:#f0f4fa;">
  <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Fleet Report</h1>
    <p style="font-size:13px;color:#94a3b8;margin:0 0 24px;">${date}</p>
    <div style="display:flex;gap:12px;margin-bottom:28px;">
      ${[['Total',total,'#1d6fce'],['In Service',IS,'#22c55e'],['Out of Service',OOS,'#ef4444'],['Under Repair',InPro,'#f97316'],['Pending',WP,'#3b82f6']].map(([l,v,c])=>`<div style="flex:1;background:#f8fafc;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;">${l}</div><div style="font-size:24px;font-weight:800;color:${c};">${v}</div></div>`).join('')}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f8fafc;"><th style="padding:10px 12px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;">Bus ID</th><th style="padding:10px 12px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;">Status</th><th style="padding:10px 12px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;">System</th><th style="padding:10px 12px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;">Location</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div></div>`
}

export async function POST(req: NextRequest) {
  const { to, type, bus, buses } = await req.json()
  if (!to) return NextResponse.json({ error:'Missing recipient' },{ status:400 })
  try {
    if (type==='status'&&bus) {
      await resend.emails.send({ from:FROM, to:[to], subject:`FleetOps — Bus ${bus.bus_id}: ${STATUS_LABELS[bus.bus_status as keyof typeof STATUS_LABELS]}`, html:statusHtml(bus) })
    } else if (type==='report'&&buses) {
      await resend.emails.send({ from:FROM, to:[to], subject:`FleetOps — Fleet Report (${new Date().toLocaleDateString('en-GB')})`, html:reportHtml(buses) })
    } else return NextResponse.json({ error:'Invalid type' },{ status:400 })
    return NextResponse.json({ success:true })
  } catch(err:any) { return NextResponse.json({ error:err.message },{ status:500 }) }
}
