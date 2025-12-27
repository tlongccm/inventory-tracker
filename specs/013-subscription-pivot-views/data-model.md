# Data Model: Subscription Pivot Views

**Feature**: 013-subscription-pivot-views
**Date**: 2025-12-27

## Overview

This feature is frontend-only and uses existing data structures. No backend changes or new entities required.

## Existing Entities Used

### SubscriptionListItem

The existing subscription list item type contains all fields needed for the new views:

| Field              | Type            | Used In              |
|--------------------|-----------------|----------------------|
| `subscription_id`  | string          | Row click → detail   |
| `subscriber_email` | string \| null  | By Distribution grouping |
| `authentication`   | string \| null  | By Authentication grouping, By Distribution column |
| `provider`         | string          | Both views (data column) |
| `status`           | string          | Active filter        |

### SubscriptionViewGroupKey

Updated type union for view toggle buttons:

```typescript
// Before (existing)
type SubscriptionViewGroupKey = 'ai_tools' | 'sa_resources' | 'by_distribution' | 'by_category';

// After (updated)
type SubscriptionViewGroupKey = 'ai_tools' | 'sa_resources' | 'by_distribution' | 'by_authentication';
```

### SubscriptionViewMode

Extended type for component props:

```typescript
// Before (existing)
type SubscriptionViewMode = 'default' | 'ai_tools';

// After (extended)
type SubscriptionViewMode = 'default' | 'ai_tools' | 'by_distribution' | 'by_authentication';
```

## View Configurations

### By Distribution View

| Property         | Value                |
|------------------|----------------------|
| Group Field      | `subscriber_email`   |
| Group Header     | "Destination Email"  |
| Data Columns     | authentication, provider |
| Filter           | status = 'Active'    |

### By Authentication View

| Property         | Value                |
|------------------|----------------------|
| Group Field      | `authentication`     |
| Group Header     | "Authentication Method" |
| Data Columns     | provider             |
| Filter           | status = 'Active'    |

## Null Value Handling

Both grouping fields may be null or empty:

| Field              | Null/Empty Display          |
|--------------------|-----------------------------|
| `subscriber_email` | "(No Destination Email)"    |
| `authentication`   | "(No Authentication Method)"|

AG Grid handles null grouping values automatically by creating a null group with a customizable label.

## No Schema Changes

- No database schema changes
- No API contract changes
- No new TypeScript interfaces beyond extending existing type unions
