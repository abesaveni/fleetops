import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import WorkOrderPDF from '@/components/WorkOrderPDF'
import type { WorkOrder } from '@/types'

export async function POST(req: NextRequest) {
  const { wo }: { wo: WorkOrder } = await req.json()
  try {
    const buffer = await renderToBuffer(React.createElement(WorkOrderPDF, { wo }) as any)
    const uint8  = new Uint8Array(buffer)
    const fname  = `WorkOrder_${wo.wo_number ?? 'export'}_${new Date().toISOString().slice(0, 10)}.pdf`
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${fname}"`,
        'Content-Length':      uint8.length.toString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
