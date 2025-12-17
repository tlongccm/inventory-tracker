# Implementation Plan: Configurable List Views and Universal Search

**Branch**: `002-list-views-search` | **Date**: 2025-12-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-list-views-search/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add configurable column group toggles (Summary, Machine Spec, Machine Performance, Assignment) to the equipment inventory list, implement universal search with regex support across all fields, enhance sortable column indicators, and ensure assignment history includes current assignment. The frontend already has most UI components implemented; this plan documents the existing implementation and identifies remaining work.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic (backend); React 18, Vite, react-router-dom (frontend)
**Storage**: SQLite (development), MySQL 8.0+ (production via DATABASE_URL)
**Testing**: pytest (backend), manual testing (frontend per constitution)
**Target Platform**: Web browser, internal network deployment
**Project Type**: Web application (frontend/backend separation)
**Performance Goals**: Search results <500ms, view toggle <1s (per spec SC-001, SC-002)
**Constraints**: No authentication, soft delete pattern, last-write-wins concurrency
**Scale/Scope**: Internal inventory tool, ~1000s of equipment records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Feature uses existing patterns (localStorage for preferences, client-side filtering). No new dependencies. View toggles are simple boolean flags. |
| II. Web Application Structure | ✅ PASS | Follows existing frontend/backend separation. No API changes needed - all new functionality is frontend-only (client-side search, view preferences). |
| III. Data Integrity | ✅ PASS | No data mutations involved. Read-only UI enhancements for filtering and display preferences. |
| IV. Pragmatic Testing | ✅ PASS | Manual testing acceptable for UI (per constitution). Feature is primarily UI/UX enhancement. |
| V. Incremental Delivery | ✅ PASS | Each view group and search feature can be tested independently. Components are already implemented and working. |

**Gate Status**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-list-views-search/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── computers.py       # Equipment REST endpoints
│   ├── models/
│   │   ├── equipment.py       # Equipment model with PassMark fields
│   │   └── assignment_history.py
│   ├── schemas/
│   │   └── equipment.py       # Pydantic schemas for API
│   ├── services/
│   │   ├── equipment_service.py  # Business logic
│   │   └── csv_service.py        # CSV import/export
│   ├── database.py
│   └── main.py
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── EquipmentList.tsx      # Main table with resizable/sortable columns
│   │   ├── SearchBox.tsx          # Universal search with regex toggle
│   │   ├── ViewGroupToggle.tsx    # View group toggle buttons
│   │   ├── FilterBar.tsx          # Equipment filters
│   │   ├── EquipmentDetail.tsx    # Detail modal
│   │   ├── EquipmentForm.tsx      # Create/edit form
│   │   ├── ReassignmentModal.tsx  # Reassignment form
│   │   ├── ImportModal.tsx        # CSV import
│   │   ├── AssignmentHistory.tsx  # Assignment history viewer
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useViewPreferences.ts  # localStorage persistence for view toggles
│   │   └── useColumnWidths.ts     # localStorage persistence for column widths
│   ├── pages/
│   │   ├── InventoryPage.tsx      # Main inventory view (state hub)
│   │   └── AdminPage.tsx          # Deleted equipment management
│   ├── services/
│   │   └── api.ts                 # API client
│   ├── types/
│   │   ├── equipment.ts           # Equipment types and enums
│   │   └── viewGroups.ts          # View preferences types
│   ├── utils/
│   │   ├── columns.ts             # Column definitions and visibility
│   │   └── search.ts              # Search/filter utilities
│   └── App.tsx
└── tests/
```

**Structure Decision**: Web application with frontend/backend separation. All new functionality for this feature is frontend-only - no backend changes required. The existing backend API already returns all fields needed for view groups.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - implementation follows existing patterns with minimal complexity.

## Implementation Status

Based on codebase review, the following components are **already implemented**:

### ✅ Completed

| Requirement | Implementation | Location |
|-------------|---------------|----------|
| FR-001: Always-visible fields | Implemented in column definitions | `frontend/src/utils/columns.ts` |
| FR-002: Status last column | Column ordering with Status always last | `frontend/src/utils/columns.ts` |
| FR-003: Summary view group | Toggle button and column visibility | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-004: Machine Spec view group | Toggle button and column visibility | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-005: Machine Performance view group | Toggle button and column visibility | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-006: Assignment view group | Toggle button and column visibility | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-007: Toggle buttons above table | ViewGroupToggle component | `frontend/src/pages/InventoryPage.tsx` |
| FR-008: Multiple view groups simultaneously | Boolean preferences per group | `frontend/src/hooks/useViewPreferences.ts` |
| FR-008a: Always visible toggles | Rendered in main layout | `frontend/src/pages/InventoryPage.tsx` |
| FR-008b: Persist preferences | localStorage with custom hook | `frontend/src/hooks/useViewPreferences.ts` |
| FR-009: Universal search box | SearchBox component | `frontend/src/components/SearchBox.tsx` |
| FR-010: Real-time filtering with debounce | 300ms debounce implemented | `frontend/src/components/SearchBox.tsx` |
| FR-011: Search hidden fields | Client-side search across all fields | `frontend/src/utils/search.ts` |
| FR-012: Regex toggle | Toggle button with .* indicator | `frontend/src/components/SearchBox.tsx` |
| FR-013: Invalid regex error feedback | Error message display | `frontend/src/components/SearchBox.tsx` |
| FR-014: Literal characters when regex off | escapeRegex utility | `frontend/src/utils/search.ts` |
| FR-015: Sortable column indicators | Sort icons (▲ ▼ ⇅) in headers | `frontend/src/components/EquipmentList.tsx` |
| FR-016: Directional sort indicators | Ascending/descending arrows | `frontend/src/components/EquipmentList.tsx` |
| FR-017: Cursor change on hover | CSS cursor: pointer for sortable | `frontend/src/components/EquipmentList.tsx` |

### ⚠️ Needs Verification

| Requirement | Expected Behavior | Verification Method |
|-------------|------------------|---------------------|
| FR-018: Current assignment in history | Current assignment shown as first record | Manual test: view history for assigned equipment |
| FR-019: At least one record for assigned equipment | History shows current even if no changes | Manual test: view history for newly assigned equipment |
| FR-020: Current assignment indicator | Visual distinction for current record | Manual test: check history UI for "current" marker |

### Layout Changes Applied

- **Left-aligned layout**: Changed from centered to left-aligned per clarification (prevents unnatural rightward expansion)
