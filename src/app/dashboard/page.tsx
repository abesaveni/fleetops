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

  const [rawCounts, buses] = await Promise.all([
    getDashboardCounts(sub.org_id),
    getAllBuses(sub.org_id),
  ])
  const counts = { total: rawCounts.total, IS: rawCounts.IS, OOS: rawCounts.OOS, UR: rawCounts.UR ?? 0, PP: rawCounts.PP ?? 0 }

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <DashboardClient counts={counts as any} buses={buses} userRole={sub.subscription_type}/>
      </main>
    </div>
  )
}
