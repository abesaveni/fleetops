import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import InvoiceClient from './InvoiceClient'

export default async function InvoicePage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active) redirect('/dashboard')

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <InvoiceClient/>
      </main>
    </div>
  )
}
