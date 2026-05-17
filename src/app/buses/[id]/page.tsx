import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getBusById, getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusDetailClient from './BusDetailClient'

export default async function BusDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/no-access')

  const bus = await getBusById(params.id, sub.org_id)
  if (!bus) notFound()

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <BusDetailClient bus={bus} userRole={sub.subscription_type}/>
      </main>
    </div>
  )
}
