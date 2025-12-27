/**
 * EquipmentList component - displays equipment using AG Grid Enterprise.
 * Supports additive view groups where multiple views can be active simultaneously.
 */

import { useMemo, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { RowClickedEvent, FilterChangedEvent, GridReadyEvent, GridApi } from 'ag-grid-community';
import type { EquipmentListItem } from '../types/equipment';
import type { ViewPreferences, ViewGroupKey } from '../types/viewGroups';
import {
  VIEW_GROUP_COL_IDS,
  defaultColDef,
  statusBarConfig,
  getInitialColumnDefs,
} from '../config/equipmentGridColumns';
import StatusCellRenderer from './grid/StatusCellRenderer';
import MarkdownCellRenderer from './grid/MarkdownCellRenderer';

interface EquipmentListProps {
  equipment: EquipmentListItem[];
  loading: boolean;
  onSelect: (equipmentId: string) => void;
  noResultsMessage?: string;
  viewPreferences: ViewPreferences;
  onFilterChanged?: (hasActiveFilters: boolean) => void;
}

// Ref handle for external control
export interface EquipmentListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
}

const EquipmentList = forwardRef<EquipmentListHandle, EquipmentListProps>(function EquipmentList({
  equipment,
  loading,
  onSelect,
  noResultsMessage,
  viewPreferences,
  onFilterChanged,
}, ref) {
  // Grid ref for API access
  const gridRef = useRef<AgGridReact<EquipmentListItem>>(null);
  const gridApiRef = useRef<GridApi<EquipmentListItem> | null>(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    resetFiltersAndSort: () => {
      if (gridApiRef.current) {
        // Clear all column filters
        gridApiRef.current.setFilterModel(null);
        // Reset column sort state
        gridApiRef.current.applyColumnState({
          defaultState: { sort: null },
        });
      }
    },
    hasActiveFilters: () => {
      if (!gridApiRef.current) return false;
      const filterModel = gridApiRef.current.getFilterModel();
      return Object.keys(filterModel || {}).length > 0;
    },
  }), []);

  // Update column visibility when view preferences change
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api) return;

    // For each view group (except 'full' meta-toggle)
    for (const [groupKey, colIds] of Object.entries(VIEW_GROUP_COL_IDS)) {
      if (groupKey === 'full') continue;
      const isVisible = viewPreferences[groupKey as ViewGroupKey];
      api.setColumnsVisible(colIds, isVisible);
    }

    // Handle 'full' meta-toggle: if enabled, show all view group columns
    if (viewPreferences.full) {
      const allGroupColIds = Object.entries(VIEW_GROUP_COL_IDS)
        .filter(([key]) => key !== 'full')
        .flatMap(([, colIds]) => colIds);
      // Remove duplicates (overall_rating appears in both summary and performance)
      const uniqueColIds = [...new Set(allGroupColIds)];
      api.setColumnsVisible(uniqueColIds, true);
    }
  }, [viewPreferences]);

  // Column definitions with initial visibility based on preferences
  const columnDefs = useMemo(() => {
    return getInitialColumnDefs(viewPreferences);
  }, [viewPreferences]);

  // Row selection configuration (no checkboxes - selection via row click only)
  const rowSelection = useMemo(() => ({
    mode: 'singleRow' as const,
    checkboxes: false,
    enableClickSelection: true,
  }), []);

  // Handle row click to open detail modal
  const onRowClicked = useCallback((event: RowClickedEvent<EquipmentListItem>) => {
    if (event.data) {
      onSelect(event.data.equipment_id);
    }
  }, [onSelect]);

  // Handle filter changes to notify parent
  const handleFilterChanged = useCallback((event: FilterChangedEvent) => {
    if (onFilterChanged) {
      const filterModel = event.api.getFilterModel();
      const hasFilters = Object.keys(filterModel || {}).length > 0;
      onFilterChanged(hasFilters);
    }
  }, [onFilterChanged]);

  // Custom cell renderer components
  const components = useMemo(() => ({
    StatusCellRenderer,
    MarkdownCellRenderer,
  }), []);

  // Handle grid ready - store API reference
  const onGridReady = useCallback((params: GridReadyEvent<EquipmentListItem>) => {
    gridApiRef.current = params.api;
  }, []);

  // Calculate minimum width based on active view groups
  // Base (680) + Status (100) = 780px minimum
  // Add view group widths when enabled
  const gridMinWidth = useMemo(() => {
    let width = 780; // Base columns + status
    if (viewPreferences.summary) width += 730;
    if (viewPreferences.spec) width += 1160;
    if (viewPreferences.performance) width += 400; // 510 minus shared overall_rating
    if (viewPreferences.history) width += 800;
    return width;
  }, [viewPreferences]);

  // Loading state
  if (loading) {
    return <div className="loading">Loading equipment...</div>;
  }

  // Empty state
  if (equipment.length === 0) {
    if (noResultsMessage) {
      return (
        <div className="no-results">
          <h3>No results found</h3>
          <p>{noResultsMessage}</p>
        </div>
      );
    }
    return (
      <div className="empty-state">
        <h3>No equipment found</h3>
        <p>No equipment is currently tracked in the inventory.</p>
        <p>Click "Add" to add the first record.</p>
      </div>
    );
  }

  return (
    <div className="ag-grid-wrapper">
      <div className="ag-grid-container" style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: `${gridMinWidth}px`, height: '100%' }}>
          <AgGridReact<EquipmentListItem>
            ref={gridRef}
            rowData={equipment}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection={rowSelection}
            onRowClicked={onRowClicked}
            onFilterChanged={handleFilterChanged}
            onGridReady={onGridReady}
            animateRows={true}
            suppressCellFocus={true}
            enableCellTextSelection={true}
            tooltipShowDelay={500}
            domLayout="normal"
            suppressColumnVirtualisation={true}
            alwaysShowHorizontalScroll={true}
            alwaysShowVerticalScroll={false}
            scrollbarWidth={10}
            cellSelection={true}
            statusBar={statusBarConfig}
            components={components}
          />
        </div>
      </div>
    </div>
  );
});

export default EquipmentList;
