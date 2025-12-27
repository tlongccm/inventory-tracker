# Implementation Plan: AG Grid Row Grouping & Status Bar

**Branch**: `012-ai-tool-pivot` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-ai-tool-pivot/spec.md`
**Status**: Implemented

## Summary

Three AG Grid Enterprise enhancements:

1. **Row Grouping for AI Tools View**: Replace the current column-switching approach with AG Grid's row grouping feature. When "AI Tools" button is clicked, subscriptions are grouped by `access_level_required` with collapsible groups showing aggregated cost totals. Uses `groupDisplayType: 'singleColumn'` for single-level grouping.

2. **Data Filtering for AI Tools View**: Filter subscriptions to only show items where category is "AI Tool" AND status is "Active".

3. **Status Bar with Cell Selection Statistics**: Enable the Status Bar at the bottom of the grid that shows count, sum, and average when users select cells. This works in both default and AI Tools views.

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

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Simplicity First** | PASS | Using existing AG Grid Enterprise features, no new dependencies |
| **II. Web Application Structure** | PASS | Frontend-only change, no API changes |
| **III. Data Integrity** | N/A | Display-only feature, no data mutations |
| **IV. Pragmatic Testing** | PASS | Manual testing acceptable per constitution |
| **V. Incremental Delivery** | PASS | Single feature, independently testable |

**Gate Status**: PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/012-ai-tool-pivot/
├── plan.md              # This file
├── research.md          # AG Grid research (row grouping + status bar)
├── spec.md              # Feature specification
├── quickstart.md        # Setup/testing guide
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── SubscriptionList.tsx    # Main file to modify
│   ├── pages/
│   │   └── SubscriptionsPage.tsx   # No changes needed
│   └── main.tsx                    # Already has AG Grid modules
└── package.json                    # No changes (AG Grid already installed)
```

**Structure Decision**: Web application - frontend only. This feature modifies a single component (SubscriptionList.tsx) to add row grouping and status bar.

## Implementation Details

### Feature 1: Row Grouping (AI Tools View)

**Grid Options Added** (in `SubscriptionList.tsx`):
```typescript
groupDisplayType={viewMode === 'ai_tools' ? 'singleColumn' : undefined}
autoGroupColumnDef={viewMode === 'ai_tools' ? autoGroupColumnDef : undefined}
groupDefaultExpanded={viewMode === 'ai_tools' ? 1 : undefined}
```

**Column Configuration** (AI_TOOLS_COLUMNS):
```typescript
{
  field: 'access_level_required',
  rowGroup: true,
  hide: true,  // Hide original column, grouping shows in auto group column
}
```

**Auto Group Column**:
```typescript
const autoGroupColumnDef: ColDef<SubscriptionListItem> = {
  headerName: 'Access Level',
  minWidth: 180,
  cellRendererParams: {
    suppressCount: false,  // Show item count in group header
  },
};
```

### Feature 2: Data Filtering (AI Tools View)

**Filter Logic** (in `SubscriptionsPage.tsx`):
```typescript
// For AI Tools view, filter to only "AI Tool" category and Active status
if (activeViewMode === 'ai_tools') {
  result = result.filter((sub) => sub.category_name === 'AI Tool' && sub.status === 'Active');
}
```

### Feature 3: Status Bar

**Grid Options Added**:
```typescript
cellSelection: true,
statusBar: {
  statusPanels: [
    { statusPanel: 'agTotalRowCountComponent', align: 'left' },
    {
      statusPanel: 'agAggregationComponent',
      statusPanelParams: { aggFuncs: ['count', 'sum', 'avg'] },
    },
  ],
},
```

### Horizontal Scrollbar Fix (Default View)

**Wrapper Div** (in `SubscriptionList.tsx`):
```tsx
<div className="ag-grid-container" style={{ width: '100%', overflowX: 'auto' }}>
  <div style={{ minWidth: viewMode === 'default' ? '3500px' : undefined, height: '100%' }}>
    <AgGridReact ... />
  </div>
</div>
```

This forces the container to have a minimum width of 3500px in default view, ensuring the horizontal scrollbar appears when columns exceed viewport width.

## Complexity Tracking

> No violations - feature uses existing AG Grid Enterprise capabilities with minimal code changes.
