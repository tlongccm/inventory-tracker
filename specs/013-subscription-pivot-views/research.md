# Research: Subscription Pivot Views

**Feature**: 013-subscription-pivot-views
**Date**: 2025-12-27

## Overview

This feature adds two new grouped views to the Subscriptions tab. Research is minimal because the implementation follows the established pattern from the AI Tools view (feature 012).

## Pattern Reuse Decision

**Decision**: Reuse existing AG Grid row grouping pattern from AI Tools view

**Rationale**:
- AI Tools view already implements row grouping with AG Grid Enterprise
- Same grid instance, same data source (SubscriptionListItem)
- Proven pattern with working code to reference
- Consistent UX across all grouped views

**Alternatives Considered**:
1. **Custom grouping logic**: Rejected - AG Grid Enterprise already provides this functionality
2. **Separate component per view**: Rejected - Violates DRY, harder to maintain consistency

## View Mode Architecture

**Decision**: Extend existing `SubscriptionViewMode` type with new view modes

**Rationale**:
- Existing toggle button infrastructure already supports mutually exclusive views
- `viewMode` prop already passed to SubscriptionList component
- Column selection logic already uses view mode for AI Tools

**Implementation Pattern**:
```typescript
type SubscriptionViewMode = 'default' | 'ai_tools' | 'by_distribution' | 'by_authentication';
```

## Filtering Approach

**Decision**: Filter to Active subscriptions in SubscriptionsPage.tsx (same as AI Tools)

**Rationale**:
- Consistent with AI Tools view behavior
- Filtering at page level (not grid level) allows grid to handle only display
- Easy to understand and maintain

**Pattern**:
```typescript
if (activeViewMode === 'by_distribution' || activeViewMode === 'by_authentication') {
  result = result.filter((sub) => sub.status === 'Active');
}
```

## Column Configuration

**Decision**: Define separate column arrays for each view

**Rationale**:
- Clear separation of concerns
- Easy to modify columns per view independently
- Matches AI Tools implementation pattern

**By Distribution Columns**:
- Group by: `subscriber_email` (Destination Email)
- Data columns: `authentication`, `provider`

**By Authentication Columns**:
- Group by: `authentication`
- Data columns: `provider`

## Toggle Button Updates

**Decision**: Replace `by_category` with `by_authentication` in toggle configuration

**Rationale**:
- `by_distribution` already exists as placeholder
- `by_category` placeholder replaced with `by_authentication`
- Maintains 4-button layout

## No New Dependencies Required

The feature uses only:
- AG Grid Enterprise row grouping (already installed and configured)
- Existing SubscriptionListItem data structure (has all required fields)
- Existing toggle button infrastructure

## Open Items

None - all technical decisions resolved by following established patterns.
