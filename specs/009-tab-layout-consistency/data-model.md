# Data Model: Tab Layout Consistency

**Feature**: 009-tab-layout-consistency
**Date**: 2025-12-22

## Overview

This is a UI-only feature with minimal data model impact. The only data structure involved is the View Group configuration for the Subscriptions tab.

## Entities

### SubscriptionViewGroup (Frontend State)

A view group configuration for toggling column visibility on the Subscriptions tab.

| Field | Type | Description |
|-------|------|-------------|
| key | string | Unique identifier (e.g., 'aiTools', 'saResources') |
| label | string | Display label (e.g., 'AI Tools', 'SA Resources') |
| active | boolean | Whether the group is currently enabled |
| columns | string[] | Column field names in this group (empty for placeholders) |

### View Group Definitions

| Key | Label | Columns (Placeholder) |
|-----|-------|----------------------|
| aiTools | AI Tools | [] (to be defined later) |
| saResources | SA Resources | [] (to be defined later) |
| byDistribution | By Distribution | [] (to be defined later) |
| byCategory | By Category | [] (to be defined later) |

## Storage

### localStorage Schema

**Key**: `subscriptionViewPreferences`
**Value**: JSON object

```json
{
  "aiTools": true,
  "saResources": false,
  "byDistribution": false,
  "byCategory": true
}
```

## No Database Changes

This feature does not modify any backend data models or database schemas.

## No API Changes

This feature does not add, modify, or remove any API endpoints.
