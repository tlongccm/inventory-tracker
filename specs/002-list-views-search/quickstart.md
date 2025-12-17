# Quickstart: Configurable List Views and Universal Search

**Feature**: 002-list-views-search
**Date**: 2025-12-16
**Status**: Implemented

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Existing inventory tracker setup from feature 001

## Development Setup

### 1. Start Backend (if not running)

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify at: http://localhost:8000/docs

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:3000

## Feature Implementation Order

This feature can be implemented incrementally. Recommended order:

### Phase 0: Layout Left-Alignment (Quick Win)

0. **Change container layout to left-aligned**
   - File: `frontend/src/index.css`
   - Change `.container` from `margin: 0 auto` to `margin-left: 0; margin-right: auto`
   - This ensures columns expand naturally to the right without unused left space

### Phase 1: Core View Toggle (P1)

1. **Create ViewGroupToggle component**
   - File: `frontend/src/components/ViewGroupToggle.tsx`
   - Toggle buttons for: Summary, Machine Specs, Performance, Assignment

2. **Create useViewPreferences hook**
   - File: `frontend/src/hooks/useViewPreferences.ts`
   - Persist to localStorage, load on mount

3. **Update EquipmentList component**
   - File: `frontend/src/components/EquipmentList.tsx`
   - Accept visible columns as prop
   - Ensure Status column always renders last

4. **Integrate in InventoryPage**
   - File: `frontend/src/pages/InventoryPage.tsx`
   - Add ViewGroupToggle above table
   - Wire up column visibility

### Phase 2: Universal Search (P1)

5. **Create SearchBox component**
   - File: `frontend/src/components/SearchBox.tsx`
   - Text input with debounce (300ms)
   - Regex toggle button

6. **Add search filtering logic**
   - File: `frontend/src/utils/search.ts`
   - Filter across all fields
   - Escape special chars when not in regex mode

7. **Integrate search in InventoryPage**
   - Apply filter before rendering list

### Phase 3: Sortable Column Indicators (P2)

8. **Enhance SortHeader in EquipmentList**
   - Show ⇅ icon for sortable columns
   - Show ▲/▼ for active sort column
   - Add hover styles

### Phase 4: Assignment History Enhancement (P2)

9. **Update AssignmentHistory component**
   - Include current assignment as first record
   - Add "Current" badge/label

## Key Files (All Implemented)

| File | Status | Description |
|------|--------|-------------|
| `frontend/src/index.css` | ✅ DONE | Left-align container layout |
| `frontend/src/components/ViewGroupToggle.tsx` | ✅ DONE | Toggle buttons for view groups |
| `frontend/src/components/SearchBox.tsx` | ✅ DONE | Search input with regex toggle |
| `frontend/src/hooks/useViewPreferences.ts` | ✅ DONE | localStorage persistence hook |
| `frontend/src/hooks/useColumnWidths.ts` | ✅ DONE | Column width persistence hook |
| `frontend/src/types/viewGroups.ts` | ✅ DONE | View group type definitions |
| `frontend/src/utils/search.ts` | ✅ DONE | Search filtering utilities |
| `frontend/src/utils/columns.ts` | ✅ DONE | Column definitions and visibility |
| `frontend/src/components/EquipmentList.tsx` | ✅ DONE | Configurable columns, sort indicators, resizable |
| `frontend/src/components/AssignmentHistory.tsx` | ✅ DONE | Include current assignment |
| `frontend/src/pages/InventoryPage.tsx` | ✅ DONE | Integrate new components |

## Testing Checklist

### Layout
- [ ] Container is left-aligned (content starts at left edge)
- [ ] When columns are added, they expand to the right naturally
- [ ] No unused space on the left side of the table

### View Groups
- [ ] Default view shows only always-visible columns + Status
- [ ] Enabling Summary shows Make, Model, Location, Notes
- [ ] Enabling Machine Specs shows CPU, RAM, Storage, Serial Number, etc.
- [ ] Enabling Performance shows PassMark scores
- [ ] Enabling Assignment shows assignment date, usage type, IP
- [ ] Status column always appears last
- [ ] Preferences persist after browser refresh
- [ ] Multiple view groups can be enabled simultaneously

### Universal Search
- [ ] Typing filters results in real-time (after debounce)
- [ ] Search matches across all fields (visible and hidden)
- [ ] Clearing search shows all records
- [ ] "No results" message when nothing matches
- [ ] Regex toggle shows visual indicator when active
- [ ] Valid regex patterns filter correctly
- [ ] Invalid regex shows error message
- [ ] Special characters treated as literals when regex disabled

### Sortable Columns
- [ ] Sortable columns have sort indicator icon
- [ ] Active sort column shows direction (▲/▼)
- [ ] Cursor changes to pointer on hover
- [ ] Non-sortable columns (Notes) have no indicator

### Assignment History
- [ ] Current assignment appears as first record
- [ ] Current record labeled/badged distinctly
- [ ] Historical records show in chronological order
- [ ] Equipment with no assignment shows appropriate message

## Troubleshooting

### View preferences not persisting
- Check browser's localStorage is enabled
- Verify key `inventory-view-preferences` exists in DevTools > Application > Local Storage

### Search not filtering
- Ensure equipment list is loaded before searching
- Check console for regex errors if in regex mode
- Verify debounce delay (300ms) - results update after pause

### Columns in wrong order
- Verify ALWAYS_VISIBLE_COLUMNS and STATUS_COLUMN constants
- Check getVisibleColumns() concatenation logic

### Sort indicators missing
- Ensure sortable prop is set correctly on columns
- Check CSS for .sort-indicator styles
