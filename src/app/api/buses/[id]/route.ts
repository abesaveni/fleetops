import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

async function isAdmin(supabase: any, email: string) {
  const { data } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email',email).single()
  return data?.subscription_type === 'Admin'
}

export async function PATCH(req: NextRequest, { params }: { params: { id:string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  if (!(await isAdmin(supabase, session.user.email!))) return NextResponse.json({ error:'Forbidden' },{ status:403 })
  const body = await req.json()
  const { data, error } = await supabase.from('bus_records').update({
    bus_status: body.bus_status,
    bus_system: body.bus_system||null,
    location: body.location||null,
    bus_age: body.bus_age||null,
    out_of_service_date: body.out_of_service_date||null,
    back_in_service_date: body.back_in_service_date||null,
    estimated_repair_time: body.estimated_repair_time||null,
    problem_description: body.problem_description||null,
    maintenance_comments: body.maintenance_comments||null,
  }).eq('id',params.id).select().single()
  if (error) return NextResponse.json({ error:error.message },{ status:400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id:string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  if (!(await isAdmin(supabase, session.user.email!))) return NextResponse.json({ error:'Forbidden' },{ status:403 })
  const { error } = await supabase.from('bus_records').delete().eq('id',params.id)
  if (error) return NextResponse.json({ error:error.message },{ status:400 })
  return NextResponse.json({ success:true })
}
