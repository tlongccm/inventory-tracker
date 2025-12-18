// Software types matching OpenAPI schemas

// Predefined values for dropdowns
export const SOFTWARE_CATEGORIES = ['Office', 'Security', 'Development', 'Business', 'Utilities'] as const;
export const SOFTWARE_TYPES = ['Subscription', 'Perpetual', 'Volume', 'OEM', 'Freeware', 'Open Source'] as const;
export const SOFTWARE_STATUSES = ['Active', 'Inactive', 'Expired', 'Retired'] as const;

// List item for software table
export interface SoftwareListItem {
  id: number;
  software_id: string;
  category: string | null;
  name: string;
  version: string | null;
  key: string | null;
  type: string | null;
  purchase_date: string | null;
  purchaser: string | null;
  vendor: string | null;
  cost: number | null;
  deployment: string | null;
  install_location: string | null;
  status: string | null;
  comments: string | null;
  is_deleted: boolean;
}

// Full software record
export interface Software {
  id: number;
  software_id: string;
  category: string | null;
  name: string;
  version: string | null;
  key: string | null;
  type: string | null;
  purchase_date: string | null;
  purchaser: string | null;
  vendor: string | null;
  cost: number | null;
  deployment: string | null;
  install_location: string | null;
  status: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

// Request body for creating software
export interface SoftwareCreate {
  name: string;
  category?: string;
  version?: string;
  key?: string;
  type?: string;
  purchase_date?: string;
  purchaser?: string;
  vendor?: string;
  cost?: number;
  deployment?: string;
  install_location?: string;
  status?: string;
  comments?: string;
}

// Request body for updating software
export interface SoftwareUpdate {
  name?: string;
  category?: string;
  version?: string;
  key?: string;
  type?: string;
  purchase_date?: string;
  purchaser?: string;
  vendor?: string;
  cost?: number;
  deployment?: string;
  install_location?: string;
  status?: string;
  comments?: string;
}

// Import result
export interface SoftwareImportResult {
  success_count: number;
  error_count: number;
  errors: SoftwareImportError[];
}

export interface SoftwareImportError {
  row: number;
  field: string | null;
  message: string;
}

// Filter parameters
export interface SoftwareFilters {
  search?: string;
  category?: string;
  status?: string;
  type?: string;
  vendor?: string;
  purchaser?: string;
  deployment?: string;
  sort_by?: 'software_id' | 'category' | 'name' | 'version' | 'type' | 'vendor' | 'status' | 'purchase_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
  include_deleted?: boolean;
}
