import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getAllBuses, getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusListClient from './BusListClient'
import type { BusStatus } from '@/types'

export default async function BusesPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/no-access')

  const buses = await getAllBuses(sub.org_id)
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <BusListClient
          buses={buses}
          initialStatus={(searchParams.status as BusStatus) ?? null}
          initialSearch={searchParams.q ?? ''}
          userRole={sub.subscription_type}
        />
      </main>
    </div>
  )
}
