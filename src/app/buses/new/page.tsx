import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import BusForm from '@/components/BusForm'

export default async function NewBusPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: sub } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email',session.user.email!).single()
  if (sub?.subscription_type !== 'Admin') redirect('/buses')
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <div style={{ maxWidth:720 }}>
          <div className="page-header">
            <div><h1 className="page-title">Add New Bus</h1><p className="page-subtitle">Fill in the details below</p></div>
          </div>
          <BusForm mode="new"/>
        </div>
      </main>
    </div>
  )
}
