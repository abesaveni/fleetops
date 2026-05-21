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

const PLAN_MONTHLY: Record<string, number> = {
  pro:        49,
  business:   149,
  enterprise: 0,
}

export function getPlanMRR(plan: string, period: string | null): number {
  const monthly = PLAN_MONTHLY[plan] ?? 0
  if (!monthly) return 0
  if (period === 'yearly') return Math.round(monthly * 12 * 0.85 / 12)
  return monthly
}

export async function getSuperAdminStats() {
  const admin = createAdminClient()
  const [orgsRes, busesRes] = await Promise.all([
    admin.from('organizations').select('id, name, status, plan, plan_period, created_at'),
    admin.from('bus_records').select('id, org_id, bus_status'),
  ])
  const orgs  = orgsRes.data ?? []
  const buses = busesRes.data ?? []

  const payingOrgs     = orgs.filter((o: any) => o.status === 'active' && PLAN_MONTHLY[o.plan])
  const mrr            = payingOrgs.reduce((sum: number, o: any) => sum + getPlanMRR(o.plan, o.plan_period), 0)
  const paymentFailed  = orgs.filter((o: any) => o.status === 'payment_failed').length

  return {
    totalOrgs:      orgs.length,
    activeOrgs:     orgs.filter((o: any) => o.status === 'active').length,
    suspendedOrgs:  orgs.filter((o: any) => o.status === 'suspended').length,
    trialOrgs:      orgs.filter((o: any) => o.status === 'trial').length,
    payingOrgs:     payingOrgs.length,
    paymentFailed,
    mrr,
    arr:            mrr * 12,
    totalBuses:     buses.length,
    busesIS:        buses.filter((b: any) => b.bus_status === 'IS').length,
    busesOOS:       buses.filter((b: any) => b.bus_status === 'OOS').length,
  }
}

export async function getOrgsWithBilling() {
  const admin = createAdminClient()
  const { data: orgs } = await admin
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  const orgsWithCounts = await Promise.all(
    (orgs ?? []).map(async (org: any) => {
      const { count } = await admin
        .from('bus_records')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id)
      return { ...org, bus_count: count ?? 0 }
    })
  )
  return orgsWithCounts
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
