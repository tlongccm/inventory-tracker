# Implementation Plan: Pivot View Group Expand/Collapse Controls

**Branch**: `014-group-expand-collapse` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-group-expand-collapse/spec.md`

## Summary

Add expand/collapse controls for pivot views in the Subscriptions tab. By default, all groups will be collapsed when activating any pivot view (AI Tools, By Distribution, By Authentication). Two new buttons ("Expand All" and "Collapse All") will be added that allow users to quickly expand or collapse all groups with a single click. The buttons will only be visible when a pivot view is active.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.2
**Primary Dependencies**: ag-grid-react v35.0.0, ag-grid-enterprise v35.0.0
**Storage**: N/A (frontend-only change)
**Testing**: Manual testing (per constitution - acceptable for UI/CRUD)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: Expand/collapse operations < 1 second, button visibility change < 100ms
**Constraints**: Must work with existing AG Grid row grouping implementation
**Scale/Scope**: ~50-200 subscriptions, 5-20 groups typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle                    | Status | Notes                                                          |
|------------------------------|--------|----------------------------------------------------------------|
| **I. Simplicity First**      | PASS   | Uses existing AG Grid API for expand/collapse operations       |
| **II. Web Application Structure** | PASS   | Frontend-only change, no API changes required             |
| **III. Data Integrity**      | N/A    | Display-only feature, no data mutations                        |
| **IV. Pragmatic Testing**    | PASS   | Manual testing acceptable per constitution                     |
| **V. Incremental Delivery**  | PASS   | Each user story independently testable and deliverable         |

**Gate Status**: PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/014-group-expand-collapse/
├── plan.md              # This file
├── research.md          # AG Grid API research
├── spec.md              # Feature specification
├── quickstart.md        # Setup/testing guide
└── tasks.md             # Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── SubscriptionList.tsx    # Add groupDefaultExpanded=0, expand/collapse methods
│   └── pages/
│       └── SubscriptionsPage.tsx   # Add Expand All / Collapse All buttons
└── package.json                    # No changes (AG Grid already installed)
```

**Structure Decision**: Web application - frontend only. This feature modifies two existing files to add expand/collapse controls following the established pattern from feature 013.

## Implementation Details

### Default Collapsed State (FR-001, FR-007)

**Change groupDefaultExpanded**:
```typescript
// Current (expanded by default)
groupDefaultExpanded={isGroupedView ? 1 : undefined}

// Updated (collapsed by default)
groupDefaultExpanded={isGroupedView ? 0 : undefined}
```

The `key={grid-${viewMode}}` already forces a grid remount when switching views, which will reset the group state to collapsed.

### Expand All / Collapse All Buttons (FR-002, FR-003, FR-004, FR-005)

**Button placement in SubscriptionsPage.tsx**:
- Buttons placed in the view-group-toggle area, after the pivot view toggle buttons
- Only visible when `activeViewMode !== 'default'`

**AG Grid API calls via ref**:
```typescript
// Expand all groups
gridRef.current?.api.expandAll();

// Collapse all groups
gridRef.current?.api.collapseAll();
```

### Component Communication

**SubscriptionList ref interface update**:
```typescript
export interface SubscriptionListHandle {
  resetFiltersAndSort: () => void;
  hasActiveFilters: () => boolean;
  expandAllGroups: () => void;      // NEW
  collapseAllGroups: () => void;    // NEW
}
```

**SubscriptionsPage button handlers**:
```typescript
const handleExpandAll = useCallback(() => {
  gridRef.current?.expandAllGroups();
}, []);

const handleCollapseAll = useCallback(() => {
  gridRef.current?.collapseAllGroups();
}, []);
```

## Complexity Tracking

> No violations - feature reuses existing AG Grid Enterprise API with minimal code additions.
