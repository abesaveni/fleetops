import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import InvoicePDF from '@/components/InvoicePDF'
import type { InvoiceData } from '@/components/InvoicePDF'

export async function POST(req: NextRequest) {
  const data: InvoiceData = await req.json()
  try {
    const buffer = await renderToBuffer(React.createElement(InvoicePDF, { data }) as any)
    const uint8 = new Uint8Array(buffer)
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${data.invoice_number}.pdf"`,
        'Content-Length': uint8.length.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
