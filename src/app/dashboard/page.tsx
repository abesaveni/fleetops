import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getDashboardCounts, getAllBuses } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const [counts, buses] = await Promise.all([getDashboardCounts(), getAllBuses()])
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <DashboardClient counts={counts} buses={buses}/>
      </main>
    </div>
  )
}
