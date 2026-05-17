import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server'
import { getOrganizationById, getOrgUsers } from '@/lib/organizations'
import OrgDetailClient from './OrgDetailClient'

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sa } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', session.user.email!)
    .maybeSingle()
  if (!sa) redirect('/dashboard')

  const org = await getOrganizationById(params.id)
  if (!org) notFound()

  const admin = createAdminClient()
  const [users, busCountRes] = await Promise.all([
    getOrgUsers(params.id),
    admin.from('bus_records').select('id', { count: 'exact', head: true }).eq('org_id', params.id),
  ])

  return <OrgDetailClient org={org} users={users} busCount={busCountRes.count ?? 0}/>
}
