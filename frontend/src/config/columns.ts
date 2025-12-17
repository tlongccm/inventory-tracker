// Column configuration constants for equipment list views
import type { ViewGroupKey } from '../types/viewGroups';

export interface ColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
}

// Always visible columns (Equipment ID, Sub Type, User, Name)
export const ALWAYS_VISIBLE_COLUMNS: ColumnDefinition[] = [
  { key: 'equipment_id', label: 'Equipment ID', sortable: true },
  { key: 'computer_subtype', label: 'Sub Type', sortable: true },
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
    { key: 'manufacturer', label: 'Make', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'notes', label: 'Notes', sortable: false },
  ],
  machineSpec: [
    { key: 'cpu_model', label: 'CPU Model', sortable: true },
    { key: 'ram', label: 'RAM', sortable: true },
    { key: 'storage', label: 'Storage', sortable: true },
    { key: 'operating_system', label: 'OS', sortable: true },
    { key: 'serial_number', label: 'Serial #', sortable: true },
    { key: 'mac_address', label: 'MAC', sortable: false },
  ],
  machinePerformance: [
    { key: 'cpu_score', label: 'CPU Score', sortable: true },
    { key: 'score_2d', label: '2D Score', sortable: true },
    { key: 'score_3d', label: '3D Score', sortable: true },
    { key: 'memory_score', label: 'RAM Score', sortable: true },
    { key: 'disk_score', label: 'Disk Score', sortable: true },
    { key: 'overall_rating', label: 'Overall', sortable: true },
  ],
  assignment: [
    { key: 'assignment_date', label: 'Assigned', sortable: true },
    { key: 'usage_type', label: 'Usage', sortable: true },
    { key: 'ip_address', label: 'IP Address', sortable: false },
  ],
};

// All view group keys for iteration
export const VIEW_GROUP_KEYS: ViewGroupKey[] = ['summary', 'machineSpec', 'machinePerformance', 'assignment'];
