import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import OrgsClient from './OrgsClient'

export default async function OrganizationsPage() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: sa } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', session.user.email!)
    .maybeSingle()
  if (!sa) redirect('/dashboard')

  const admin = createAdminClient()
  const { data: orgs } = await admin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  // Get bus counts
  const orgsWithCounts = await Promise.all(
    (orgs ?? []).map(async (org: any) => {
      const { count } = await admin
        .from('bus_records')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id)
      return { ...org, bus_count: count ?? 0 }
    })
  )

  return <OrgsClient orgs={orgsWithCounts}/>
}
