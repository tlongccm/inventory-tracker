# Data Model: AI Tool Pivot View with AG Grid Enterprise

**Feature**: 012-ai-tool-pivot
**Date**: 2025-12-25
**Update**: AG Grid Enterprise integration

## Summary

No data model changes required. This feature uses existing fields from the SubscriptionListItem entity. AG Grid column definitions map directly to existing data fields.

## Existing Fields Used

The AI Tools pivot view uses the following existing fields from `SubscriptionListItem`:

| Field | Type | AG Grid ColDef | Used For |
|-------|------|----------------|----------|
| access_level_required | string \| null | `{ field: 'access_level_required' }` | Column 1: Access Level |
| provider | string | `{ field: 'provider' }` | Column 2: Provider |
| username | string \| null | `{ field: 'username' }` | Column 3: Username |
| password | string \| null | `{ field: 'password' }` | Column 4: Password |
| description_value | string \| null | `{ field: 'description_value' }` | Column 5: Description |
| cost | string \| null | N/A (used in calculation) | Monthly Cost calculation |
| annual_cost | number \| null | `{ field: 'annual_cost' }` | Column 7, Monthly Cost fallback |
| payment_frequency | PaymentFrequency \| null | N/A (used in calculation) | Monthly Cost calculation |

## AG Grid Column Definitions

### AI Tools View Columns (7 columns)

```typescript
import { ColDef } from 'ag-grid-community';
import type { SubscriptionListItem } from '../types/subscription';

const AI_TOOLS_COLUMNS: ColDef<SubscriptionListItem>[] = [
  {
    field: 'access_level_required',
    headerName: 'Access Level Required',
    width: 160
  },
  {
    field: 'provider',
    headerName: 'Provider',
    width: 180
  },
  {
    field: 'username',
    headerName: 'Username',
    width: 150
  },
  {
    field: 'password',
    headerName: 'Password',
    width: 120
  },
  {
    field: 'description_value',
    headerName: 'Description & Value to CCM',
    width: 250,
    tooltipField: 'description_value'
  },
  {
    colId: 'monthly_cost',
    headerName: 'Monthly Cost',
    width: 120,
    type: 'rightAligned',
    valueGetter: (params) => calculateMonthlyCost(params.data),
    valueFormatter: (params) => formatCurrency(params.value)
  },
  {
    field: 'annual_cost',
    headerName: 'Annual Cost',
    width: 120,
    type: 'rightAligned',
    valueFormatter: (params) => formatCurrency(params.value)
  },
];
```

## Calculated Field

### Monthly Cost (valueGetter)

**Type**: number | null (displayed as currency string via valueFormatter)

**Calculation Logic**:
```typescript
function calculateMonthlyCost(sub: SubscriptionListItem | undefined): number | null {
  if (!sub) return null;
  const { cost, payment_frequency, annual_cost } = sub;

  // Priority 1: Use cost with payment_frequency
  if (cost && payment_frequency) {
    const numericCost = parseFloat(cost.replace(/[$,]/g, ''));
    if (!isNaN(numericCost)) {
      if (payment_frequency === 'Monthly') return numericCost;
      if (payment_frequency === 'Annual') return numericCost / 12;
    }
  }

  // Priority 2: Fallback to annual_cost / 12
  if (annual_cost !== null && annual_cost !== undefined) {
    return annual_cost / 12;
  }

  // Priority 3: No data available
  return null;
}
```

**Display Format**: USD currency via `Intl.NumberFormat`

## Currency Formatter

```typescript
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
```

## TypeScript Interface (Existing - No Changes)

```typescript
// frontend/src/types/subscription.ts - no modifications needed
export interface SubscriptionListItem {
  subscription_id: string;
  provider: string;
  // ... all existing fields remain unchanged
  access_level_required: string | null;
  username: string | null;
  password: string | null;
  description_value: string | null;
  cost: string | null;
  annual_cost: number | null;
  payment_frequency: PaymentFrequency | null;
  // ...
}
```

## No Schema Changes

- No new database tables
- No new columns
- No migrations required
- Backend API unchanged
- TypeScript types unchanged
