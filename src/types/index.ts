export type BusStatus = 'IS' | 'OOS' | 'InPro' | 'WP'

export const STATUS_LABELS: Record<BusStatus, string> = {
  IS:    'In Service',
  OOS:   'Out of Service',
  InPro: 'Outfitting & Commissioning',
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
  org_id:                string
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

export interface Organization {
  id:            string
  name:          string
  slug:          string
  owner_email:   string
  plan:          string
  status:        'active' | 'suspended' | 'trial' | 'payment_failed'
  bus_limit:     number | null
  price_per_bus: number | null
  notes:         string | null
  // Braintree billing fields
  braintree_customer_id:          string | null
  braintree_subscription_id:      string | null
  braintree_last_transaction_id:  string | null
  plan_period:     'monthly' | 'yearly' | null
  plan_started_at: string | null
  created_at:    string
  updated_at:    string
}

export interface UserSubscription {
  id:                string
  org_id:            string
  user_email:        string
  subscription_type: 'Admin' | 'Viewer'
  is_active:         boolean
  created_at:        string
}

export interface SuperAdmin {
  id:         string
  user_id:    string
  email:      string
  created_at: string
}

export type OrgRole = 'Admin' | 'Viewer'
export type AppRole = 'SuperAdmin' | 'Admin' | 'Viewer' | 'None'
export type OrgStatus = 'active' | 'suspended' | 'trial'
