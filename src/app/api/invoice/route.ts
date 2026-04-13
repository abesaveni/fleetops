import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import FleetReportPDF from '@/components/FleetReportPDF'
import type { BusRecord } from '@/types'

export async function POST(req: NextRequest) {
  const { buses }: { buses: BusRecord[] } = await req.json()
  try {
    const buffer = await renderToBuffer(React.createElement(FleetReportPDF, { buses }) as any)
    const uint8 = new Uint8Array(buffer)
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FleetOps_${new Date().toISOString().slice(0,10)}.pdf"`,
        'Content-Length': uint8.length.toString(),
      },
    })
  } catch(err:any) { return NextResponse.json({ error:err.message },{ status:500 }) }
}
