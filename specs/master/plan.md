# Implementation Plan: Migrate Equipment Table to AG Grid

**Branch**: `master` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/master/spec.md`

**Status**: ✅ IMPLEMENTED

## Summary

Migrated the Equipment tab's HTML table to AG Grid Enterprise, following the Subscriptions tab patterns. Equipment uses additive view groups (Summary, Spec, Performance, History, Full) where multiple views can be enabled simultaneously via toggle chips. The implementation uses AG Grid's column visibility API (`setColumnsVisible`) to dynamically show/hide column groups based on user preferences.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Python 3.11
**Primary Dependencies**: AG Grid Enterprise v35, FastAPI, react-router-dom
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: Manual testing (per constitution - pragmatic testing for CRUD/UI)
**Target Platform**: Web browser
**Project Type**: Web application (frontend/backend separation)
**Performance Goals**: 1000+ equipment rows with smooth scrolling
**Constraints**: No new npm dependencies beyond existing AG Grid packages
**Scale/Scope**: Single internal network application

## Constitution Check

*GATE: ✅ PASSED*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. Simplicity First** | ✅ | Reuses existing AG Grid patterns from Subscriptions; no new abstractions |
| **II. Web Application Structure** | ✅ | Maintains frontend/backend separation; no backend changes required |
| **III. Data Integrity** | ✅ | No data model changes; display-only migration |
| **IV. Pragmatic Testing** | ✅ | Manual testing for UI; no automated tests required per constitution |
| **V. Incremental Delivery** | ✅ | Self-contained frontend change; independently deployable |

## Project Structure

### Documentation (this feature)

```text
specs/master/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Component architecture
└── quickstart.md        # Usage guide
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── EquipmentList.tsx        # AG Grid table component (MODIFIED)
│   │   ├── ViewGroupToggle.tsx      # View toggle chips (existing)
│   │   └── grid/
│   │       ├── StatusCellRenderer.tsx    # Status badge renderer (NEW)
│   │       └── MarkdownCellRenderer.tsx  # Notes markdown renderer (NEW)
│   ├── config/
│   │   ├── columns.ts               # Legacy column definitions (deprecated)
│   │   └── equipmentGridColumns.ts  # AG Grid column definitions (NEW)
│   ├── hooks/
│   │   ├── useViewPreferences.ts    # View persistence hook (existing)
│   │   └── useColumnWidths.ts       # Column width hook (REMOVED - now AG Grid managed)
│   ├── pages/
│   │   └── InventoryPage.tsx        # Page component (MODIFIED)
│   └── types/
│       └── viewGroups.ts            # View type definitions (existing)
```

**Structure Decision**: Web application with frontend/backend separation. All changes confined to frontend layer.

## Implementation Summary

### Components Created

1. **`EquipmentList.tsx`** (197 lines)
   - AG Grid Enterprise integration
   - Additive view group column visibility via `useEffect` + `setColumnsVisible`
   - Row selection with single click
   - Filter change notification to parent
   - Imperative handle for external filter reset

2. **`equipmentGridColumns.ts`** (179 lines)
   - Column definitions grouped by view (BASE, SUMMARY, SPEC, PERFORMANCE, HISTORY, STATUS)
   - Value formatters for dates, currency, numbers
   - `VIEW_GROUP_COL_IDS` mapping for visibility toggling
   - `getInitialColumnDefs()` for initial visibility state

3. **`grid/StatusCellRenderer.tsx`** (30 lines)
   - Status badge with color-coded CSS classes

4. **`grid/MarkdownCellRenderer.tsx`** (28 lines)
   - ReactMarkdown rendering for notes field
   - Secure link handling (noopener/noreferrer)

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Column visibility API vs key remount | Views are additive (multi-select), not exclusive like Subscriptions |
| Centralized column definitions | Single source of truth in `equipmentGridColumns.ts` |
| Custom cell renderers as components | Reusable, testable, follows React patterns |
| Dynamic minWidth calculation | Ensures horizontal scroll when many views enabled |
| No floating filters | Uses column menu filters for cleaner UI |

### Removed Files/Features

- Custom column resize handlers (now AG Grid built-in)
- `useColumnWidths.ts` hook (column widths managed by AG Grid)
- Legacy HTML table code in EquipmentList

## Complexity Tracking

No constitution violations to justify.
