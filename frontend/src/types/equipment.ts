// Equipment types matching OpenAPI schemas

export type EquipmentType = 'PC' | 'Monitor' | 'Scanner' | 'Printer';

export type ComputerSubtype = 'Desktop' | 'Laptop';

export type Status = 'Active' | 'Inactive' | 'Decommissioned' | 'In Repair' | 'In Storage';

export type UsageType = 'Personal' | 'Work';

// List item for inventory table - extended with all view group fields
export interface EquipmentListItem {
  equipment_id: string;
  equipment_type: EquipmentType;
  serial_number: string;
  equipment_name: string | null;
  model: string | null;
  primary_user: string | null;
  status: Status;
  is_deleted: boolean;

  // Always visible fields
  computer_subtype: ComputerSubtype | null;

  // Summary view fields
  manufacturer: string | null;
  location: string | null;
  notes: string | null;

  // Machine Spec view fields
  cpu_model: string | null;
  ram: string | null;
  storage: string | null;
  operating_system: string | null;
  mac_address: string | null;

  // Machine Performance view fields
  cpu_score: number | null;
  score_2d: number | null;
  score_3d: number | null;
  memory_score: number | null;
  disk_score: number | null;
  overall_rating: number | null;

  // Assignment view fields
  assignment_date: string | null;
  usage_type: UsageType | null;
  ip_address: string | null;
}

// Full equipment record
export interface Equipment {
  id: number;
  equipment_id: string;
  equipment_type: EquipmentType;
  serial_number: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;

  // Common equipment fields
  model: string | null;
  manufacturer: string | null;
  manufacturing_date: string | null;
  acquisition_date: string | null;
  location: string | null;
  cost: number | null;

  // PC-specific fields
  computer_subtype: ComputerSubtype | null;
  cpu_model: string | null;
  cpu_speed: string | null;
  operating_system: string | null;
  ram: string | null;
  storage: string | null;
  video_card: string | null;
  display_resolution: string | null;
  mac_address: string | null;

  // Performance fields
  cpu_score: number | null;
  score_2d: number | null;
  score_3d: number | null;
  memory_score: number | null;
  disk_score: number | null;
  overall_rating: number | null;

  // Assignment fields
  equipment_name: string | null;
  ip_address: string | null;
  assignment_date: string | null;
  primary_user: string | null;
  usage_type: UsageType | null;
  status: Status;

  // Notes
  notes: string | null;
}

// Request body for creating equipment
export interface EquipmentCreate {
  equipment_type: EquipmentType;
  serial_number: string;
  model?: string;
  manufacturer?: string;
  computer_subtype?: ComputerSubtype;
  cpu_model?: string;
  cpu_speed?: string;
  operating_system?: string;
  ram?: string;
  storage?: string;
  video_card?: string;
  display_resolution?: string;
  mac_address?: string;
  manufacturing_date?: string;
  acquisition_date?: string;
  location?: string;
  cost?: number;
  cpu_score?: number;
  score_2d?: number;
  score_3d?: number;
  memory_score?: number;
  disk_score?: number;
  overall_rating?: number;
  equipment_name?: string;
  ip_address?: string;
  assignment_date?: string;
  primary_user?: string;
  usage_type?: UsageType;
  status?: Status;
  notes?: string;
}

// Request body for updating equipment
export interface EquipmentUpdate {
  model?: string;
  manufacturer?: string;
  computer_subtype?: ComputerSubtype;
  cpu_model?: string;
  cpu_speed?: string;
  operating_system?: string;
  ram?: string;
  storage?: string;
  video_card?: string;
  display_resolution?: string;
  mac_address?: string;
  manufacturing_date?: string;
  acquisition_date?: string;
  location?: string;
  cost?: number;
  cpu_score?: number;
  score_2d?: number;
  score_3d?: number;
  memory_score?: number;
  disk_score?: number;
  overall_rating?: number;
  equipment_name?: string;
  ip_address?: string;
  assignment_date?: string;
  primary_user?: string;
  usage_type?: UsageType;
  status?: Status;
  notes?: string;
}

// Assignment history item
export interface AssignmentHistoryItem {
  id: number;
  previous_user: string | null;
  previous_usage_type: UsageType | null;
  previous_equipment_name: string | null;
  start_date: string | null;
  end_date: string;
  created_at: string;
}

// Import result
export interface ImportResult {
  total_rows: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  serial_number: string;
  error: string;
}

// API Error
export interface ApiError {
  detail: string;
}

// Filter parameters
export interface EquipmentFilters {
  status?: Status;
  equipment_type?: EquipmentType;
  usage_type?: UsageType;
  location?: string;
  primary_user?: string;
  model?: string;
  min_rating?: number;
  max_rating?: number;
  sort_by?: 'equipment_id' | 'equipment_name' | 'model' | 'primary_user' | 'status' | 'overall_rating' | 'created_at' | 'computer_subtype' | 'manufacturer' | 'location' | 'cpu_model' | 'ram' | 'storage' | 'operating_system' | 'serial_number' | 'cpu_score' | 'score_2d' | 'score_3d' | 'memory_score' | 'disk_score' | 'assignment_date' | 'usage_type';
  sort_order?: 'asc' | 'desc';
  include_deleted?: boolean;
}
