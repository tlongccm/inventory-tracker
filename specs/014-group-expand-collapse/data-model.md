# Data Model: Pivot View Group Expand/Collapse Controls

**Feature**: 014-group-expand-collapse
**Date**: 2025-12-27

## Overview

This feature is frontend-only and uses existing data structures. No backend changes or new entities required.

## Existing Entities Used

### SubscriptionViewMode

The existing view mode type already includes all needed pivot views:

```typescript
type SubscriptionViewMode = 'default' | 'ai_tools' | 'by_distribution' | 'by_authentication';
```

### SubscriptionListHandle (Extended)

Existing ref interface extended with new methods:

| Method               | Type         | Description                              |
|---------------------|--------------|------------------------------------------|
| resetFiltersAndSort | () => void   | Existing - clears filters and sort       |
| hasActiveFilters    | () => boolean| Existing - checks if filters are active  |
| expandAllGroups     | () => void   | **NEW** - expands all group rows         |
| collapseAllGroups   | () => void   | **NEW** - collapses all group rows       |

## No Schema Changes

- No database schema changes
- No API contract changes
- No new TypeScript interfaces beyond extending existing ref handle
- All changes are UI behavior modifications using existing AG Grid Enterprise APIs
