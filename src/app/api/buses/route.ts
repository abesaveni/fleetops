import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  const { data: sub } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email',session.user.email!).single()
  if (sub?.subscription_type !== 'Admin') return NextResponse.json({ error:'Forbidden' },{ status:403 })
  const body = await req.json()
  const { data, error } = await supabase.from('bus_records').insert([{
    bus_id: body.bus_id,
    bus_status: body.bus_status||'IS',
    bus_system: body.bus_system||null,
    location: body.location||null,
    bus_age: body.bus_age||null,
    out_of_service_date: body.out_of_service_date||null,
    back_in_service_date: body.back_in_service_date||null,
    estimated_repair_time: body.estimated_repair_time||null,
    problem_description: body.problem_description||null,
    maintenance_comments: body.maintenance_comments||null,
  }]).select().single()
  if (error) return NextResponse.json({ error:error.message },{ status:400 })
  return NextResponse.json(data,{ status:201 })
}
