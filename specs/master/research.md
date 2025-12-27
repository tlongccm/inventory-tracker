# Research: Migrate Equipment Table to AG Grid

**Date**: 2025-12-27 | **Plan**: [plan.md](./plan.md)

## Research Questions

### 1. How does the existing Subscriptions AG Grid implementation handle column visibility?

**Finding**: Subscriptions uses complete column definition arrays per view mode. When view mode changes, the grid remounts via `key={viewMode}` and receives a different `columnDefs` array.

**Relevance**: Equipment has a different model - multi-toggle views where any combination can be active. This requires a different approach: dynamic column visibility rather than complete remount.

**Decision**: Use AG Grid Column API (`columnApi.setColumnsVisible()`) to toggle column visibility based on active view groups. This avoids remounting and maintains filter/sort state.

**Alternative Rejected**: Full remount approach - rejected because Equipment views are additive (multiple can be active) rather than mutually exclusive.

---

### 2. What AG Grid API is needed for dynamic column visibility?

**Finding**: AG Grid provides `columnApi.setColumnsVisible(colIds, visible)` or `api.setColumnVisible(colId, visible)` to show/hide columns without remounting.

**Approach**:
1. Define ALL columns in initial `columnDefs` array
2. Set initial visibility based on default view preferences
3. When view toggle changes, call `setColumnsVisible()` for the affected column group

**Decision**: Use `api.setColumnsVisible(colIdArray, boolean)` for bulk column group visibility toggling.

---

### 3. How to structure column definitions for view group toggling?

**Finding**: Current Equipment implementation has:
- `COLUMN_MAP` - all column definitions keyed by field name
- `VIEW_GROUP_COLUMNS` - arrays of columns per view group
- `ALWAYS_VISIBLE_COLUMNS` - base columns never hidden
- Utility functions in `utils/columns.ts` for merging active columns

**Decision**:
- Convert `COLUMN_MAP` to AG Grid `ColDef` format
- Add `colId` property to each column matching field name
- Add `hide: true` property for non-base columns (controlled by view toggles)
- Create mapping: `VIEW_GROUP_COL_IDS: Record<ViewGroupKey, string[]>` for API calls

---

### 4. How to handle special cell renderers in AG Grid?

**Finding**: Current Equipment uses custom React rendering for:
- Status badges (StatusBadge component)
- Markdown notes (ReactMarkdown)
- Date formatting (formatDate utility)
- Equipment type badges

**Decision**: Create AG Grid cell renderers matching Subscriptions patterns:
- `StatusCellRenderer` - already exists in Subscriptions
- `MarkdownCellRenderer` - new, for notes column
- Use `valueFormatter` for simple formatting (dates, numbers)

---

### 5. How to preserve existing row selection behavior?

**Finding**: Current EquipmentList calls `onSelectItem(equipment)` when row clicked. Subscriptions uses AG Grid's `rowSelection: 'singleRow'` with `onRowClicked` callback.

**Decision**: Use same pattern as Subscriptions:
```typescript
rowSelection: { mode: 'singleRow', enableClickSelection: true }
onRowClicked: (event) => onSelectItem?.(event.data)
```

---

### 6. How to maintain search functionality with AG Grid?

**Finding**: Current search is external to table - SearchBox component filters equipment list before passing to table. Same pattern in Subscriptions.

**Decision**: No change needed. Search remains external, filters `equipment` array passed as `rowData` prop.

---

### 7. How to handle column width persistence?

**Finding**: Current uses custom `useColumnWidths` hook with localStorage. AG Grid has built-in column state management.

**Options**:
1. Remove persistence entirely (simplest)
2. Use AG Grid's `columnApi.getColumnState()` / `applyColumnState()` with localStorage
3. Keep custom hook adapted for AG Grid

**Decision**: Remove persistence (Option 1). AG Grid handles column sizing well. Users expect column widths to reset on page load. Constitution principle: Simplicity First.

---

### 8. How to implement filter reset functionality?

**Finding**: Subscriptions exposes `SubscriptionListHandle` interface with `resetFiltersAndSort()` method via `forwardRef`.

**Decision**: Create `EquipmentListHandle` interface:
```typescript
export interface EquipmentListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
}
```

---

### 9. How should view group toggles affect the grid?

**Finding**: Current flow:
1. User clicks view toggle (Summary, Spec, etc.)
2. `useViewPreferences` updates localStorage and state
3. `getActiveColumns()` recalculates visible columns
4. Table re-renders with new column set

**New Flow**:
1. User clicks view toggle
2. `useViewPreferences` updates state
3. `useEffect` detects preference change
4. Calls `gridApi.setColumnsVisible()` for affected columns
5. Grid updates columns without remount

**Decision**: Use `useEffect` watching view preferences to call column visibility API.

---

## Key Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Column visibility method | `setColumnsVisible()` API | Views are additive, not exclusive |
| Column width persistence | Remove | Simplicity First principle |
| Cell renderers | AG Grid components | Consistent with Subscriptions |
| Search integration | External (unchanged) | Already works, no reason to change |
| Grid ref interface | `EquipmentListHandle` | Match Subscriptions pattern |
| View toggle effect | `useEffect` + API call | Reactive, maintains grid state |

## Patterns from Subscriptions to Reuse

1. Grid configuration options (resizable, filters, status bar)
2. `StatusCellRenderer` component
3. Row selection configuration
4. Column menu setup (filter tab only)
5. Status bar configuration with row count
6. `forwardRef` pattern for grid handle
