# Research: Pivot View Group Expand/Collapse Controls

**Feature**: 014-group-expand-collapse
**Date**: 2025-12-27

## Overview

This feature adds expand/collapse controls to pivot views. Research confirms AG Grid Enterprise provides all necessary APIs.

## AG Grid Row Grouping API

### Default Collapsed State

**Decision**: Use `groupDefaultExpanded={0}` to show groups collapsed by default

**Rationale**:
- AG Grid's `groupDefaultExpanded` property controls initial expansion state
- Value `0` means all groups collapsed, `1` means first level expanded, `-1` means all expanded
- Currently set to `1` in the codebase, needs to change to `0`

**Alternatives Considered**:
1. **Use `collapseAll()` after grid ready**: Rejected - causes visible flicker as groups expand then collapse
2. **Custom initial state management**: Rejected - AG Grid already provides this functionality

### Expand All / Collapse All API

**Decision**: Use `api.expandAll()` and `api.collapseAll()` methods

**Rationale**:
- AG Grid Enterprise provides these methods directly on the grid API
- Methods are synchronous and performant
- Already have grid ref access pattern established in codebase

**API Reference**:
```typescript
// Expand all group rows
gridApi.expandAll();

// Collapse all group rows
gridApi.collapseAll();
```

### Grid Ref Access Pattern

**Decision**: Extend existing SubscriptionListHandle interface

**Rationale**:
- Pattern already established for `resetFiltersAndSort()` and `hasActiveFilters()`
- Consistent approach to expose grid functionality to parent component
- Maintains encapsulation - parent doesn't need direct grid API access

**Implementation Pattern**:
```typescript
export interface SubscriptionListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
  expandAllGroups: () => void;      // NEW
  collapseAllGroups: () => void;    // NEW
}

// In useImperativeHandle:
expandAllGroups: () => {
  gridRef.current?.api.expandAll();
},
collapseAllGroups: () => {
  gridRef.current?.api.collapseAll();
},
```

## Button Placement

**Decision**: Place buttons adjacent to pivot view toggle buttons in the view-group-toggle area

**Rationale**:
- Logical grouping with related view controls
- Users will look in same area for view-related actions
- Follows existing UI pattern in the codebase

**Implementation**:
- Add buttons after the pivot view toggle buttons
- Use conditional rendering based on `activeViewMode !== 'default'`
- Style as secondary buttons to match existing UI

## View Switching Behavior

**Decision**: Use existing `key={grid-${viewMode}}` pattern for view reset

**Rationale**:
- Grid already remounts when view mode changes (key prop change)
- Remount naturally applies `groupDefaultExpanded={0}` to new view
- No additional code needed for FR-007 (reset groups on view switch)

## Open Items

None - all technical decisions resolved using AG Grid Enterprise documented features.
