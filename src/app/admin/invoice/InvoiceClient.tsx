'use client'
import { useState, useMemo } from 'react'
import Toast from '@/components/Toast'

interface LineItem { description: string; qty: string; unit_price: string }

const today = () => new Date().toISOString().slice(0, 10)
const due30  = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10) }
const nextInv = () => `INV-${Date.now().toString().slice(-6)}`

const fmt = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

export default function InvoiceClient() {
  const [toast, setToast]       = useState<string|null>(null)
  const [generating, setGen]    = useState(false)

  const [meta, setMeta] = useState({
    invoice_number: nextInv(),
    invoice_date: today(),
    due_date: due30(),
    bill_from_name: 'FleetOps',
    bill_from_address: '',
    bill_from_email: '',
    bill_to_name: '',
    bill_to_address: '',
    bill_to_email: '',
    tax_rate: '0',
    notes: 'Payment is due within 30 days of invoice date. Thank you for your business.',
  })

  const [items, setItems] = useState<LineItem[]>([
    { description: '', qty: '1', unit_price: '0' },
  ])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const setM = (k: string, v: string) => setMeta(m => ({ ...m, [k]: v }))

  function addItem()         { setItems(i => [...i, { description:'', qty:'1', unit_price:'0' }]) }
  function removeItem(i: number) { setItems(it => it.filter((_, idx) => idx !== i)) }
  function setItem(i: number, k: keyof LineItem, v: string) {
    setItems(it => it.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  }

  const calcs = useMemo(() => {
    const lineItems = items.map(it => ({
      description: it.description,
      qty: parseFloat(it.qty) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
    }))
    const subtotal  = lineItems.reduce((s, i) => s + i.qty * i.unit_price, 0)
    const taxRate   = parseFloat(meta.tax_rate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total     = subtotal + taxAmount
    return { lineItems, subtotal, taxRate, taxAmount, total }
  }, [items, meta.tax_rate])

  async function handleGenerate() {
    if (!meta.bill_to_name) { showToast('Please fill in Bill To name'); return }
    if (calcs.lineItems.every(i => !i.description)) { showToast('Add at least one line item'); return }
    setGen(true)
    try {
      const res = await fetch('/api/admin/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meta, tax_rate: calcs.taxRate, items: calcs.lineItems }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `Invoice_${meta.invoice_number}.pdf`; a.click()
      URL.revokeObjectURL(url)
      showToast('Invoice downloaded')
    } catch (e: any) { showToast(e.message || 'Error generating invoice') }
    finally { setGen(false) }
  }

  const inputStyle: React.CSSProperties = { width:'100%', padding:'8px 12px', border:'1px solid var(--border-2)', borderRadius:8, fontSize:13, fontFamily:'inherit', color:'var(--text-primary)', background:'var(--surface)', outline:'none' }
  const labelStyle: React.CSSProperties = { fontSize:12, fontWeight:500, color:'var(--text-secondary)', marginBottom:4, display:'block' }

  return (
    <>
      {toast && <Toast message={toast}/>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Generator</h1>
          <p className="page-subtitle">Create and download professional invoices as PDF</p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating} style={{ padding:'10px 20px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {generating ? 'Generating PDF…' : 'Download Invoice PDF'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>

        {/* LEFT — Main Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Invoice Meta */}
          <div className="card">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, margin:'0 0 16px' }}>Invoice Details</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              {[['invoice_number','Invoice Number'],['invoice_date','Invoice Date','date'],['due_date','Due Date','date']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input style={inputStyle} type={t||'text'} value={(meta as any)[k]} onChange={e => setM(k, e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          {/* Bill From / To */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, margin:'0 0 14px', color:'var(--text-secondary)' }}>Bill From</h3>
              {[['bill_from_name','Company / Name'],['bill_from_address','Address'],['bill_from_email','Email']].map(([k,l]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <label style={labelStyle}>{l}</label>
                  <input style={inputStyle} value={(meta as any)[k]} onChange={e => setM(k, e.target.value)} placeholder={k==='bill_from_name'?'FleetOps':''}/>
                </div>
              ))}
            </div>
            <div className="card" style={{ border:'1.5px solid var(--brand)', boxShadow:'0 0 0 3px rgba(29,111,206,0.07)' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, margin:'0 0 14px', color:'var(--brand)' }}>Bill To *</h3>
              {[['bill_to_name','Company / Name *'],['bill_to_address','Address'],['bill_to_email','Email']].map(([k,l]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <label style={labelStyle}>{l}</label>
                  <input style={inputStyle} value={(meta as any)[k]} onChange={e => setM(k, e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, margin:0 }}>Line Items</h3>
              <button className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:12 }} onClick={addItem}>+ Add Item</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--surface-2)' }}>
                  <th style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:500, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--border)' }}>Description</th>
                  <th style={{ padding:'9px 14px', textAlign:'center', fontSize:11, fontWeight:500, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--border)', width:80 }}>Qty</th>
                  <th style={{ padding:'9px 14px', textAlign:'right', fontSize:11, fontWeight:500, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--border)', width:120 }}>Unit Price</th>
                  <th style={{ padding:'9px 14px', textAlign:'right', fontSize:11, fontWeight:500, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:'1px solid var(--border)', width:120 }}>Amount</th>
                  <th style={{ width:40, borderBottom:'1px solid var(--border)' }}/>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const amt = (parseFloat(item.qty)||0) * (parseFloat(item.unit_price)||0)
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'8px 14px' }}>
                        <input style={{ ...inputStyle, border:'none', background:'transparent', padding:'4px 0' }}
                          placeholder="Item description…" value={item.description} onChange={e => setItem(i,'description',e.target.value)}/>
                      </td>
                      <td style={{ padding:'8px 14px', textAlign:'center' }}>
                        <input style={{ ...inputStyle, textAlign:'center', border:'none', background:'transparent', padding:'4px 0' }}
                          type="number" min="0" step="1" value={item.qty} onChange={e => setItem(i,'qty',e.target.value)}/>
                      </td>
                      <td style={{ padding:'8px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
                          <span style={{ color:'var(--text-muted)', fontSize:13 }}>$</span>
                          <input style={{ ...inputStyle, textAlign:'right', border:'none', background:'transparent', padding:'4px 0', width:90 }}
                            type="number" min="0" step="0.01" value={item.unit_price} onChange={e => setItem(i,'unit_price',e.target.value)}/>
                        </div>
                      </td>
                      <td style={{ padding:'8px 14px', textAlign:'right', fontWeight:600, fontSize:14 }}>{fmt(amt)}</td>
                      <td style={{ padding:'8px 10px', textAlign:'center' }}>
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16, lineHeight:1, padding:'2px 6px' }}>×</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, margin:'0 0 12px' }}>Notes / Payment Terms</h3>
            <textarea style={{ ...inputStyle, resize:'vertical' as any }} rows={3} value={meta.notes} onChange={e => setM('notes', e.target.value)}/>
          </div>
        </div>

        {/* RIGHT — Live Summary */}
        <div style={{ position:'sticky', top:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ background:'var(--sidebar-bg)', border:'none' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'#fff', margin:'0 0 16px' }}>Invoice Summary</h3>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {items.map((item, i) => {
                const amt = (parseFloat(item.qty)||0) * (parseFloat(item.unit_price)||0)
                if (!item.description && !amt) return null
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                    <span style={{ color:'#94b4d4', flex:1, marginRight:8 }} >{item.description || `Item ${i+1}`} {item.qty !== '1' ? `×${item.qty}` : ''}</span>
                    <span style={{ color:'#fff', fontWeight:500 }}>{fmt(amt)}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:14, display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#94b4d4' }}>Subtotal</span>
                <span style={{ color:'#fff' }}>{fmt(calcs.subtotal)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:'#94b4d4' }}>Tax</span>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <input
                      type="number" min="0" max="100" step="0.1"
                      value={meta.tax_rate}
                      onChange={e => setM('tax_rate', e.target.value)}
                      style={{ width:44, padding:'2px 6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:12, textAlign:'center', fontFamily:'inherit', outline:'none' }}
                    />
                    <span style={{ color:'#94b4d4', fontSize:12 }}>%</span>
                  </div>
                </div>
                <span style={{ color:'#fff' }}>{fmt(calcs.taxAmount)}</span>
              </div>
            </div>

            <div style={{ marginTop:14, background:'rgba(29,111,206,0.25)', border:'1px solid rgba(29,111,206,0.4)', borderRadius:10, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'#fff' }}>Total Due</span>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:24, color:'#60a5fa', letterSpacing:'-0.02em' }}>{fmt(calcs.total)}</span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12, fontWeight:500 }}>Invoice Preview</div>
            <div style={{ fontSize:13, display:'flex', flexDirection:'column', gap:6 }}>
              {[
                ['Invoice #', meta.invoice_number],
                ['Date', meta.invoice_date],
                ['Due', meta.due_date],
                ['Bill To', meta.bill_to_name || '—'],
                ['Items', `${items.length} line item${items.length!==1?'s':''}`],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight:500, color:'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating} style={{ justifyContent:'center', padding:'12px', fontSize:14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {generating ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </>
  )
}
