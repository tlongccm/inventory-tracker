# Research: SA Resources Pivot View

**Feature**: 015-sa-resources-view
**Date**: 2025-12-27

## Overview

This feature adds the SA Resources pivot view to the Subscriptions tab. Research confirms the existing codebase already has the infrastructure in place.

## Existing Infrastructure

### SA Resources Toggle Already Exists

**Decision**: Use existing `sa_resources` key in `SUBSCRIPTION_VIEW_GROUP_KEYS`

**Rationale**:
- The toggle button is already defined in the codebase (from feature 013)
- `SUBSCRIPTION_VIEW_GROUP_KEYS` includes `['ai_tools', 'sa_resources', 'by_distribution', 'by_authentication']`
- `SUBSCRIPTION_VIEW_GROUP_LABELS` maps `sa_resources` to "SA Resources"
- Button renders but has no specific column/filter behavior (placeholder)

**Confirmation**: Code inspection shows the toggle exists but `activeViewMode === 'sa_resources'` currently uses default columns.

### Column Definition Pattern

**Decision**: Follow established pattern from AI_TOOLS_COLUMNS, BY_DISTRIBUTION_COLUMNS

**Rationale**:
- Existing column definitions are simple arrays of ColDef objects
- Each view defines its own column set in SubscriptionList.tsx
- columnDefs useMemo selects correct columns based on viewMode

**Implementation Pattern**:
```typescript
const SA_RESOURCES_COLUMNS: ColDef<SubscriptionListItem>[] = [
  { field: 'provider', headerName: 'Provider', width: 200 },
  { field: 'link', headerName: 'URL', width: 250, cellRenderer: UrlCellRenderer },
  { field: 'ccm_owner', headerName: 'CCM Owner', width: 150 },
  { field: 'username', headerName: 'Username', width: 180 },
  { field: 'password', headerName: 'Password', width: 150 },
];
```

### Filtering Pattern

**Decision**: Add filter logic in SubscriptionsPage.tsx `filteredSubscriptions` useMemo

**Rationale**:
- Existing views (ai_tools, by_distribution, by_authentication) all filter in this location
- Client-side filtering is consistent with existing pattern
- No backend API changes needed

**Implementation Pattern**:
```typescript
if (activeViewMode === 'sa_resources') {
  result = result.filter(
    (sub) => sub.status === 'Active' && sub.access_level_required === 'Consultant'
  );
}
```

### Grouping Decision

**Decision**: SA Resources view uses flat list (no row grouping)

**Rationale**:
- User requirement specifies simple column list, no grouping mentioned
- Flat list is simpler and more direct for credential lookup use case
- isGroupedView will be false for sa_resources

**Implementation**:
- Do NOT set any `rowGroup: true` columns
- View will use default grid behavior (flat rows)

## Field Mapping

| Spec Column | Database Field | Notes |
|-------------|----------------|-------|
| Provider | provider | Direct mapping |
| URL | link | Use UrlCellRenderer for clickable links |
| CCM Owner | ccm_owner | Direct mapping |
| Username | username | Direct mapping |
| Password | password | Direct mapping, displayed as plain text |

## Open Items

None - all technical decisions resolved using existing patterns.
