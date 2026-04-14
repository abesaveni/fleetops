export type BusStatus = 'IS' | 'OOS' | 'InPro' | 'WP'

export const STATUS_LABELS: Record<BusStatus, string> = {
  IS:    'In Service',
  OOS:   'Out of Service',
  InPro: 'Outfitting and Commissioning',
  WP:    'Pending',
}

export const STATUS_COLORS: Record<BusStatus, { bg: string; text: string; dot: string }> = {
  IS:    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  OOS:   { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  InPro: { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  WP:    { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
}

export interface BusRecord {
  id:                    string
  bus_id:                string
  bus_status:            BusStatus
  bus_system:            string | null
  location:              string | null
  bus_age:               string | null
  out_of_service_date:   string | null
  back_in_service_date:  string | null
  estimated_repair_time: string | null
  problem_description:   string | null
  maintenance_comments:  string | null
  created_at:            string
  updated_at:            string
}

export type BusRecordInsert = Omit<BusRecord, 'id' | 'created_at' | 'updated_at'>
export type UserRole = 'Admin' | 'Viewer' | 'None'

export interface UserSubscription {
  id:                string
  user_email:        string
  subscription_type: UserRole
  is_active:         boolean
}
