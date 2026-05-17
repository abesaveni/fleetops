import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getDashboardCounts, getAllBuses, getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/no-access')

  const [counts, buses] = await Promise.all([
    getDashboardCounts(sub.org_id),
    getAllBuses(sub.org_id),
  ])

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <DashboardClient counts={counts} buses={buses} userRole={sub.subscription_type}/>
      </main>
    </div>
  )
}
