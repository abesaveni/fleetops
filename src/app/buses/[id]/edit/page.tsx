import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getBusById } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusForm from '@/components/BusForm'

export default async function EditBusPage({ params }: { params: { id:string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const [bus, subResult] = await Promise.all([
    getBusById(params.id),
    supabase.from('user_subscriptions').select('subscription_type').eq('user_email',session.user.email!).single()
  ])
  if (!bus) notFound()
  if (subResult.data?.subscription_type !== 'Admin') redirect('/buses')
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <div style={{ maxWidth:720 }}>
          <div className="page-header">
            <div><h1 className="page-title">Edit Bus</h1><p className="page-subtitle">{bus.bus_id}</p></div>
          </div>
          <BusForm bus={bus} mode="edit"/>
        </div>
      </main>
    </div>
  )
}
