# Feature Specification: Migrate Equipment Table to AG Grid

**Version**: 1.0.0 | **Date**: 2025-12-27

## Summary

Migrate the Equipment tab's table from custom HTML `<table>` implementation to AG Grid Enterprise, following the same patterns established in the Subscriptions tab. Equipment views are predefined column subsets (not pivot tables with row grouping) - users toggle view groups to show/hide columns.

## Current State

### Equipment Tab

- **Table Technology**: Standard HTML `<table>` element with custom React logic
- **Column Management**: Custom drag resize handlers, manual sort implementation
- **View System**: Multi-toggle groups (Summary, Spec, Performance, History, Full) - any combination can be enabled simultaneously
- **Persistence**: localStorage for view preferences and column widths
- **Files**:
  - `InventoryPage.tsx` - Page component
  - `EquipmentList.tsx` - Table component (267 lines of custom table code)
  - `config/columns.ts` - Column definitions per view group
  - `hooks/useViewPreferences.ts` - View toggle persistence
  - `hooks/useColumnWidths.ts` - Column width persistence

### Subscriptions Tab (Reference Pattern)

- **Table Technology**: AG Grid Enterprise v35
- **View System**: Mutually exclusive pivot views with row grouping
- **Key Features**: Column menu filtering, status bar aggregation, expand/collapse controls
- **Pattern**: View mode determines complete column configuration via `key={viewMode}` remount

## Requirements

### Functional Requirements

1. **FR-1**: Replace HTML table in EquipmentList.tsx with AG Grid Enterprise
2. **FR-2**: Maintain existing 5 view groups with current column configurations
3. **FR-3**: Keep multi-toggle behavior (views are NOT mutually exclusive, unlike Subscriptions)
4. **FR-4**: Preserve all existing columns with proper cell rendering (status badges, notes markdown, etc.)
5. **FR-5**: Support column filtering via AG Grid column menu (no floating filters)
6. **FR-6**: Display status bar with row count
7. **FR-7**: Remove custom column resize handlers - use AG Grid's built-in resizing
8. **FR-8**: Remove custom column width persistence hooks - column widths managed by AG Grid
9. **FR-9**: Maintain existing regex-based search functionality (SearchBox)
10. **FR-10**: Preserve URL query parameter sync for filters and sort

### Non-Functional Requirements

1. **NFR-1**: No new npm dependencies beyond existing AG Grid packages
2. **NFR-2**: Consistent UX with Subscriptions tab (same column menu behavior, same status bar style)
3. **NFR-3**: Maintain current performance with 1000+ equipment rows

## View Groups (Column Subsets)

Unlike Subscriptions' pivot views, Equipment views simply show/hide column groups. Multiple views can be enabled simultaneously.

### Base Columns (Always Visible)

- Equipment ID
- Computer Subtype (Category)
- Ownership
- Primary User
- Name
- Status (always last column)

### View Group: Summary

Additional columns: Equipment Type, Manufacturer, Model, Purpose, IP Address, Overall Rating

### View Group: Spec

Additional columns: CPU Model, CPU Speed, Operating System, RAM, Storage, Video Card, Display Resolution, MAC addresses

### View Group: Performance

Additional columns: CPU Score, 2D Score, 3D Score, Memory Score, Disk Score, Overall Rating

### View Group: History

Additional columns: Manufacturing Date, Acquisition Date, Assignment Date, Cost, Notes

### View Group: Full

Meta-toggle - enables/disables ALL other view groups at once

## Out of Scope

- Backend changes (API unchanged)
- Adding row grouping/pivot functionality to Equipment
- Changing view toggle behavior from multi-select to mutually exclusive
- Adding new columns or views
- Authentication/authorization changes

## Acceptance Criteria

1. Equipment table uses AG Grid Enterprise
2. All 5 view group toggles work correctly with multi-select behavior
3. Column menu filtering available on all columns
4. Status bar shows total row count
5. Built-in AG Grid column resizing works
6. Custom resize hooks removed
7. Search, filter, and sort sync with URL parameters
8. Cell renderers match current functionality (status badges, markdown notes)
9. Performance acceptable with existing dataset size

## Technical Notes

- AG Grid already installed in project (used by Subscriptions)
- Follow SubscriptionList.tsx patterns for grid configuration
- Use column visibility API rather than view mode key remounting (since views are additive, not exclusive)
- May need AG Grid `columnApi.setColumnsVisible()` for toggling column groups
