# Implementation Plan: SA Resources Pivot View

**Branch**: `015-sa-resources-view` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-sa-resources-view/spec.md`

## Summary

Implement the SA Resources pivot view for the Subscriptions tab. This view filters to show only Active subscriptions with Access Level = "Consultant" and displays a simplified column set: Provider, URL, CCM Owner, Username, and Password. The implementation follows the existing pivot view pattern established in features 012-014.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.2
**Primary Dependencies**: ag-grid-react v35.0.0, ag-grid-enterprise v35.0.0
**Storage**: N/A (frontend-only change, no new data storage)
**Testing**: Manual testing (per constitution - acceptable for UI/CRUD)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: View toggle operates in under 100ms
**Constraints**: Must work with existing AG Grid implementation and pivot view pattern
**Scale/Scope**: ~50-200 subscriptions, filtering to Consultant-level subset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Simplicity First** | PASS | Reuses existing pivot view pattern, minimal new code |
| **II. Web Application Structure** | PASS | Frontend-only change, no API changes required |
| **III. Data Integrity** | N/A | Display-only feature, no data mutations |
| **IV. Pragmatic Testing** | PASS | Manual testing acceptable per constitution |
| **V. Incremental Delivery** | PASS | Single user story, independently testable and deployable |

**Gate Status**: PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/015-sa-resources-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
├── quickstart.md        # Setup/testing guide
└── tasks.md             # Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── SubscriptionList.tsx    # Add SA_RESOURCES_COLUMNS column definition
│   └── pages/
│       └── SubscriptionsPage.tsx   # Add sa_resources filtering logic
└── package.json                    # No changes (AG Grid already installed)
```

**Structure Decision**: Web application - frontend only. This feature modifies two existing files following the established pattern from features 012-014.

## Implementation Details

### Column Definition

```typescript
// SA Resources view columns - flat list (no grouping)
const SA_RESOURCES_COLUMNS: ColDef<SubscriptionListItem>[] = [
  { field: 'provider', headerName: 'Provider', width: 200 },
  { field: 'link', headerName: 'URL', width: 250, cellRenderer: UrlCellRenderer },
  { field: 'ccm_owner', headerName: 'CCM Owner', width: 150 },
  { field: 'username', headerName: 'Username', width: 180 },
  { field: 'password', headerName: 'Password', width: 150 },
];
```

### Filtering Logic

In SubscriptionsPage.tsx filteredSubscriptions useMemo:
```typescript
// For SA Resources view, filter to Active + Consultant access level
if (activeViewMode === 'sa_resources') {
  result = result.filter(
    (sub) => sub.status === 'Active' && sub.access_level_required === 'Consultant'
  );
}
```

### View Mode Integration

- SA Resources is already defined in `SUBSCRIPTION_VIEW_GROUP_KEYS` (placeholder exists)
- No grouping required - flat list display
- Expand All/Collapse All toggle works (no-op since no groups)

## Complexity Tracking

> No violations - feature reuses existing pivot view pattern with minimal additions.
