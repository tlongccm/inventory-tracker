// Column configuration for software list views

export interface SoftwareColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  width?: number;
}

// View group types for software
export type SoftwareViewGroupKey = 'license' | 'purchase' | 'details';

// Always visible columns
export const SOFTWARE_ALWAYS_VISIBLE_COLUMNS: SoftwareColumnDefinition[] = [
  { key: 'software_id', label: 'Software ID', sortable: true, width: 100 },
  { key: 'name', label: 'Name', sortable: true, width: 180 },
  { key: 'category', label: 'Category', sortable: true, width: 100 },
  { key: 'status', label: 'Status', sortable: true, width: 80 },
];

// View group column definitions
export const SOFTWARE_VIEW_GROUP_COLUMNS: Record<SoftwareViewGroupKey, SoftwareColumnDefinition[]> = {
  license: [
    { key: 'type', label: 'Type', sortable: true, width: 100 },
    { key: 'key', label: 'License Key', sortable: false, width: 150 },
    { key: 'version', label: 'Version', sortable: true, width: 80 },
  ],
  purchase: [
    { key: 'purchase_date', label: 'Purchase Date', sortable: true, width: 110 },
    { key: 'purchaser', label: 'Purchaser', sortable: false, width: 120 },
    { key: 'vendor', label: 'Vendor', sortable: true, width: 150 },
    { key: 'cost', label: 'Cost', sortable: false, width: 80 },
  ],
  details: [
    { key: 'deployment', label: 'Deployment', sortable: false, width: 150 },
    { key: 'install_location', label: 'Install Location', sortable: false, width: 200 },
    { key: 'comments', label: 'Comments', sortable: false, width: 200 },
  ],
};

// All view group keys
export const SOFTWARE_VIEW_GROUP_KEYS: SoftwareViewGroupKey[] = ['license', 'purchase', 'details'];

// View group labels for toggle buttons
export const SOFTWARE_VIEW_GROUP_LABELS: Record<SoftwareViewGroupKey, string> = {
  license: 'License View',
  purchase: 'Purchase View',
  details: 'Details View',
};

// Default column widths
export const SOFTWARE_DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  software_id: 100,
  name: 180,
  category: 100,
  status: 80,
  type: 100,
  key: 150,
  version: 80,
  purchase_date: 110,
  purchaser: 120,
  vendor: 150,
  cost: 80,
  deployment: 150,
  install_location: 200,
  comments: 200,
};

// Get visible columns based on preferences
export function getSoftwareVisibleColumns(
  preferences: Record<SoftwareViewGroupKey, boolean>
): SoftwareColumnDefinition[] {
  const columns = [...SOFTWARE_ALWAYS_VISIBLE_COLUMNS];

  for (const groupKey of SOFTWARE_VIEW_GROUP_KEYS) {
    if (preferences[groupKey]) {
      columns.push(...SOFTWARE_VIEW_GROUP_COLUMNS[groupKey]);
    }
  }

  return columns;
}
