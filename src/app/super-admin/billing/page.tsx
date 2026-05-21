import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getOrgsWithBilling, getSuperAdminStats } from '@/lib/organizations'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sa } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', session.user.email!)
    .maybeSingle()
  if (!sa) redirect('/dashboard')

  const [orgs, stats] = await Promise.all([
    getOrgsWithBilling(),
    getSuperAdminStats(),
  ])

  return <BillingClient orgs={orgs} stats={stats}/>
}
