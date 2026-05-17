import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getSuperAdminStats, getAllOrganizations } from '@/lib/organizations'
import SADashboardClient from './SADashboardClient'

export default async function SuperAdminDashboard() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sa } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', session.user.email!)
    .maybeSingle()
  if (!sa) redirect('/dashboard')

  const [stats, orgs] = await Promise.all([
    getSuperAdminStats(),
    getAllOrganizations(),
  ])

  return <SADashboardClient stats={stats} orgs={orgs}/>
}
