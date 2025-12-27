# Implementation Plan: Subscription Pivot Views (By Distribution & By Authentication)

**Branch**: `013-subscription-pivot-views` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-subscription-pivot-views/spec.md`

## Summary

Add two new grouped views to the Subscriptions tab following the established AI Tools view pattern:

1. **By Distribution View**: Groups active subscriptions by Destination Email (`subscriber_email`), displaying Authentication Method and Provider columns. Helps users audit which email addresses receive subscription content.

2. **By Authentication View**: Groups active subscriptions by Authentication Method (`authentication`), displaying Provider column. Helps users audit credential management across services.

Both views use AG Grid Enterprise row grouping with the same patterns established in the AI Tools view (feature 012).

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.2
**Primary Dependencies**: ag-grid-react v35.0.0, ag-grid-enterprise v35.0.0
**Storage**: N/A (frontend-only change)
**Testing**: Manual testing (per constitution - acceptable for UI/CRUD)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: View switch < 100ms, smooth 60fps scrolling
**Constraints**: Must work with existing subscription data, no backend changes
**Scale/Scope**: ~50-200 subscriptions typical dataset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle                    | Status | Notes                                                          |
|------------------------------|--------|----------------------------------------------------------------|
| **I. Simplicity First**      | PASS   | Reuses existing AG Grid pattern from AI Tools view             |
| **II. Web Application Structure** | PASS   | Frontend-only change, no API changes                      |
| **III. Data Integrity**      | N/A    | Display-only feature, no data mutations                        |
| **IV. Pragmatic Testing**    | PASS   | Manual testing acceptable per constitution                     |
| **V. Incremental Delivery**  | PASS   | Each view independently testable and deliverable               |

**Gate Status**: PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/013-subscription-pivot-views/
├── plan.md              # This file
├── research.md          # Pattern research (minimal - follows established pattern)
├── spec.md              # Feature specification
├── quickstart.md        # Setup/testing guide
└── tasks.md             # Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── SubscriptionList.tsx    # Add column definitions for new views
│   └── pages/
│       └── SubscriptionsPage.tsx   # Update view mode logic and filtering
└── package.json                    # No changes (AG Grid already installed)
```

**Structure Decision**: Web application - frontend only. This feature modifies two existing files to add new grouped views following the established pattern.

## Implementation Details

### View 1: By Distribution

**Column Configuration** (new constant `BY_DISTRIBUTION_COLUMNS`):
```typescript
const BY_DISTRIBUTION_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'subscriber_email',
    rowGroup: true,
    hide: true,  // Hide original column, grouping shows in auto group column
  },
  { field: 'authentication', headerName: 'Authentication Method', width: 180 },
  { field: 'provider', headerName: 'Provider', width: 200 },
];
```

**Auto Group Column**:
```typescript
const distributionGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Destination Email',
  minWidth: 250,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};
```

**Filter Logic** (in `SubscriptionsPage.tsx`):
```typescript
if (activeViewMode === 'by_distribution') {
  result = result.filter((sub) => sub.status === 'Active');
}
```

### View 2: By Authentication

**Column Configuration** (new constant `BY_AUTHENTICATION_COLUMNS`):
```typescript
const BY_AUTHENTICATION_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'authentication',
    rowGroup: true,
    hide: true,  // Hide original column, grouping shows in auto group column
  },
  { field: 'provider', headerName: 'Provider', width: 200 },
];
```

**Auto Group Column**:
```typescript
const authenticationGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Authentication Method',
  minWidth: 200,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};
```

**Filter Logic** (in `SubscriptionsPage.tsx`):
```typescript
if (activeViewMode === 'by_authentication') {
  result = result.filter((sub) => sub.status === 'Active');
}
```

### View Mode Type Update

**Update SubscriptionViewMode type**:
```typescript
type SubscriptionViewMode = 'default' | 'ai_tools' | 'by_distribution' | 'by_authentication';
```

### Toggle Button Configuration

**Update SUBSCRIPTION_VIEW_GROUP_KEYS** (in `SubscriptionsPage.tsx`):
```typescript
const SUBSCRIPTION_VIEW_GROUP_KEYS = ['ai_tools', 'sa_resources', 'by_distribution', 'by_authentication'] as const;

const SUBSCRIPTION_VIEW_GROUP_LABELS: Record<SubscriptionViewGroupKey, string> = {
  ai_tools: 'AI Tools',
  sa_resources: 'SA Resources',
  by_distribution: 'By Distribution',
  by_authentication: 'By Authentication',  // Replace 'by_category'
};
```

### Grid Props Conditional Logic

**Update AgGridReact props** (in `SubscriptionList.tsx`):
```typescript
// Select columns and group config based on view mode
const columnDefs = useMemo(() => {
  switch (viewMode) {
    case 'ai_tools': return AI_TOOLS_COLUMNS;
    case 'by_distribution': return BY_DISTRIBUTION_COLUMNS;
    case 'by_authentication': return BY_AUTHENTICATION_COLUMNS;
    default: return ALL_COLUMNS;
  }
}, [viewMode]);

const autoGroupColumnDef = useMemo(() => {
  switch (viewMode) {
    case 'ai_tools': return aiToolsGroupColumnDef;
    case 'by_distribution': return distributionGroupColumnDef;
    case 'by_authentication': return authenticationGroupColumnDef;
    default: return undefined;
  }
}, [viewMode]);

const isGroupedView = viewMode !== 'default';
```

## Complexity Tracking

> No violations - feature reuses existing AG Grid Enterprise patterns with minimal code additions.
