import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getAllBuses } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import FleetBoardClient from './FleetBoardClient'

export default async function FleetBoardPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: sub } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email', session.user.email!).single()
  const buses = await getAllBuses()
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <FleetBoardClient buses={buses} userRole={sub?.subscription_type ?? 'Viewer'}/>
      </main>
    </div>
  )
}
