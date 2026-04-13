import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getAllBuses } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusListClient from './BusListClient'
import type { BusStatus } from '@/types'

export default async function BusesPage({ searchParams }: { searchParams: { status?:string; q?:string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: sub } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email', session.user.email!).eq('is_active',true).single()
  const buses = await getAllBuses()
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <BusListClient buses={buses} initialStatus={(searchParams.status as BusStatus)??null} initialSearch={searchParams.q??''} userRole={sub?.subscription_type??'Viewer'}/>
      </main>
    </div>
  )
}
