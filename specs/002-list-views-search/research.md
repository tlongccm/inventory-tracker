# Research: Configurable List Views and Universal Search

**Feature**: 002-list-views-search
**Date**: 2025-12-16
**Status**: Complete - All decisions implemented

## Research Topics

### 0. Layout Left-Alignment

**Decision**: Change `.container` CSS from `margin: 0 auto` to `margin-left: 0; margin-right: auto`

**Rationale**:
- User reports that centered layout causes columns to expand rightward while leaving unused space on the left
- When expanding column view groups, this creates an unnatural visual experience
- Left-aligned layout provides predictable expansion behavior

**Current Implementation** (frontend/src/index.css lines 15-19):
```css
.container {
  max-width: 1200px;
  margin: 0 auto;  /* <-- This centers the container */
  padding: 20px;
}
```

**Change Required**:
```css
.container {
  max-width: 1200px;
  margin-left: 0;      /* Left-align the container */
  margin-right: auto;
  padding: 20px;
}
```

**Alternatives Considered**:
- Remove max-width entirely: Rejected because extremely wide tables are harder to read
- Keep centered but add horizontal scroll: Rejected as more complex and worse UX

---

### 1. Local Storage for View Preferences

**Decision**: Use browser localStorage API directly

**Rationale**:
- Simple key-value storage is sufficient for view group preferences
- Native browser API - no additional dependencies
- Persists across browser sessions as required
- React hook (useLocalStorage or custom) provides clean integration

**Alternatives Considered**:
- Session storage: Rejected - doesn't persist across browser close
- IndexedDB: Rejected - over-engineered for simple preferences
- State management library (Redux persist): Rejected - adds dependency for simple use case

**Implementation Pattern**:
```typescript
// Custom hook for view preferences
const STORAGE_KEY = 'inventory-view-preferences';

interface ViewPreferences {
  summary: boolean;
  machineSpec: boolean;
  machinePerformance: boolean;
  assignment: boolean;
}

function useViewPreferences() {
  const [prefs, setPrefs] = useState<ViewPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  const updatePrefs = (newPrefs: ViewPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    setPrefs(newPrefs);
  };

  return [prefs, updatePrefs] as const;
}
```

---

### 2. Universal Search Implementation

**Decision**: Client-side filtering with server-side fallback for large datasets

**Rationale**:
- Current dataset size (~1000s records) suitable for client-side filtering
- API already returns all equipment on list request
- Client-side provides instant feedback (no network latency)
- Regex support easier to implement client-side with JavaScript RegExp

**Alternatives Considered**:
- Server-side only: Rejected - adds latency for each keystroke; existing API returns full list
- Hybrid (client + server): Future option if dataset grows significantly

**Implementation Pattern**:
```typescript
function filterEquipment(
  items: Equipment[],
  searchTerm: string,
  isRegex: boolean
): Equipment[] {
  if (!searchTerm) return items;

  try {
    const pattern = isRegex
      ? new RegExp(searchTerm, 'i')
      : new RegExp(escapeRegex(searchTerm), 'i');

    return items.filter(item => {
      // Search across all stringified fields
      const searchableText = Object.values(item)
        .filter(v => v !== null && v !== undefined)
        .map(v => String(v))
        .join(' ');
      return pattern.test(searchableText);
    });
  } catch (e) {
    // Invalid regex - return unfiltered or show error
    return items;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

---

### 3. Regex Validation and Error Handling

**Decision**: Validate regex on input, show inline error, preserve last valid filter

**Rationale**:
- Users should see immediate feedback on invalid patterns
- Don't clear results on invalid regex - confusing UX
- Keep last valid search active while user fixes pattern

**Implementation Pattern**:
```typescript
function validateRegex(pattern: string): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}
```

---

### 4. Column Ordering with Status Last

**Decision**: Define column order in configuration, always append Status at render time

**Rationale**:
- Simple array concatenation ensures Status is always last
- Configuration-driven approach allows easy maintenance
- No complex sorting logic needed

**Implementation Pattern**:
```typescript
const ALWAYS_VISIBLE = ['equipment_id', 'computer_subtype', 'primary_user', 'equipment_name'];
const VIEW_GROUPS = {
  summary: ['manufacturer', 'model', 'location', 'notes'],
  machineSpec: ['cpu_type', 'ram', 'storage', 'serial_number', ...],
  machinePerformance: ['cpu_score', 'memory_score', 'disk_score', 'overall_rating'],
  assignment: ['assignment_date', 'usage_type', 'ip_address'],
};
const STATUS_COLUMN = 'status'; // Always last

function getVisibleColumns(activeGroups: string[]): string[] {
  const columns = [...ALWAYS_VISIBLE];
  activeGroups.forEach(group => {
    columns.push(...VIEW_GROUPS[group]);
  });
  columns.push(STATUS_COLUMN);
  return columns;
}
```

---

### 5. Sortable Column Visual Indicators

**Decision**: Add sort icon to header; show direction indicator only when active

**Rationale**:
- Existing codebase has sort direction indicator (▲/▼)
- Need to add indicator for sortable vs non-sortable columns
- Cursor pointer already implemented for sortable columns

**Implementation Pattern**:
```typescript
// Enhance existing SortHeader component
const SortHeader = ({ field, label, sortable = true }: Props) => (
  <th
    onClick={() => sortable && onSort?.(field)}
    className={sortable ? 'sortable' : ''}
    style={{ cursor: sortable ? 'pointer' : 'default' }}
  >
    {label}
    {sortable && (
      <span className="sort-indicator">
        {sortBy === field ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    )}
  </th>
);
```

**CSS Addition**:
```css
.sortable:hover {
  background-color: #f5f5f5;
}
.sort-indicator {
  margin-left: 4px;
  opacity: 0.5;
}
th.sortable .sort-indicator {
  opacity: 1;
}
```

---

### 6. Assignment History Current Record

**Decision**: Query assignment history endpoint, include synthetic "current" record from equipment data

**Rationale**:
- Current assignment is stored on Equipment entity, not in history
- Need to combine equipment's current assignment fields with historical records
- Display "Current" label/badge to distinguish from historical records

**Implementation Pattern**:
```typescript
interface AssignmentRecord {
  user: string;
  usageType: string;
  equipmentName: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

function buildAssignmentHistory(
  equipment: Equipment,
  history: AssignmentHistoryResponse[]
): AssignmentRecord[] {
  const records: AssignmentRecord[] = [];

  // Add current assignment as first record if exists
  if (equipment.primary_user) {
    records.push({
      user: equipment.primary_user,
      usageType: equipment.usage_type,
      equipmentName: equipment.equipment_name,
      startDate: equipment.assignment_date,
      endDate: null,
      isCurrent: true,
    });
  }

  // Add historical records
  history.forEach(h => {
    records.push({
      user: h.previous_user,
      usageType: h.previous_usage_type,
      equipmentName: h.previous_equipment_name,
      startDate: h.start_date,
      endDate: h.end_date,
      isCurrent: false,
    });
  });

  return records;
}
```

---

### 7. View Group Toggle UI Component

**Decision**: Horizontal row of toggle chips/buttons above the table

**Rationale**:
- Clarification confirmed: toggle buttons/chips above table
- Should show active state clearly (filled vs outlined)
- Compact design doesn't take much vertical space

**Implementation Pattern**:
```tsx
interface ViewGroupToggleProps {
  activeGroups: string[];
  onToggle: (group: string) => void;
}

const VIEW_GROUP_LABELS = {
  summary: 'Summary',
  machineSpec: 'Machine Specs',
  machinePerformance: 'Performance',
  assignment: 'Assignment',
};

function ViewGroupToggle({ activeGroups, onToggle }: ViewGroupToggleProps) {
  return (
    <div className="view-group-toggle">
      {Object.entries(VIEW_GROUP_LABELS).map(([key, label]) => (
        <button
          key={key}
          className={`toggle-chip ${activeGroups.includes(key) ? 'active' : ''}`}
          onClick={() => onToggle(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

---

## Summary

All technical decisions align with the Constitution's Simplicity First principle:
- Client-side filtering avoids unnecessary API complexity
- Direct localStorage usage avoids state management overhead
- Configuration-driven column ordering is maintainable
- Existing component patterns are extended, not replaced

No NEEDS CLARIFICATION items remain. Ready for Phase 1.

## Implementation Status

All research decisions have been implemented in the codebase:

| Topic | Implementation Location | Status |
|-------|------------------------|--------|
| Layout Left-Alignment | `frontend/src/index.css` | ✅ Implemented |
| Local Storage Preferences | `frontend/src/hooks/useViewPreferences.ts` | ✅ Implemented |
| Universal Search | `frontend/src/components/SearchBox.tsx`, `frontend/src/utils/search.ts` | ✅ Implemented |
| Regex Validation | `frontend/src/utils/search.ts` | ✅ Implemented |
| Column Ordering | `frontend/src/utils/columns.ts` | ✅ Implemented |
| Sortable Indicators | `frontend/src/components/EquipmentList.tsx` | ✅ Implemented |
| Assignment History Current | `frontend/src/components/AssignmentHistory.tsx` | ⚠️ Needs verification |
| View Group Toggle UI | `frontend/src/components/ViewGroupToggle.tsx` | ✅ Implemented |
