import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getBusById } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import BusDetailClient from './BusDetailClient'

export default async function BusDetailPage({ params }: { params: { id:string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const [bus, subResult] = await Promise.all([
    getBusById(params.id),
    supabase.from('user_subscriptions').select('subscription_type').eq('user_email',session.user.email!).eq('is_active',true).single()
  ])
  if (!bus) notFound()
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <BusDetailClient bus={bus} userRole={subResult.data?.subscription_type??'Viewer'}/>
      </main>
    </div>
  )
}
