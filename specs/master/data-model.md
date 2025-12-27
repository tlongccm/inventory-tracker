# Data Model: Equipment AG Grid Column Definitions

**Date**: 2025-12-27 | **Plan**: [plan.md](./plan.md)

## Overview

This document defines the AG Grid column configuration for the Equipment table migration. The key difference from Subscriptions is that Equipment uses **additive view groups** - multiple groups can be active simultaneously, toggling column visibility rather than switching entire column sets.

## Column Categories

### Base Columns (Always Visible)

These columns are never hidden, regardless of view group settings.

| Column ID | Header | Width | Sortable | Filter |
|-----------|--------|-------|----------|--------|
| `equipment_id` | Equipment ID | 130 | Yes | Yes |
| `computer_subtype` | Subcategory | 120 | Yes | Yes |
| `ownership` | Ownership | 100 | Yes | Yes |
| `primary_user` | User | 150 | Yes | Yes |
| `equipment_name` | Name | 180 | Yes | Yes |
| `status` | Status | 100 | Yes | Yes |

**Note**: `status` column always appears last in the grid.

### Summary View Columns

| Column ID | Header | Width | Sortable | Filter | Renderer |
|-----------|--------|-------|----------|--------|----------|
| `equipment_type` | Category | 100 | Yes | Yes | - |
| `manufacturer` | Manufacturer | 120 | Yes | Yes | - |
| `model` | Model | 150 | Yes | Yes | - |
| `purpose` | Purpose | 120 | Yes | Yes | - |
| `ip_address` | IP Address | 130 | No | Yes | - |
| `overall_rating` | Overall Rating | 110 | Yes | Yes | NumberFormatter |

### Spec View Columns

| Column ID | Header | Width | Sortable | Filter | Renderer |
|-----------|--------|-------|----------|--------|----------|
| `cpu_model` | CPU Model | 150 | Yes | Yes | - |
| `cpu_speed` | CPU Base Speed | 110 | Yes | Yes | - |
| `operating_system` | Operating System | 140 | Yes | Yes | - |
| `ram` | RAM | 80 | Yes | Yes | - |
| `storage` | Storage | 100 | Yes | Yes | - |
| `video_card` | Video Card | 150 | Yes | Yes | - |
| `display_resolution` | Display Resolution | 130 | Yes | Yes | - |
| `mac_lan` | MAC (LAN) | 150 | No | Yes | - |
| `mac_wlan` | MAC (WLAN) | 150 | No | Yes | - |

### Performance View Columns

| Column ID | Header | Width | Sortable | Filter | Renderer |
|-----------|--------|-------|----------|--------|----------|
| `cpu_score` | CPU Score | 100 | Yes | Yes | NumberFormatter |
| `score_2d` | 2D Score | 100 | Yes | Yes | NumberFormatter |
| `score_3d` | 3D Score | 100 | Yes | Yes | NumberFormatter |
| `memory_score` | Memory Score | 110 | Yes | Yes | NumberFormatter |
| `disk_score` | Disk Score | 100 | Yes | Yes | NumberFormatter |
| `overall_rating` | Overall Rating | 110 | Yes | Yes | NumberFormatter |

**Note**: `overall_rating` appears in both Summary and Performance views (shared column).

### History View Columns

| Column ID | Header | Width | Sortable | Filter | Renderer |
|-----------|--------|-------|----------|--------|----------|
| `manufacturing_date` | Manufacturing Date | 140 | Yes | Yes | DateFormatter |
| `acquisition_date` | Acquisition Date | 130 | Yes | Yes | DateFormatter |
| `assignment_date` | Assignment Date | 130 | Yes | Yes | DateFormatter |
| `cost` | Cost | 100 | Yes | Yes | CurrencyFormatter |
| `notes` | Notes | 300 | No | Yes | MarkdownRenderer |

## View Group Column ID Mappings

For use with `gridApi.setColumnsVisible()`:

```typescript
export const VIEW_GROUP_COL_IDS: Record<ViewGroupKey, string[]> = {
  summary: ['equipment_type', 'manufacturer', 'model', 'purpose', 'ip_address', 'overall_rating'],
  spec: ['cpu_model', 'cpu_speed', 'operating_system', 'ram', 'storage', 'video_card', 'display_resolution', 'mac_lan', 'mac_wlan'],
  performance: ['cpu_score', 'score_2d', 'score_3d', 'memory_score', 'disk_score', 'overall_rating'],
  history: ['manufacturing_date', 'acquisition_date', 'assignment_date', 'cost', 'notes'],
  full: [] // Meta-toggle, no unique columns
};

export const BASE_COL_IDS = ['equipment_id', 'computer_subtype', 'ownership', 'primary_user', 'equipment_name', 'status'];
```

## AG Grid ColDef Structure

```typescript
interface EquipmentColDef extends ColDef {
  field: string;
  headerName: string;
  width: number;
  minWidth: number;
  sortable: boolean;
  filter: boolean;
  hide?: boolean;  // Initial visibility based on view preferences
  colId: string;   // Must match field for visibility toggling
  cellRenderer?: string;
  valueFormatter?: (params: ValueFormatterParams) => string;
}
```

## Cell Renderers

| Renderer | Purpose | Applies To |
|----------|---------|------------|
| `StatusCellRenderer` | Status badge with color | `status` |
| `MarkdownCellRenderer` | Render markdown content | `notes` |
| `DateFormatter` | Format dates consistently | Date columns |
| `CurrencyFormatter` | Format cost with currency | `cost` |
| `NumberFormatter` | Format numeric scores | Score/rating columns |

## Column Visibility Logic

When view preferences change:

```typescript
function updateColumnVisibility(api: GridApi, preferences: ViewPreferences) {
  // For each view group (except 'full' meta-toggle)
  for (const [groupKey, colIds] of Object.entries(VIEW_GROUP_COL_IDS)) {
    if (groupKey === 'full') continue;

    const isVisible = preferences[groupKey as ViewGroupKey];
    api.setColumnsVisible(colIds, isVisible);
  }

  // Handle 'full' meta-toggle: if enabled, show all
  if (preferences.full) {
    const allGroupColIds = Object.values(VIEW_GROUP_COL_IDS)
      .filter((_, i) => Object.keys(VIEW_GROUP_COL_IDS)[i] !== 'full')
      .flat();
    api.setColumnsVisible(allGroupColIds, true);
  }
}
```

## Column Order

Final column order (when all views active):

1. Base columns (always first): equipment_id, computer_subtype, ownership, primary_user, equipment_name
2. Summary columns (if enabled)
3. Spec columns (if enabled)
4. Performance columns (if enabled)
5. History columns (if enabled)
6. Status column (always last)

## Grid Configuration

```typescript
const gridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    filter: true,
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
    },
  },
  rowSelection: { mode: 'singleRow', enableClickSelection: true },
  suppressCellFocus: true,
  enableCellTextSelection: true,
  domLayout: 'normal',
  scrollbarWidth: 10,
  suppressColumnVirtualisation: true,
  alwaysShowHorizontalScroll: true,
  statusBar: {
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
    ],
  },
};
```
