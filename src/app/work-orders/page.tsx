import { redirect } from 'next/navigation'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import WorkOrdersClient from './WorkOrdersClient'

export default async function WorkOrdersPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/no-access')

  const admin = createAdminClient()
  const { data: workOrders } = await admin
    .from('work_orders')
    .select('*, bus:bus_records(bus_id, manufacturer)')
    .eq('org_id', sub.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <WorkOrdersClient workOrders={workOrders ?? []} userRole={sub.subscription_type}/>
      </main>
    </div>
  )
}
