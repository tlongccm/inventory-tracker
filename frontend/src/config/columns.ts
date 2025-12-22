// Column configuration constants for equipment list views
import type { ViewGroupKey } from '../types/viewGroups';

export interface ColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
}

// Always visible columns (Equipment ID, Subcategory, User, Name)
export const ALWAYS_VISIBLE_COLUMNS: ColumnDefinition[] = [
  { key: 'equipment_id', label: 'Equipment ID', sortable: true },
  { key: 'computer_subtype', label: 'Subcategory', sortable: true },
  { key: 'primary_user', label: 'User', sortable: true },
  { key: 'equipment_name', label: 'Name', sortable: true },
];

// Status column is always last
export const STATUS_COLUMN: ColumnDefinition = {
  key: 'status',
  label: 'Status',
  sortable: true,
};

// View group column definitions
export const VIEW_GROUP_COLUMNS: Record<ViewGroupKey, ColumnDefinition[]> = {
  summary: [
    { key: 'equipment_type', label: 'Category', sortable: true },
    { key: 'manufacturer', label: 'Manufacturer', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'purpose', label: 'Purpose', sortable: true },
    { key: 'ownership', label: 'Ownership', sortable: true },
    { key: 'ip_address', label: 'IP Address', sortable: false },
    { key: 'overall_rating', label: 'Overall Rating', sortable: true },
  ],
  spec: [
    { key: 'cpu_model', label: 'CPU Model', sortable: true },
    { key: 'cpu_speed', label: 'CPU Base Speed', sortable: true },
    { key: 'operating_system', label: 'Operating System', sortable: true },
    { key: 'ram', label: 'RAM', sortable: true },
    { key: 'storage', label: 'Storage', sortable: true },
    { key: 'video_card', label: 'Video Card', sortable: true },
    { key: 'display_resolution', label: 'Display Resolution', sortable: true },
    { key: 'mac_lan', label: 'MAC (LAN)', sortable: false },
    { key: 'mac_wlan', label: 'MAC (WLAN)', sortable: false },
  ],
  performance: [
    { key: 'cpu_score', label: 'CPU Score', sortable: true },
    { key: 'score_2d', label: '2D Score', sortable: true },
    { key: 'score_3d', label: '3D Score', sortable: true },
    { key: 'memory_score', label: 'Memory Score', sortable: true },
    { key: 'disk_score', label: 'Disk Score', sortable: true },
    { key: 'overall_rating', label: 'Overall Rating', sortable: true },
  ],
  history: [
    { key: 'manufacturing_date', label: 'Manufacturing Date', sortable: true },
    { key: 'acquisition_date', label: 'Acquisition Date', sortable: true },
    { key: 'assignment_date', label: 'Assignment Date', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
    { key: 'notes', label: 'Notes', sortable: false },
  ],
  // Full is a meta-toggle, it has no unique columns (it enables all other views)
  full: [],
};

// All view group keys for iteration (full is last as it's a meta-toggle)
export const VIEW_GROUP_KEYS: ViewGroupKey[] = ['summary', 'spec', 'performance', 'history', 'full'];
