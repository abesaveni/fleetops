import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import InvoiceClient from './InvoiceClient'

export default async function InvoicePage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const { data: sub } = await supabase.from('user_subscriptions').select('subscription_type').eq('user_email', session.user.email!).single()
  if (sub?.subscription_type !== 'Admin') redirect('/dashboard')
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <InvoiceClient/>
      </main>
    </div>
  )
}
