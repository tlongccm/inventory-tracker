# Research: AG Grid Row Grouping for AI Tools View

**Feature**: AI Tool Pivot View (012-ai-tool-pivot)
**Date**: 2025-12-27 (Updated)
**Status**: Complete
**Goal**: Use AG Grid's row grouping feature for AI Tools view instead of simple column switching

## Key Finding: Row Grouping vs. True Pivot

The user's requirement ("use ag-grid's true pivot feature with desired columns and grouping") is best served by **AG Grid Row Grouping** rather than **true pivot mode**.

### Decision: Use Row Grouping (not Pivot Mode)

**Rationale**:
- True pivot mode (`pivotMode: true`) transposes unique values from a column into new column headers (e.g., years become columns like "2023 Cost", "2024 Cost")
- User wants rows **grouped by** `access_level_required` with specific columns displayed - this is row grouping
- Row grouping provides collapsible groups with aggregation totals at group headers

**Alternatives Considered**:
| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| True Pivot Mode | Full pivot table with transposed headers | Overkill - not transposing any values | Rejected |
| Column Switching (current) | Simple implementation | Not using AG Grid grouping features | Replace |
| Row Grouping | Groups rows, shows totals, collapsible | Requires Enterprise module | **Selected** |

---

## AG Grid Enterprise Requirements

AG Grid Enterprise v35.0.0 (already installed) provides:

- `RowGroupingModule` - Required for `rowGroup: true` (included in AllEnterpriseModule)
- `ClientSideRowModelModule` - Default row model (already in use)

No additional modules needed beyond what's already configured.

---

## Implementation Approach

### 1. Column Configuration for AI Tools Grouped View

```typescript
const AI_TOOLS_GROUPED_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'access_level_required',
    headerName: 'Access Level',
    rowGroup: true,      // Enable row grouping
    hide: true,          // Hide original column (shows in auto group column)
    enableRowGroup: true,
  },
  { field: 'provider', headerName: 'Provider', sortable: true },
  { field: 'username', headerName: 'Username', sortable: true },
  { field: 'password', headerName: 'Password', sortable: true },
  {
    field: 'description_value',
    headerName: 'Description & Value to CCM',
    sortable: true,
    tooltipField: 'description_value',
  },
  {
    colId: 'monthly_cost',
    headerName: 'Monthly Cost',
    type: 'rightAligned',
    valueGetter: (params) => calculateMonthlyCost(params.data),
    valueFormatter: (params) => formatCurrency(params.value),
    aggFunc: 'sum',  // Shows total at group level
  },
  {
    field: 'annual_cost',
    headerName: 'Annual Cost',
    type: 'rightAligned',
    valueFormatter: (params) => formatCurrency(params.value),
    aggFunc: 'sum',  // Shows total at group level
  },
];
```

### 2. Auto Group Column Configuration

```typescript
const autoGroupColumnDef: ColDef = {
  headerName: 'Access Level',
  minWidth: 200,
  pinned: 'left',
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};
```

### 3. Grid Options for Grouped View

```typescript
// Only when viewMode === 'ai_tools'
groupDefaultExpanded: -1,  // Expand all groups by default (-1 = all levels)
suppressAggFuncInHeader: true,  // Don't show "sum()" in header text
```

---

## Gotchas and Solutions

### 1. valueGetter with Aggregation

**Problem**: `monthly_cost` uses a `valueGetter` but `aggFunc: 'sum'` needs numeric values.

**Solution**: The valueGetter returns a number, so `aggFunc: 'sum'` will work. AG Grid aggregates the valueGetter results for group rows.

### 2. Row Click in Grouped View

**Problem**: Clicking a group header row vs. data row behaves differently.

**Solution**: Check `event.data` in `onRowClicked` - it's `undefined` for group rows:
```typescript
const onRowClicked = (event: RowClickedEvent) => {
  if (event.data) {  // Only handle data rows, not group rows
    onSelect(event.data.subscription_id);
  }
};
```

### 3. Sorting with Row Groups

**Problem**: Column sorting works differently with row groups.

**Solution**: Sorting still works within groups. Users can sort by any column and items within each group are sorted accordingly.

### 4. valueGetter returns undefined for group rows

**Problem**: `params.data` is undefined for group (aggregate) rows.

**Solution**: Guard against undefined in valueGetter:
```typescript
valueGetter: (params) => params.data ? calculateMonthlyCost(params.data) : null,
```

---

## Files to Modify

1. **frontend/src/components/SubscriptionList.tsx**
   - Update `AI_TOOLS_COLUMNS` to use `rowGroup: true` on `access_level_required`
   - Add `autoGroupColumnDef` configuration
   - Add `groupDefaultExpanded` prop when in AI Tools view
   - Add `suppressAggFuncInHeader` prop
   - Update `onRowClicked` to handle group rows

2. **frontend/src/pages/SubscriptionsPage.tsx**
   - No changes needed (already handles viewMode switching)

---

## Feature 2: Status Bar with Cell Selection Statistics

### Decision: Enable Status Bar with Aggregation Component

**Rationale**:
- AG Grid Enterprise provides a Status Bar feature that displays statistics for selected cells
- The `agAggregationComponent` shows count, sum, average, min, max for selected cell ranges
- Requires `CellSelectionModule` and `StatusBarModule` (both included in AllEnterpriseModule)

### Required Configuration

```typescript
// Enable cell selection (required for range selection)
cellSelection: true,

// Configure status bar with aggregation
statusBar: {
  statusPanels: [
    {
      statusPanel: 'agTotalRowCountComponent',
      align: 'left',
    },
    {
      statusPanel: 'agAggregationComponent',
      statusPanelParams: {
        aggFuncs: ['count', 'sum', 'avg'],
      },
    },
  ],
},
```

### How It Works

1. User selects cells by clicking and dragging (or Shift+click)
2. Status bar at bottom automatically shows:
   - **Count**: Number of selected cells
   - **Sum**: Total of numeric values in selection
   - **Avg**: Average of numeric values in selection

### Implementation Notes

- Works in both default view and AI Tools grouped view
- Only shows statistics when cells with numeric values are selected
- Non-numeric cells are ignored in sum/avg calculations
- Status bar persists across view mode switches

---

## Files to Modify

1. **frontend/src/components/SubscriptionList.tsx**
   - Add `rowGroup: true` to AI_TOOLS_COLUMNS for `access_level_required`
   - Add `autoGroupColumnDef` configuration
   - Add `groupDefaultExpanded` prop when in AI Tools view
   - Add `cellSelection: true` for range selection
   - Add `statusBar` configuration with aggregation component
   - Update `onRowClicked` to handle group rows

2. **frontend/src/pages/SubscriptionsPage.tsx**
   - No changes needed (already handles viewMode switching)

---

## Success Metrics

### Row Grouping (AI Tools View)
- Groups collapse/expand correctly by access level
- Group header shows count (e.g., "Basic (5)") and aggregated cost totals
- Row click opens detail modal for data rows only (not group rows)
- Column sorting works within groups
- Filter/search applies before grouping
- Reset button clears grouping state when returning to default view

### Status Bar (All Views)
- Status bar visible at bottom of grid
- Selecting cells shows count of selected cells
- Selecting numeric cells shows sum and average
- Statistics update in real-time as selection changes
- Works in both default and AI Tools views
