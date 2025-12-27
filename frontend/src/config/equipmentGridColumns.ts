/**
 * AG Grid column definitions for Equipment table.
 * Supports additive view groups - multiple groups can be active simultaneously.
 */

import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type { ViewGroupKey, ViewPreferences } from '../types/viewGroups';

// Value formatters
export function dateFormatter(params: ValueFormatterParams): string {
  if (!params.value) return '-';
  const date = new Date(params.value);
  if (isNaN(date.getTime())) return String(params.value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function currencyFormatter(params: ValueFormatterParams): string {
  if (params.value === null || params.value === undefined) return '-';
  const num = typeof params.value === 'string' ? parseFloat(params.value) : params.value;
  if (isNaN(num)) return String(params.value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function numberFormatter(params: ValueFormatterParams): string {
  if (params.value === null || params.value === undefined) return '-';
  const num = typeof params.value === 'number' ? params.value : parseFloat(params.value);
  if (isNaN(num)) return String(params.value);
  return num.toLocaleString('en-US');
}

// Base columns (always visible)
export const BASE_COLUMNS: ColDef[] = [
  { field: 'equipment_id', headerName: 'Equipment ID', width: 130, minWidth: 130, sortable: true, filter: true, colId: 'equipment_id' },
  { field: 'computer_subtype', headerName: 'Subcategory', width: 120, minWidth: 120, sortable: true, filter: true, colId: 'computer_subtype' },
  { field: 'ownership', headerName: 'Ownership', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'ownership' },
  { field: 'primary_user', headerName: 'User', width: 150, minWidth: 150, sortable: true, filter: true, colId: 'primary_user' },
  { field: 'equipment_name', headerName: 'Name', width: 180, minWidth: 180, sortable: true, filter: true, colId: 'equipment_name' },
];

// Status column (always last) - uses StatusCellRenderer
export const STATUS_COLUMN: ColDef = {
  field: 'status',
  headerName: 'Status',
  width: 100,
  minWidth: 100,
  sortable: true,
  filter: true,
  colId: 'status',
  cellRenderer: 'StatusCellRenderer',
};

// Summary view columns (initially hidden unless view is enabled)
export const SUMMARY_COLUMNS: ColDef[] = [
  { field: 'equipment_type', headerName: 'Category', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'equipment_type', hide: true },
  { field: 'manufacturer', headerName: 'Manufacturer', width: 120, minWidth: 120, sortable: true, filter: true, colId: 'manufacturer', hide: true },
  { field: 'model', headerName: 'Model', width: 150, minWidth: 150, sortable: true, filter: true, colId: 'model', hide: true },
  { field: 'purpose', headerName: 'Purpose', width: 120, minWidth: 120, sortable: true, filter: true, colId: 'purpose', hide: true },
  { field: 'ip_address', headerName: 'IP Address', width: 130, minWidth: 130, sortable: false, filter: true, colId: 'ip_address', hide: true },
  { field: 'overall_rating', headerName: 'Overall Rating', width: 110, minWidth: 110, sortable: true, filter: true, colId: 'overall_rating', hide: true, valueFormatter: numberFormatter },
];

// Spec view columns (initially hidden)
export const SPEC_COLUMNS: ColDef[] = [
  { field: 'cpu_model', headerName: 'CPU Model', width: 150, minWidth: 150, sortable: true, filter: true, colId: 'cpu_model', hide: true },
  { field: 'cpu_speed', headerName: 'CPU Base Speed', width: 110, minWidth: 110, sortable: true, filter: true, colId: 'cpu_speed', hide: true },
  { field: 'operating_system', headerName: 'Operating System', width: 140, minWidth: 140, sortable: true, filter: true, colId: 'operating_system', hide: true },
  { field: 'ram', headerName: 'RAM', width: 80, minWidth: 80, sortable: true, filter: true, colId: 'ram', hide: true },
  { field: 'storage', headerName: 'Storage', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'storage', hide: true },
  { field: 'video_card', headerName: 'Video Card', width: 150, minWidth: 150, sortable: true, filter: true, colId: 'video_card', hide: true },
  { field: 'display_resolution', headerName: 'Display Resolution', width: 130, minWidth: 130, sortable: true, filter: true, colId: 'display_resolution', hide: true },
  { field: 'mac_lan', headerName: 'MAC (LAN)', width: 150, minWidth: 150, sortable: false, filter: true, colId: 'mac_lan', hide: true },
  { field: 'mac_wlan', headerName: 'MAC (WLAN)', width: 150, minWidth: 150, sortable: false, filter: true, colId: 'mac_wlan', hide: true },
];

// Performance view columns (initially hidden)
// Note: overall_rating is shared with Summary view
export const PERFORMANCE_COLUMNS: ColDef[] = [
  { field: 'cpu_score', headerName: 'CPU Score', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'cpu_score', hide: true, valueFormatter: numberFormatter },
  { field: 'score_2d', headerName: '2D Score', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'score_2d', hide: true, valueFormatter: numberFormatter },
  { field: 'score_3d', headerName: '3D Score', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'score_3d', hide: true, valueFormatter: numberFormatter },
  { field: 'memory_score', headerName: 'Memory Score', width: 110, minWidth: 110, sortable: true, filter: true, colId: 'memory_score', hide: true, valueFormatter: numberFormatter },
  { field: 'disk_score', headerName: 'Disk Score', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'disk_score', hide: true, valueFormatter: numberFormatter },
];

// History view columns (initially hidden) - notes uses MarkdownCellRenderer
export const HISTORY_COLUMNS: ColDef[] = [
  { field: 'manufacturing_date', headerName: 'Manufacturing Date', width: 140, minWidth: 140, sortable: true, filter: true, colId: 'manufacturing_date', hide: true, valueFormatter: dateFormatter },
  { field: 'acquisition_date', headerName: 'Acquisition Date', width: 130, minWidth: 130, sortable: true, filter: true, colId: 'acquisition_date', hide: true, valueFormatter: dateFormatter },
  { field: 'assignment_date', headerName: 'Assignment Date', width: 130, minWidth: 130, sortable: true, filter: true, colId: 'assignment_date', hide: true, valueFormatter: dateFormatter },
  { field: 'cost', headerName: 'Cost', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'cost', hide: true, type: 'rightAligned', valueFormatter: currencyFormatter },
  { field: 'notes', headerName: 'Notes', width: 300, minWidth: 300, sortable: false, filter: true, colId: 'notes', hide: true, cellRenderer: 'MarkdownCellRenderer' },
];

// All columns combined in order: base, summary, spec, performance, history, status (last)
export const ALL_COLUMNS: ColDef[] = [
  ...BASE_COLUMNS,
  ...SUMMARY_COLUMNS,
  ...SPEC_COLUMNS,
  ...PERFORMANCE_COLUMNS,
  ...HISTORY_COLUMNS,
  STATUS_COLUMN,
];

// Column ID arrays for visibility toggling via gridApi.setColumnsVisible()
export const VIEW_GROUP_COL_IDS: Record<ViewGroupKey, string[]> = {
  summary: ['equipment_type', 'manufacturer', 'model', 'purpose', 'ip_address', 'overall_rating'],
  spec: ['cpu_model', 'cpu_speed', 'operating_system', 'ram', 'storage', 'video_card', 'display_resolution', 'mac_lan', 'mac_wlan'],
  performance: ['cpu_score', 'score_2d', 'score_3d', 'memory_score', 'disk_score', 'overall_rating'],
  history: ['manufacturing_date', 'acquisition_date', 'assignment_date', 'cost', 'notes'],
  full: [], // Meta-toggle, no unique columns
};

// Base column IDs (always visible)
export const BASE_COL_IDS = ['equipment_id', 'computer_subtype', 'ownership', 'primary_user', 'equipment_name', 'status'];

// Default column definition for AG Grid
export const defaultColDef: ColDef = {
  resizable: true,
  suppressMovable: true,
  suppressAutoSize: true,
  suppressSizeToFit: true,
  filter: true,
  floatingFilter: false,
  menuTabs: ['filterMenuTab'],
  minWidth: 80,
  flex: 0,
};

// Status bar configuration with aggregation for cell selection
export const statusBarConfig = {
  statusPanels: [
    {
      statusPanel: 'agTotalRowCountComponent',
      align: 'left' as const,
    },
    {
      statusPanel: 'agAggregationComponent',
      statusPanelParams: {
        aggFuncs: ['count', 'sum', 'avg'],
      },
    },
  ],
};

/**
 * Calculate initial column visibility based on view preferences.
 * Returns column definitions with correct initial hide values.
 */
export function getInitialColumnDefs(viewPreferences: ViewPreferences): ColDef[] {
  return ALL_COLUMNS.map((col) => {
    // Base columns and status are always visible
    if (BASE_COL_IDS.includes(col.colId || col.field || '')) {
      return { ...col, hide: false };
    }

    // Check if column belongs to an active view group
    const colId = col.colId || col.field || '';
    let isVisible = false;

    // Check each view group (except 'full' meta-toggle)
    for (const [groupKey, colIds] of Object.entries(VIEW_GROUP_COL_IDS)) {
      if (groupKey === 'full') continue;
      if (colIds.includes(colId) && viewPreferences[groupKey as ViewGroupKey]) {
        isVisible = true;
        break;
      }
    }

    return { ...col, hide: !isVisible };
  });
}
