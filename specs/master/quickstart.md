# Quickstart: Migrate Equipment Table to AG Grid

**Date**: 2025-12-27 | **Plan**: [plan.md](./plan.md) | **Status**: ✅ IMPLEMENTED

## Prerequisites

- Node.js and npm installed
- AG Grid Enterprise already installed (used by Subscriptions tab)
- Familiarity with existing EquipmentList.tsx and SubscriptionList.tsx

## Implementation Steps

### Step 1: Create AG Grid Column Definitions

Create new file or update `frontend/src/config/equipmentColumns.ts`:

```typescript
import { ColDef } from 'ag-grid-community';
import { ViewGroupKey } from '../types/viewGroups';

// Base columns (always visible)
export const BASE_COLUMNS: ColDef[] = [
  { field: 'equipment_id', headerName: 'Equipment ID', width: 130, minWidth: 130, sortable: true, filter: true, colId: 'equipment_id' },
  { field: 'computer_subtype', headerName: 'Subcategory', width: 120, minWidth: 120, sortable: true, filter: true, colId: 'computer_subtype' },
  { field: 'ownership', headerName: 'Ownership', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'ownership' },
  { field: 'primary_user', headerName: 'User', width: 150, minWidth: 150, sortable: true, filter: true, colId: 'primary_user' },
  { field: 'equipment_name', headerName: 'Name', width: 180, minWidth: 180, sortable: true, filter: true, colId: 'equipment_name' },
];

// Status column (always last)
export const STATUS_COLUMN: ColDef = {
  field: 'status', headerName: 'Status', width: 100, minWidth: 100, sortable: true, filter: true, colId: 'status',
  cellRenderer: 'StatusCellRenderer',
};

// View group columns - initially hidden
export const SUMMARY_COLUMNS: ColDef[] = [
  { field: 'equipment_type', headerName: 'Category', width: 100, hide: true, colId: 'equipment_type' },
  // ... more columns
];

// Column ID arrays for visibility toggling
export const VIEW_GROUP_COL_IDS: Record<ViewGroupKey, string[]> = {
  summary: ['equipment_type', 'manufacturer', 'model', 'purpose', 'ip_address', 'overall_rating'],
  spec: ['cpu_model', 'cpu_speed', 'operating_system', 'ram', 'storage', 'video_card', 'display_resolution', 'mac_lan', 'mac_wlan'],
  performance: ['cpu_score', 'score_2d', 'score_3d', 'memory_score', 'disk_score', 'overall_rating'],
  history: ['manufacturing_date', 'acquisition_date', 'assignment_date', 'cost', 'notes'],
  full: [],
};
```

### Step 2: Rewrite EquipmentList Component

Replace HTML table with AG Grid following SubscriptionList.tsx pattern:

```typescript
import { AgGridReact } from 'ag-grid-react';
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

export interface EquipmentListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
}

export const EquipmentList = forwardRef<EquipmentListHandle, EquipmentListProps>(
  ({ equipment, onSelectItem, viewPreferences }, ref) => {
    const gridRef = useRef<AgGridReact>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      resetFiltersAndSort: () => {
        gridRef.current?.api?.setFilterModel(null);
        gridRef.current?.api?.applyColumnState({ defaultState: { sort: null } });
      },
      hasActiveFilters: () => {
        const model = gridRef.current?.api?.getFilterModel();
        return model && Object.keys(model).length > 0;
      },
    }));

    // Update column visibility when view preferences change
    useEffect(() => {
      const api = gridRef.current?.api;
      if (!api) return;

      for (const [groupKey, colIds] of Object.entries(VIEW_GROUP_COL_IDS)) {
        if (groupKey === 'full') continue;
        api.setColumnsVisible(colIds, viewPreferences[groupKey as ViewGroupKey]);
      }
    }, [viewPreferences]);

    return (
      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={equipment}
          columnDefs={ALL_COLUMNS}
          defaultColDef={defaultColDef}
          rowSelection={{ mode: 'singleRow', enableClickSelection: true }}
          onRowClicked={(e) => onSelectItem?.(e.data)}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          statusBar={statusBarConfig}
        />
      </div>
    );
  }
);
```

### Step 3: Update InventoryPage

Remove column width management, update EquipmentList usage:

```typescript
// Remove: const { columnWidths, handleResize } = useColumnWidths();
// Keep: const { viewPreferences, toggleViewGroup } = useViewPreferences();

const equipmentListRef = useRef<EquipmentListHandle>(null);

// Add reset button handler
const handleResetFilters = () => {
  equipmentListRef.current?.resetFiltersAndSort();
};

// Update JSX
<EquipmentList
  ref={equipmentListRef}
  equipment={filteredEquipment}
  onSelectItem={handleSelectItem}
  viewPreferences={viewPreferences}
/>
```

### Step 4: Add Cell Renderers

Create or reuse from Subscriptions:

```typescript
// StatusCellRenderer - reuse from SubscriptionList
// MarkdownCellRenderer - new for notes column
const MarkdownCellRenderer = (props: ICellRendererParams) => {
  if (!props.value) return null;
  return <ReactMarkdown>{props.value}</ReactMarkdown>;
};
```

### Step 5: Delete Unused Code

- Remove `useColumnWidths` hook usage from InventoryPage
- Remove custom resize handlers from EquipmentList
- Consider deleting `hooks/useColumnWidths.ts` if unused elsewhere

## Verification Checklist

- [x] AG Grid renders with equipment data
- [x] Base columns always visible
- [x] View toggles show/hide correct column groups
- [x] Multiple views can be active simultaneously
- [x] Row click selects item and opens detail panel
- [x] Column menu filtering works
- [x] Status bar shows row count
- [x] Search box filters data correctly
- [x] URL query params sync (search)
- [x] No console errors

## Key Files Changed

| File | Change |
|------|--------|
| `components/EquipmentList.tsx` | Complete rewrite to AG Grid (197 lines) |
| `components/grid/StatusCellRenderer.tsx` | New - status badge renderer |
| `components/grid/MarkdownCellRenderer.tsx` | New - notes markdown renderer |
| `config/equipmentGridColumns.ts` | New - AG Grid column definitions |
| `pages/InventoryPage.tsx` | Remove column width logic, add grid ref |
| `hooks/useColumnWidths.ts` | Removed (AG Grid built-in resizing) |

## Reference

- See `SubscriptionList.tsx` for AG Grid patterns
- See `data-model.md` for complete column definitions
- See `research.md` for design decisions
