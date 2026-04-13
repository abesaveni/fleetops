import { createServerComponentClient } from './supabase-server'
import type { BusRecord, BusStatus } from '@/types'

export async function getAllBuses(): Promise<BusRecord[]> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('bus_records')
    .select('*')
    .order('bus_id', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBusById(id: string): Promise<BusRecord | null> {
  const supabase = createServerComponentClient()
  const { data, error } = await supabase
    .from('bus_records')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getDashboardCounts() {
  const buses = await getAllBuses()
  return {
    total: buses.length,
    IS:    buses.filter(b => b.bus_status === 'IS').length,
    OOS:   buses.filter(b => b.bus_status === 'OOS').length,
    InPro: buses.filter(b => b.bus_status === 'InPro').length,
    WP:    buses.filter(b => b.bus_status === 'WP').length,
  }
}
