/**
 * TypeScript types for Subscription.
 */

export type SubscriptionStatus = 'Active' | 'Inactive';
export type ValueLevel = 'H' | 'M' | 'L';
export type PaymentFrequency = 'Monthly' | 'Annual' | 'Other';
export type RenewalStatus = 'ok' | 'warning' | 'urgent' | 'overdue';

export interface SubscriptionListItem {
  subscription_id: string;
  provider: string;
  category_id: number | null;
  category_name: string | null;
  subcategory_id: number | null;
  subcategory_name: string | null;
  status: SubscriptionStatus;
  ccm_owner: string | null;
  is_deleted: boolean;
  renewal_date: string | null;
  renewal_status: RenewalStatus | null;

  // Access View fields
  link: string | null;
  authentication: string | null;
  username: string | null;
  password: string | null;
  in_lastpass: boolean | null;
  access_level_required: string | null;

  // Financial View fields
  payment_method: string | null;
  cost: string | null;
  annual_cost: number | null;
  payment_frequency: PaymentFrequency | null;
  notes: string | null;

  // Communication View fields
  subscriber_email: string | null;
  forward_to: string | null;
  email_routing: string | null;
  email_volume_per_week: string | null;
  main_vendor_contact: string | null;

  // Details View fields
  description_value: string | null;
  value_level: ValueLevel | null;
  subscription_log: string | null;
  actions_todos: string | null;
  last_confirmed_alive: string | null;
}

export interface Subscription {
  id: number;
  subscription_id: string;
  provider: string;
  category_id: number | null;
  category_name: string | null;
  subcategory_id: number | null;
  subcategory_name: string | null;
  link: string | null;
  authentication: string | null;
  username: string | null;
  password: string | null; // Deobfuscated (plaintext)
  in_lastpass: boolean | null;
  status: SubscriptionStatus;
  description_value: string | null;
  value_level: ValueLevel | null;
  ccm_owner: string | null;
  subscription_log: string | null;
  payment_method: string | null;
  cost: string | null;
  annual_cost: number | null;
  payment_frequency: PaymentFrequency | null;
  notes: string | null;
  renewal_date: string | null;
  last_confirmed_alive: string | null;
  main_vendor_contact: string | null;
  subscriber_email: string | null;
  forward_to: string | null;
  email_routing: string | null;
  email_volume_per_week: string | null;
  actions_todos: string | null;
  access_level_required: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface SubscriptionCreate {
  provider: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  link?: string | null;
  authentication?: string | null;
  username?: string | null;
  password?: string | null;
  in_lastpass?: boolean | null;
  status?: SubscriptionStatus;
  description_value?: string | null;
  value_level?: ValueLevel | null;
  ccm_owner?: string | null;
  subscription_log?: string | null;
  payment_method?: string | null;
  cost?: string | null;
  annual_cost?: number | null;
  payment_frequency?: PaymentFrequency | null;
  notes?: string | null;
  renewal_date?: string | null;
  last_confirmed_alive?: string | null;
  main_vendor_contact?: string | null;
  subscriber_email?: string | null;
  forward_to?: string | null;
  email_routing?: string | null;
  email_volume_per_week?: string | null;
  actions_todos?: string | null;
  access_level_required?: string | null;
}

export interface SubscriptionUpdate {
  provider?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  link?: string | null;
  authentication?: string | null;
  username?: string | null;
  password?: string | null;
  in_lastpass?: boolean | null;
  status?: SubscriptionStatus;
  description_value?: string | null;
  value_level?: ValueLevel | null;
  ccm_owner?: string | null;
  subscription_log?: string | null;
  payment_method?: string | null;
  cost?: string | null;
  annual_cost?: number | null;
  payment_frequency?: PaymentFrequency | null;
  notes?: string | null;
  renewal_date?: string | null;
  last_confirmed_alive?: string | null;
  main_vendor_contact?: string | null;
  subscriber_email?: string | null;
  forward_to?: string | null;
  email_routing?: string | null;
  email_volume_per_week?: string | null;
  actions_todos?: string | null;
  access_level_required?: string | null;
}

export interface SubscriptionFilters {
  search?: string;
  status?: SubscriptionStatus;
  category_id?: number;
  subcategory_id?: number;
  value_level?: ValueLevel;
  ccm_owner?: string;
  include_deleted?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SubscriptionImportError {
  row: number;
  provider: string;
  error: string;
}

export interface SubscriptionImportResult {
  total_rows: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: SubscriptionImportError[];
}
