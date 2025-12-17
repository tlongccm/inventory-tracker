# Data Model: Configurable List Views and Universal Search

**Feature**: 002-list-views-search
**Date**: 2025-12-16
**Status**: Implemented

## Overview

This feature is primarily frontend-focused. No database schema changes are required. The data model changes involve:
1. Frontend type definitions for view configuration
2. Column grouping configuration
3. Search state management

## Existing Entities (No Changes)

### Equipment (Backend - SQLAlchemy)

The existing `Equipment` model already contains all required fields. No modifications needed.

**Relevant Fields by View Group**:

| View Group | Fields |
|------------|--------|
| Always Visible | `equipment_id`, `computer_subtype`, `primary_user`, `equipment_name`, `status` |
| Summary | `manufacturer`, `model`, `location`, `notes` |
| Machine Spec | `cpu_model`, `ram`, `storage`, `operating_system`, `serial_number`, `mac_address` |
| Machine Performance | `cpu_score`, `score_2d`, `score_3d`, `memory_score`, `disk_score`, `overall_rating` |
| Assignment | `assignment_date`, `usage_type`, `ip_address` |

### AssignmentHistory (Backend - SQLAlchemy)

Existing model. Used to display historical assignments alongside current assignment.

**Relevant Fields**: `previous_user`, `previous_usage_type`, `previous_equipment_name`, `start_date`, `end_date`

---

## New Frontend Types

### ViewGroupConfig

Configuration for column view groups.

```typescript
// frontend/src/types/viewGroups.ts

export type ViewGroupKey = 'summary' | 'machineSpec' | 'machinePerformance' | 'assignment';

export interface ViewGroupDefinition {
  key: ViewGroupKey;
  label: string;
  fields: string[];
}

export interface ViewPreferences {
  summary: boolean;
  machineSpec: boolean;
  machinePerformance: boolean;
  assignment: boolean;
}

export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  summary: false,
  machineSpec: false,
  machinePerformance: false,
  assignment: false,
};
```

### ColumnDefinition

Configuration for individual columns.

```typescript
export interface ColumnDefinition {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  render?: (value: unknown, item: Equipment) => React.ReactNode;
}
```

### SearchState

State for universal search functionality.

```typescript
export interface SearchState {
  term: string;
  isRegex: boolean;
  error: string | null;
  isValid: boolean;
}

export const DEFAULT_SEARCH_STATE: SearchState = {
  term: '',
  isRegex: false,
  error: null,
  isValid: true,
};
```

### AssignmentHistoryRecord (Enhanced)

Extended type to include current assignment indicator.

```typescript
export interface AssignmentHistoryRecord {
  user: string;
  usageType: string | null;
  equipmentName: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}
```

---

## Column Configuration

### Always Visible Columns

These columns are always displayed regardless of view group settings.

```typescript
export const ALWAYS_VISIBLE_COLUMNS: ColumnDefinition[] = [
  { key: 'equipment_id', label: 'Equipment ID', sortable: true },
  { key: 'computer_subtype', label: 'Sub Type', sortable: true },
  { key: 'primary_user', label: 'User', sortable: true },
  { key: 'equipment_name', label: 'Name', sortable: true },
];

// Status is always last - handled separately
export const STATUS_COLUMN: ColumnDefinition = {
  key: 'status',
  label: 'Status',
  sortable: true,
};
```

### View Group Column Definitions

```typescript
export const VIEW_GROUP_COLUMNS: Record<ViewGroupKey, ColumnDefinition[]> = {
  summary: [
    { key: 'manufacturer', label: 'Make', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'notes', label: 'Notes', sortable: false },
  ],
  machineSpec: [
    { key: 'cpu_model', label: 'CPU Model', sortable: true },
    { key: 'ram', label: 'RAM', sortable: true },
    { key: 'storage', label: 'Storage', sortable: true },
    { key: 'operating_system', label: 'OS', sortable: true },
    { key: 'serial_number', label: 'Serial #', sortable: true },
    { key: 'mac_address', label: 'MAC', sortable: false },
  ],
  machinePerformance: [
    { key: 'cpu_score', label: 'CPU Score', sortable: true },
    { key: 'score_2d', label: '2D Score', sortable: true },
    { key: 'score_3d', label: '3D Score', sortable: true },
    { key: 'memory_score', label: 'RAM Score', sortable: true },
    { key: 'disk_score', label: 'Disk Score', sortable: true },
    { key: 'overall_rating', label: 'Overall', sortable: true },
  ],
  assignment: [
    { key: 'assignment_date', label: 'Assigned', sortable: true },
    { key: 'usage_type', label: 'Usage', sortable: true },
    { key: 'ip_address', label: 'IP Address', sortable: false },
  ],
};
```

---

## Local Storage Schema

### View Preferences

**Key**: `inventory-view-preferences`

**Value** (JSON):
```json
{
  "summary": true,
  "machineSpec": false,
  "machinePerformance": false,
  "assignment": true
}
```

**Validation**:
- If stored value is invalid JSON or missing keys, reset to defaults
- Handle gracefully if localStorage is unavailable (fallback to defaults)

---

## State Transitions

### Search State

```
┌─────────────┐    user types    ┌─────────────┐
│   Empty     │ ───────────────► │  Searching  │
│  term: ''   │                  │  term: 'x'  │
└─────────────┘                  └─────────────┘
      ▲                                │
      │ clear                          │ toggle regex
      │                                ▼
      │                          ┌─────────────┐
      │                          │ Regex Mode  │
      │                          │ isRegex:true│
      │                          └─────────────┘
      │                                │
      │                                │ invalid pattern
      │                                ▼
      │                          ┌─────────────┐
      └────────────────────────  │   Error     │
                                 │ error: msg  │
                                 └─────────────┘
```

### View Group Toggle State

```
┌──────────────┐    toggle    ┌──────────────┐
│   Disabled   │ ◄──────────► │   Enabled    │
│ group: false │              │ group: true  │
└──────────────┘              └──────────────┘
       │                             │
       └─────────── save ────────────┘
                     │
                     ▼
              localStorage
```

---

## Relationships

```
┌───────────────────┐
│   InventoryPage   │
└─────────┬─────────┘
          │ manages
          ▼
┌───────────────────┐     ┌────────────────────┐
│  ViewPreferences  │────►│   localStorage     │
└───────────────────┘     └────────────────────┘
          │
          │ determines
          ▼
┌───────────────────┐     ┌────────────────────┐
│  VisibleColumns   │────►│   EquipmentList    │
└───────────────────┘     └────────────────────┘
          │
          │ filters
          ▼
┌───────────────────┐
│    SearchState    │
└───────────────────┘
```

---

## Implementation Status

All data model definitions have been implemented:

| Type Definition | File Location | Status |
|-----------------|---------------|--------|
| ViewGroupKey | `frontend/src/types/viewGroups.ts` | ✅ Implemented |
| ViewPreferences | `frontend/src/types/viewGroups.ts` | ✅ Implemented |
| SearchState | `frontend/src/types/viewGroups.ts` | ✅ Implemented |
| ColumnDefinition | `frontend/src/utils/columns.ts` | ✅ Implemented |
| ALWAYS_VISIBLE_COLUMNS | `frontend/src/utils/columns.ts` | ✅ Implemented |
| VIEW_GROUP_COLUMNS | `frontend/src/utils/columns.ts` | ✅ Implemented |
| AssignmentHistoryRecord | `frontend/src/components/AssignmentHistory.tsx` | ✅ Implemented |
| localStorage persistence | `frontend/src/hooks/useViewPreferences.ts` | ✅ Implemented |
