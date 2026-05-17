import { createServerComponentClient, createAdminClient } from './supabase-server'
import type { BusRecord } from '@/types'

export async function getAllBuses(orgId: string): Promise<BusRecord[]> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('bus_records')
    .select('*')
    .eq('org_id', orgId)
    .order('bus_id', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBusById(id: string, orgId: string): Promise<BusRecord | null> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('bus_records')
    .select('*')
    .eq('id', id)
    .eq('org_id', orgId)
    .single()
  if (error) return null
  return data
}

export async function getDashboardCounts(orgId: string) {
  const buses = await getAllBuses(orgId)
  return {
    total: buses.length,
    IS:    buses.filter(b => b.bus_status === 'IS').length,
    OOS:   buses.filter(b => b.bus_status === 'OOS').length,
    InPro: buses.filter(b => b.bus_status === 'InPro').length,
    WP:    buses.filter(b => b.bus_status === 'WP').length,
  }
}

export async function getUserSub(email: string) {
  const supabase = createServerComponentClient()
  const { data } = await supabase
    .from('user_subscriptions')
    .select('id, org_id, subscription_type, is_active, user_email')
    .eq('user_email', email)
    .maybeSingle()
  return data
}

// Reads role + org_id from JWT app_metadata (0 DB queries).
// Falls back to getUserSub() for legacy users without app_metadata.
export async function getSubFromSession(user: {
  email:         string
  app_metadata?: Record<string, unknown>
}) {
  const meta  = (user.app_metadata ?? {}) as Record<string, unknown>
  const role  = typeof meta.role   === 'string' ? meta.role   : null
  const orgId = typeof meta.org_id === 'string' ? meta.org_id : null

  if (role && orgId) {
    return {
      subscription_type: role as string,
      org_id:            orgId as string,
      is_active:         meta.is_active !== false,
      user_email:        user.email,
      id:                '',
    }
  }
  return getUserSub(user.email)
}

// SA: get all buses across all orgs (admin client bypasses RLS)
export async function getAllBusesAdmin(): Promise<(BusRecord & { org_name?: string })[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('bus_records')
    .select('*, organizations(name)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((b: any) => ({ ...b, org_name: b.organizations?.name }))
}

export async function getBusCountByOrg(orgId: string): Promise<number> {
  const admin = createAdminClient()
  const { count } = await admin
    .from('bus_records')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
  return count ?? 0
}
