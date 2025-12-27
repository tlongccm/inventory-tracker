/**
 * SubscriptionList component - displays subscriptions using AG Grid Enterprise.
 */

import { useMemo, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent, SortChangedEvent, ValueGetterParams, ValueFormatterParams, ICellRendererParams, GridReadyEvent, FilterChangedEvent } from 'ag-grid-community';
import type { SubscriptionListItem, RenewalStatus } from '../types/subscription';

// View mode type for pivot table switching
type SubscriptionViewMode = 'default' | 'ai_tools' | 'sa_resources' | 'by_distribution' | 'by_authentication';

// URL Cell Renderer Component
function UrlCellRenderer(props: ICellRendererParams) {
  const url = props.value;
  if (!url) return <span>-</span>;
  const displayUrl = url.length > 30 ? `${url.substring(0, 30)}...` : url;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="clickable-url"
      title={url}
      onClick={(e) => e.stopPropagation()}
    >
      {displayUrl}
    </a>
  );
}

// Status Cell Renderer Component
function StatusCellRenderer(props: ICellRendererParams) {
  const status = props.value;
  if (!status) return <span></span>;
  const statusClass = status === 'Active' ? 'status-active' :
                      status === 'Inactive' ? 'status-inactive' : '';
  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}

// T017: Suppress Duplicate Cell Renderer - Excel-like behavior
// Shows value only if different from previous row (for sorted/grouped display)
function SuppressDuplicateRenderer(props: ICellRendererParams<SubscriptionListItem>) {
  const currentValue = props.value;
  const rowIndex = props.node.rowIndex;

  // Always show value for first row
  if (rowIndex === null || rowIndex === 0) {
    return <span className="group-label">{currentValue || ''}</span>;
  }

  // Get previous row's value for the same column
  const previousNode = props.api.getDisplayedRowAtIndex(rowIndex - 1);
  const previousValue = previousNode?.data?.access_level_required;

  // Only show if value changed from previous row
  if (currentValue !== previousValue) {
    return <span className="group-label">{currentValue || ''}</span>;
  }

  // Suppress duplicate - return empty
  return <span></span>;
}

interface SubscriptionListProps {
  subscriptions: SubscriptionListItem[];
  loading: boolean;
  onSelect: (subscriptionId: string) => void;
  selectedId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  noResultsMessage?: string;
  viewMode?: SubscriptionViewMode;
  onFilterChanged?: (hasActiveFilters: boolean) => void;
}

// Ref handle for external control
export interface SubscriptionListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
}

// Currency formatter using Intl.NumberFormat
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

// Calculate monthly cost based on payment frequency
function calculateMonthlyCost(sub: SubscriptionListItem | undefined): number | null {
  if (!sub) return null;
  const { cost, payment_frequency, annual_cost } = sub;

  // Try to extract numeric value from cost string
  if (cost && payment_frequency) {
    const numericCost = parseFloat(cost.replace(/[$,]/g, ''));
    if (!isNaN(numericCost)) {
      if (payment_frequency === 'Monthly') {
        return numericCost;
      }
      if (payment_frequency === 'Annual') {
        return numericCost / 12;
      }
    }
  }

  // Fallback to annual_cost / 12 if available
  if (annual_cost !== null && annual_cost !== undefined) {
    return annual_cost / 12;
  }

  return null;
}

// Get row class based on renewal status
function getRenewalStatusClass(renewalStatus: RenewalStatus | null): string {
  switch (renewalStatus) {
    case 'overdue':
      return 'renewal-overdue';
    case 'urgent':
      return 'renewal-urgent';
    case 'warning':
      return 'renewal-warning';
    case 'ok':
      return 'renewal-ok';
    default:
      return '';
  }
}

// All columns for the subscription table (default view)
// Each column has minWidth = width to prevent shrinking
const ALL_COLUMNS: ColDef<SubscriptionListItem>[] = [
  { field: 'subscription_id', headerName: 'ID', width: 90, minWidth: 90 },
  { field: 'provider', headerName: 'Provider', width: 180, minWidth: 180 },
  { field: 'category_name', headerName: 'Category', width: 140, minWidth: 140 },
  { field: 'subcategory_name', headerName: 'Sector / Subject', width: 120, minWidth: 120 },
  { field: 'link', headerName: 'URL', width: 180, minWidth: 180, cellRenderer: UrlCellRenderer },
  { field: 'username', headerName: 'Username', width: 150, minWidth: 150 },
  { field: 'password', headerName: 'Password', width: 120, minWidth: 120 },
  { field: 'in_lastpass', headerName: 'In LastPass', width: 80, minWidth: 80, cellStyle: { textAlign: 'center' }, valueFormatter: (params: ValueFormatterParams) => params.value === true ? 'Y' : '' },
  { field: 'authentication', headerName: 'Auth Method', width: 120, minWidth: 120 },
  { field: 'status', headerName: 'Status', width: 80, minWidth: 80, cellRenderer: StatusCellRenderer },
  { field: 'description_value', headerName: 'Description & Value to CCM', width: 200, minWidth: 200, tooltipField: 'description_value' },
  { field: 'value_level', headerName: 'Value', width: 60, minWidth: 60, cellStyle: { textAlign: 'center' } },
  { field: 'ccm_owner', headerName: 'CCM Owner', width: 100, minWidth: 100 },
  { field: 'subscription_log', headerName: 'Subscription Log', width: 150, minWidth: 150, tooltipField: 'subscription_log' },
  { field: 'payment_method', headerName: 'Payment Method', width: 130, minWidth: 130 },
  { field: 'cost', headerName: 'Payment Amount', width: 110, minWidth: 110, type: 'rightAligned', valueFormatter: (params: ValueFormatterParams) => { const val = params.value; if (val === null || val === undefined) return '-'; if (typeof val === 'number') return formatCurrency(val); return val; } },
  { field: 'payment_frequency', headerName: 'Payment Frequency', width: 120, minWidth: 120 },
  { field: 'annual_cost', headerName: 'Annual Cost', width: 100, minWidth: 100, type: 'rightAligned', valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value) },
  { field: 'renewal_date', headerName: 'Renewal Date', width: 100, minWidth: 100, cellStyle: { textAlign: 'center' } },
  { field: 'last_confirmed_alive', headerName: 'Last confirmed alive', width: 130, minWidth: 130, cellStyle: { textAlign: 'center' } },
  { field: 'main_vendor_contact', headerName: 'Main contact', width: 150, minWidth: 150, tooltipField: 'main_vendor_contact' },
  { field: 'subscriber_email', headerName: 'Destination email', width: 160, minWidth: 160 },
  { field: 'forward_to', headerName: 'Forward to', width: 140, minWidth: 140 },
  { field: 'email_routing', headerName: 'RR email routing', width: 120, minWidth: 120 },
  { field: 'email_volume_per_week', headerName: 'Email volume / week', width: 120, minWidth: 120, type: 'rightAligned' },
  { field: 'notes', headerName: 'Notes', width: 150, minWidth: 150, tooltipField: 'notes' },
  { field: 'actions_todos', headerName: 'Actions', width: 150, minWidth: 150, tooltipField: 'actions_todos' },
  { field: 'access_level_required', headerName: 'Access Level Required', width: 140, minWidth: 140 },
];

// AI Tools pivot view columns - Single group column layout
// Only Access Level is grouped; all other columns are regular data columns
const AI_TOOLS_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'access_level_required',
    rowGroup: true,
    hide: true,  // Hide original column, grouping shows in auto group column
  },
  // Regular data columns (not grouped)
  { field: 'provider', headerName: 'Provider', width: 200 },
  { field: 'username', headerName: 'Username', width: 180 },
  { field: 'password', headerName: 'Password', width: 120 },
  { field: 'description_value', headerName: 'Description & Value to CCM', width: 300 },
  {
    colId: 'monthly_cost',
    headerName: 'Monthly Cost',
    width: 130,
    type: 'rightAligned',
    valueGetter: (params: ValueGetterParams<SubscriptionListItem>) => params.data ? calculateMonthlyCost(params.data) : null,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
    aggFunc: 'sum',
  },
  {
    field: 'annual_cost',
    headerName: 'Annual Cost',
    width: 130,
    type: 'rightAligned',
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
    aggFunc: 'sum',
  },
];

// Auto group column configuration for AI Tools pivot view
const aiToolsGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Access Level',
  minWidth: 180,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};

// T003: By Distribution view columns - grouped by subscriber_email
const BY_DISTRIBUTION_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'subscriber_email',
    rowGroup: true,
    hide: true,  // Hide original column, grouping shows in auto group column
  },
  { field: 'authentication', headerName: 'Authentication Method', width: 180 },
  { field: 'provider', headerName: 'Provider', width: 200 },
];

// T004: By Authentication view columns - grouped by authentication
const BY_AUTHENTICATION_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'authentication',
    rowGroup: true,
    hide: true,  // Hide original column, grouping shows in auto group column
  },
  { field: 'provider', headerName: 'Provider', width: 200 },
];

// SA Resources view columns - flat list with credential focus
// Displays Active + Consultant subscriptions for quick credential lookup
const SA_RESOURCES_COLUMNS: ColDef<SubscriptionListItem>[] = [
  { field: 'provider', headerName: 'Provider', width: 200 },
  { field: 'link', headerName: 'URL', width: 250, cellRenderer: UrlCellRenderer },
  { field: 'ccm_owner', headerName: 'CCM Owner', width: 150 },
  { field: 'username', headerName: 'Username', width: 180 },
  { field: 'password', headerName: 'Password', width: 150 },
];

// T005: Auto group column configuration for By Distribution view
const distributionGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Destination Email',
  minWidth: 250,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};

// T006: Auto group column configuration for By Authentication view
const authenticationGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Authentication Method',
  minWidth: 200,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};

// T012, T013, T014: Status bar configuration with aggregation component
const statusBarConfig = {
  statusPanels: [
    {
      statusPanel: 'agTotalRowCountComponent', // T013: Total row count on left
      align: 'left' as const,
    },
    {
      statusPanel: 'agAggregationComponent', // T014: Cell selection statistics
      statusPanelParams: {
        aggFuncs: ['count', 'sum', 'avg'],
      },
    },
  ],
};

// Grid height is now viewport-based for sticky behavior
// The grid fills the viewport when sticky, using AG Grid's internal scrollbar

const SubscriptionList = forwardRef<SubscriptionListHandle, SubscriptionListProps>(function SubscriptionList({
  subscriptions,
  loading,
  onSelect,
  sortBy,
  sortOrder,
  onSort,
  noResultsMessage,
  viewMode = 'default',
  onFilterChanged,
}, ref) {
  // Grid ref for API access
  const gridRef = useRef<AgGridReact<SubscriptionListItem>>(null);

  // Expose reset method to parent via ref
  useImperativeHandle(ref, () => ({
    resetFiltersAndSort: () => {
      if (gridRef.current?.api) {
        // Clear all column filters
        gridRef.current.api.setFilterModel(null);
        // Reset column sort state
        gridRef.current.api.applyColumnState({
          defaultState: { sort: null },
        });
      }
    },
    hasActiveFilters: () => {
      if (!gridRef.current?.api) return false;
      const filterModel = gridRef.current.api.getFilterModel();
      return Object.keys(filterModel || {}).length > 0;
    },
    expandAllGroups: () => {
      gridRef.current?.api.expandAll();
    },
    collapseAllGroups: () => {
      gridRef.current?.api.collapseAll();
    },
  }), []);

  // T009, T014: Select columns based on view mode
  const columnDefs = useMemo(() => {
    switch (viewMode) {
      case 'ai_tools':
        return AI_TOOLS_COLUMNS;
      case 'sa_resources':
        return SA_RESOURCES_COLUMNS;
      case 'by_distribution':
        return BY_DISTRIBUTION_COLUMNS;
      case 'by_authentication':
        return BY_AUTHENTICATION_COLUMNS;
      default:
        return ALL_COLUMNS;
    }
  }, [viewMode]);

  // T010, T015: Select auto group column configuration based on view mode
  const currentAutoGroupColumnDef = useMemo(() => {
    switch (viewMode) {
      case 'ai_tools':
        return aiToolsGroupColumnDef;
      case 'by_distribution':
        return distributionGroupColumnDef;
      case 'by_authentication':
        return authenticationGroupColumnDef;
      default:
        return undefined;
    }
  }, [viewMode]);

  // T011, T016: Determine if current view is a grouped view
  // SA Resources is a flat list (no grouping), so it's not considered a grouped view
  const isGroupedView = viewMode !== 'default' && viewMode !== 'sa_resources';

  // Default column properties - prevent auto-sizing, enable filtering via column menu
  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    suppressMovable: true,
    suppressAutoSize: true,
    suppressSizeToFit: true,
    filter: true,
    // Use column menu filtering instead of floating filters (cleaner UI)
    floatingFilter: false,
    // Show only filter tab in column menu
    menuTabs: ['filterMenuTab'],
    // Force minimum width to prevent columns from shrinking
    minWidth: 100,
    // Flex: 0 prevents any flex-based resizing
    flex: 0,
  }), []);

  // Handle filter changes to notify parent
  const handleFilterChanged = useCallback((event: FilterChangedEvent) => {
    if (onFilterChanged) {
      const filterModel = event.api.getFilterModel();
      const hasFilters = Object.keys(filterModel || {}).length > 0;
      onFilterChanged(hasFilters);
    }
  }, [onFilterChanged]);

  // Row selection configuration (no checkboxes - selection via row click only)
  const rowSelection = useMemo(() => ({
    mode: 'singleRow' as const,
    checkboxes: false,
    enableClickSelection: true,
  }), []);

  // T009: Handle row click to open detail modal (guard against group rows)
  const onRowClicked = useCallback((event: RowClickedEvent<SubscriptionListItem>) => {
    // Only handle data rows, not group rows (group rows have data: undefined)
    if (event.data) {
      onSelect(event.data.subscription_id);
    }
  }, [onSelect]);

  // Handle sort changes from AG Grid
  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const sortModel = event.api.getColumnState()
      .filter(col => col.sort)
      .map(col => ({ colId: col.colId, sort: col.sort }));

    if (sortModel.length > 0 && onSort) {
      const firstSort = sortModel[0];
      // Only trigger if the sort field changed
      if (firstSort.colId !== sortBy || firstSort.sort !== sortOrder) {
        onSort(firstSort.colId || '');
      }
    }
  }, [onSort, sortBy, sortOrder]);

  // Get row class based on renewal status (no selection highlighting)
  const getRowClass = useCallback((params: { data: SubscriptionListItem | undefined }) => {
    if (!params.data) return '';

    const renewalClass = getRenewalStatusClass(params.data.renewal_status);
    return renewalClass || '';
  }, []);

  // Initial sort state from props
  const initialState = useMemo(() => {
    if (!sortBy) return undefined;
    return {
      sort: {
        sortModel: [{ colId: sortBy, sort: sortOrder || 'asc' }]
      }
    };
  }, [sortBy, sortOrder]);

  // T019: Custom cell renderer components
  const components = useMemo(() => ({
    suppressDuplicateRenderer: SuppressDuplicateRenderer,
  }), []);

  // Handle grid ready - apply row grouping for grouped views
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Apply row grouping via API based on view mode
    if (viewMode === 'ai_tools') {
      params.api.applyColumnState({
        state: [
          { colId: 'access_level_required', rowGroup: true, hide: true }
        ],
      });
    } else if (viewMode === 'by_distribution') {
      params.api.applyColumnState({
        state: [
          { colId: 'subscriber_email', rowGroup: true, hide: true }
        ],
      });
    } else if (viewMode === 'by_authentication') {
      params.api.applyColumnState({
        state: [
          { colId: 'authentication', rowGroup: true, hide: true }
        ],
      });
    }
  }, [viewMode]);

  // Loading state
  if (loading) {
    return <div className="loading">Loading subscriptions...</div>;
  }

  // Empty state
  if (subscriptions.length === 0) {
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
        <h3>No subscriptions found</h3>
        <p>No subscriptions are currently tracked.</p>
        <p>Click "Add Subscription" to add the first record.</p>
      </div>
    );
  }

  return (
    <div className="ag-grid-wrapper">
      {/* AG Grid Container - fills viewport height when sticky */}
      <div className="ag-grid-container" style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: viewMode === 'default' ? '3500px' : undefined, height: '100%' }}>
        <AgGridReact<SubscriptionListItem>
          key={`grid-${viewMode}`}  // Force complete re-mount when view mode changes
          ref={gridRef}
          rowData={subscriptions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          onRowClicked={onRowClicked}
          onSortChanged={onSortChanged}
          onFilterChanged={handleFilterChanged}
          getRowClass={getRowClass}
          initialState={initialState}
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
          // T008: Don't show "sum()" in header text
          suppressAggFuncInHeader={true}
          // T011: Enable cell selection for status bar aggregation
          cellSelection={true}
          // T015: Add status bar with row count and aggregation stats
          statusBar={statusBarConfig}
          // T019: Register custom cell renderers
          components={components}
          // T011, T016: Row grouping settings for grouped views - Single group column layout
          groupDisplayType={isGroupedView ? 'singleColumn' : undefined}
          autoGroupColumnDef={currentAutoGroupColumnDef}
          groupDefaultExpanded={isGroupedView ? 0 : undefined}
        />
        </div>
      </div>
    </div>
  );
});

export default SubscriptionList;
