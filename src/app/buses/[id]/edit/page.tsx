import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getBusById, getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusForm from '@/components/BusForm'

export default async function EditBusPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') redirect('/buses')

  const bus = await getBusById(params.id, sub.org_id)
  if (!bus) notFound()

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <div style={{ maxWidth: 720 }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Edit Bus</h1>
              <p className="page-subtitle">{bus.bus_id}</p>
            </div>
          </div>
          <BusForm bus={bus} mode="edit"/>
        </div>
      </main>
    </div>
  )
}
