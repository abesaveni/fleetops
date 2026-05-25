export type BusStatus = 'IS' | 'OOS' | 'UR' | 'PP' | 'RS'

export const STATUS_LABELS: Record<BusStatus, string> = {
  IS:  'In Service',
  OOS: 'Out of Service',
  UR:  'Under Repair',
  PP:  'Pending Parts',
  RS:  'Returned to Service',
}

export const STATUS_COLORS: Record<BusStatus, { bg: string; text: string; dot: string }> = {
  IS:  { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  OOS: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  UR:  { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  PP:  { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
  RS:  { bg: '#d0f4f7', text: '#0e7490', dot: '#06b6d4' },
}

export interface BusRecord {
  id:                    string
  org_id:                string
  bus_id:                string
  bus_status:            BusStatus
  manufacturer:          string | null
  year_of_manufacture:   string | null
  bus_system:            string | null
  location:              string | null
  bus_age:               string | null
  out_of_service_date:   string | null
  back_in_service_date:  string | null
  estimated_repair_time: string | null
  problem_description:   string | null
  maintenance_comments:  string | null
  labour_cost:           number | null
  parts_cost:            number | null
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
  subscription_type: 'Admin' | 'Dispatch' | 'Maintenance' | 'ViewOnly'
  is_active:         boolean
  created_at:        string
}

export interface WorkOrder {
  id:                    string
  org_id:                string
  bus_record_id:         string
  wo_number:             string
  status:                'open' | 'under_repair' | 'pending_parts' | 'completed' | 'closed' | 'returned_to_service'
  date_out_of_service:   string | null
  problem_description:   string | null
  asset_location:        string | null
  bus_system:            string | null
  estimated_repair_time: string | null
  back_in_service_date:  string | null
  maintenance_comments:  string | null
  labour_cost:           number | null
  parts_cost:            number | null
  created_by:            string | null
  assigned_to:           string | null
  created_at:            string
  updated_at:            string
  closed_at:             string | null
  bus?: { bus_id: string; manufacturer: string | null }
}

export interface SuperAdmin {
  id:         string
  user_id:    string
  email:      string
  created_at: string
}

export type OrgRole = 'Admin' | 'Dispatch' | 'Maintenance' | 'ViewOnly'
export type AppRole = 'SuperAdmin' | 'Admin' | 'Dispatch' | 'Maintenance' | 'ViewOnly' | 'None'
export type OrgStatus = 'active' | 'suspended' | 'trial'
