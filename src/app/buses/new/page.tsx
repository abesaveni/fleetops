import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusForm from '@/components/BusForm'

export default async function NewBusPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') redirect('/buses')

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
          <BusForm mode="new"/>
        </div>
      </main>
    </div>
  )
}
