import { redirect } from 'next/navigation'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusForm from '@/components/BusForm'

export default async function NewBusPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/buses')

  // Check bus limit server-side — redirect before showing the form
  const admin = createAdminClient()
  const [countRes, orgRes] = await Promise.all([
    admin.from('bus_records').select('id', { count: 'exact', head: true }).eq('org_id', sub.org_id),
    admin.from('organizations').select('bus_limit').eq('id', sub.org_id).single(),
  ])
  const busLimit = orgRes.data?.bus_limit ?? null
  const busCount = countRes.count ?? 0
  if (busLimit !== null && busCount >= busLimit) redirect('/upgrade')

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <div style={{ maxWidth: 720 }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Add New Bus</h1>
              <p className="page-subtitle">Fill in the bus details below</p>
            </div>
          </div>
          <BusForm mode="new" userRole={sub.subscription_type}/>
        </div>
      </main>
    </div>
  )
}
