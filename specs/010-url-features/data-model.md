# Data Model: URL Features

**Feature**: 010-url-features
**Date**: 2025-12-22

## Overview

This feature is primarily URL/routing-focused with no persistent data model changes. The "data" is transient state encoded in browser URLs.

## URL Parameter Schema

The browser URL encodes the current application view configuration using query string parameters.

### Common Parameters (all tabs)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| tab | string | Active tab identifier | `equipment`, `software`, `subscriptions` |
| sort | string | Sort column field name | `provider`, `status`, `name` |
| order | string | Sort direction | `asc`, `desc` |
| search | string | Search term | `laptop` |

### Equipment Tab Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| type | string | Equipment type filter | `PC`, `Monitor`, `Printer` |
| status | string | Status filter | `Active`, `Inactive` |
| location | string | Location filter | `Office A` |
| views | string | Active view groups (comma-separated) | `assignment,hardware` |

### Software Tab Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| status | string | Software status filter | `Active`, `Expired` |
| category | string | Category filter | `Development` |
| views | string | Active view groups (comma-separated) | `license,purchase` |

### Subscriptions Tab Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| status | string | Subscription status filter | `Active`, `Inactive` |
| category_id | number | Category ID filter | `1`, `2` |
| owner | string | CCM Owner filter | `John` |
| value_level | string | Value level filter | `H`, `M`, `L` |
| views | string | Active view groups (comma-separated) | `aiTools,saResources` |

## State Mapping

### URL → Application State

When a URL is loaded, parameters are parsed and mapped to component state:

```
URL: /inventory?tab=subscriptions&status=Active&sort=provider&order=asc
     ↓
State: {
  activeTab: 'subscriptions',
  filters: { status: 'Active' },
  sortBy: 'provider',
  sortOrder: 'asc'
}
```

### Application State → URL

When user changes filters/views, state is serialized to URL:

```
State change: filters.status = 'Inactive'
     ↓
URL update: /inventory?tab=subscriptions&status=Inactive&sort=provider&order=asc
```

## No Database Changes

This feature does not modify any backend data models or database schemas.

## No API Changes

This feature does not add, modify, or remove any API endpoints.
