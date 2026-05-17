import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getSubFromSession } from '@/lib/buses'
import Sidebar from '@/components/Sidebar'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sub = await getSubFromSession(session.user as any)
  if (!sub || !sub.is_active || sub.subscription_type !== 'Admin') redirect('/dashboard')

  return (
    <div className="layout">
      <Sidebar/>
      <main className="main-content">
        <UsersClient currentUserEmail={session.user.email!}/>
      </main>
    </div>
  )
}
