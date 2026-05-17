import { createAdminClient } from './supabase-server'
import type { Organization, UserSubscription } from '@/types'

export async function getAllOrganizations(): Promise<Organization[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getOrgUsers(orgId: string): Promise<UserSubscription[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function getSuperAdminStats() {
  const admin = createAdminClient()
  const [orgsRes, busesRes] = await Promise.all([
    admin.from('organizations').select('id, name, status, created_at'),
    admin.from('bus_records').select('id, org_id, bus_status'),
  ])
  const orgs  = orgsRes.data ?? []
  const buses = busesRes.data ?? []
  return {
    totalOrgs:      orgs.length,
    activeOrgs:     orgs.filter((o: any) => o.status === 'active').length,
    suspendedOrgs:  orgs.filter((o: any) => o.status === 'suspended').length,
    trialOrgs:      orgs.filter((o: any) => o.status === 'trial').length,
    totalBuses:     buses.length,
    busesIS:        buses.filter((b: any) => b.bus_status === 'IS').length,
    busesOOS:       buses.filter((b: any) => b.bus_status === 'OOS').length,
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
