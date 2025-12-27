# Tasks: AG Grid Row Grouping & Status Bar

**Input**: Design documents from `/specs/012-ai-tool-pivot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Manual testing per constitution (Pragmatic Testing principle) - no automated tests required.

**Organization**: Tasks are grouped by feature to enable independent implementation and testing.

## Format: `[ID] [Feature] [FR-XXX] Description`

- **[Feature]**: Which feature this task belongs to (F1 = Row Grouping, F2 = Status Bar)
- **[FR-XXX]**: Which functional requirement(s) from spec.md this task satisfies
- **[P]**: (Optional) Can run in parallel with other [P] tasks
- Include exact file paths in descriptions

## User Story to Feature Mapping

| User Story (spec.md) | Feature (tasks.md) | Coverage |
|---------------------|-------------------|----------|
| US1 - View AI Tools Grouped Table (P1) | F1 - Row Grouping | T001-T008 |
| US2 - Maintain Interactivity (P2) | F1 - Row Grouping | T009, T016 |
| US3 - Monthly Cost Calculation (P3) | F1 - Row Grouping | T010 |
| US4 - Cell Selection Statistics (P4) | F2 - Status Bar | T011-T015, T017 |
| Data Filtering (FR-014, FR-015) | F3 - Data Filtering | T020-T021 |
| Horizontal Scrollbar Fix | F4 - Scrollbar Fix | T022 |

## Path Conventions

- **Web app**: `frontend/src/` for React components
- Main file to modify: `frontend/src/components/SubscriptionList.tsx`

---

## Phase 1: Feature 1 - Row Grouping for AI Tools View

**Goal**: Replace column-switching with AG Grid row grouping. When "AI Tools" is clicked, rows are grouped by `access_level_required` with collapsible groups showing aggregated cost totals.

**Independent Test**: Click "AI Tools" button, verify:
1. Rows are grouped by Access Level Required
2. Group headers show item count (e.g., "Basic (5)")
3. Group headers show aggregated Monthly Cost and Annual Cost totals
4. Groups are expanded by default
5. Clicking group row expands/collapses (does NOT open modal)
6. Clicking data row opens subscription detail modal
7. Click "AI Tools" again to return to default flat view

### Implementation for Feature 1

- [x] T001 [F1] [FR-002] Update AI_TOOLS_COLUMNS to add `rowGroup: true` and `hide: true` on `access_level_required` field in `frontend/src/components/SubscriptionList.tsx`
- [x] T002 [F1] [FR-002] Add `enableRowGroup: true` to `access_level_required` column definition in `frontend/src/components/SubscriptionList.tsx`
- [x] T003 [F1] [FR-010] Add `aggFunc: 'sum'` to monthly_cost column in AI_TOOLS_COLUMNS in `frontend/src/components/SubscriptionList.tsx`
- [x] T004 [F1] [FR-010] Add `aggFunc: 'sum'` to annual_cost column in AI_TOOLS_COLUMNS in `frontend/src/components/SubscriptionList.tsx`
- [x] T005 [F1] [FR-002,FR-010] Create autoGroupColumnDef configuration with headerName 'Access Level', minWidth 200, and suppressCount: false in `frontend/src/components/SubscriptionList.tsx`
- [x] T006 [F1] [FR-001,FR-002] Add autoGroupColumnDef prop to AgGridReact component (conditional on viewMode === 'ai_tools') in `frontend/src/components/SubscriptionList.tsx`
- [x] T007 [F1] [FR-011] Add groupDefaultExpanded={-1} prop to AgGridReact component (conditional on viewMode === 'ai_tools') in `frontend/src/components/SubscriptionList.tsx`
- [x] T008 [F1] [FR-002] Add suppressAggFuncInHeader={true} prop to AgGridReact component in `frontend/src/components/SubscriptionList.tsx`
- [x] T009 [F1] [FR-004] Update onRowClicked handler to guard against group rows (check if event.data exists before calling onSelect) in `frontend/src/components/SubscriptionList.tsx`
- [x] T010 [F1] [FR-007] Update valueGetter for monthly_cost to handle undefined params.data (group rows) in `frontend/src/components/SubscriptionList.tsx`

**Checkpoint**: Feature 1 complete - AI Tools view shows grouped rows with collapsible groups and aggregated totals

---

## Phase 2: Feature 2 - Status Bar with Cell Selection Statistics

**Goal**: Enable Status Bar at bottom of grid showing count, sum, and average when users select cells. Works in both default and AI Tools views.

**Independent Test**:
1. Verify status bar visible at bottom of grid
2. Total row count shows on left side
3. Select cells by clicking and dragging
4. Verify "Count: X" appears when cells selected
5. Select cost cells (Monthly Cost, Annual Cost)
6. Verify "Sum: $X" and "Avg: $X" appear
7. Statistics update in real-time as selection changes
8. Works in both default table view and AI Tools grouped view

### Implementation for Feature 2

- [x] T011 [F2] [FR-013] Add `cellSelection: true` prop to AgGridReact component in `frontend/src/components/SubscriptionList.tsx`
- [x] T012 [F2] [FR-012,FR-013] Create statusBar configuration object with statusPanels array in `frontend/src/components/SubscriptionList.tsx`
- [x] T013 [F2] [FR-012] Add agTotalRowCountComponent to statusPanels with align: 'left' in `frontend/src/components/SubscriptionList.tsx`
- [x] T014 [F2] [FR-013] Add agAggregationComponent to statusPanels with aggFuncs: ['count', 'sum', 'avg'] in `frontend/src/components/SubscriptionList.tsx`
- [x] T015 [F2] [FR-012,FR-013] Add statusBar prop to AgGridReact component in `frontend/src/components/SubscriptionList.tsx`

**Checkpoint**: Feature 2 complete - Status bar shows cell selection statistics

---

## Phase 3: Verification & Polish

**Purpose**: Final validation and cleanup

- [ ] T016 [FR-001,FR-002,FR-003,FR-004,FR-005,FR-010,FR-011] Run quickstart.md verification checklist for Row Grouping (Feature 1)
- [ ] T017 [FR-012,FR-013] Run quickstart.md verification checklist for Status Bar (Feature 2)
- [ ] T018 [FR-003,FR-006,FR-008,FR-009] Verify Reset button clears grid state and toggle behaviors work correctly in `frontend/src/pages/SubscriptionsPage.tsx`
- [x] T019 Build frontend and verify no TypeScript errors with `npm run build` in `frontend/`

---

## Dependencies & Execution Order

### Feature Dependencies

- **Feature 1 (Row Grouping)**: No dependencies on Feature 2 - can implement independently
- **Feature 2 (Status Bar)**: No dependencies on Feature 1 - can implement independently
- Both features modify the same file but different sections (column config vs grid options)

### Within Feature 1

Sequential tasks (each builds on previous):
1. T001-T004: Column configuration updates
2. T005-T008: Grid option additions
3. T009-T010: Event handler and valueGetter guards

### Within Feature 2

Sequential tasks:
1. T011: Enable cell selection
2. T012-T014: Create status bar configuration
3. T015: Add to grid

### Parallel Opportunities

**Features can run in parallel**:
```text
Feature 1 (T001-T010) and Feature 2 (T011-T015) can be implemented independently
```

**Within Feature 1**:
```text
T003 + T004 can run in parallel (different columns, same file section)
```

---

## Implementation Strategy

### MVP First (Feature 1 Only)

1. Complete Phase 1: Feature 1 (T001-T010) - ~30 min
2. **STOP and VALIDATE**: Test row grouping works correctly
3. Deploy/demo if ready - users can see grouped AI Tools view

### Full Implementation

1. Complete Feature 1: Row Grouping (T001-T010)
2. Complete Feature 2: Status Bar (T011-T015)
3. Complete Verification (T016-T019)

### Single Developer Strategy

Complete features sequentially:
1. Feature 1: Row Grouping (~30 min)
2. Feature 2: Status Bar (~15 min)
3. Verification (~10 min)

**Total estimated: ~55 min**

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 22 |
| Feature 1 (Row Grouping) Tasks | 10 |
| Feature 2 (Status Bar) Tasks | 5 |
| Feature 3 (Data Filtering) Tasks | 2 |
| Feature 4 (Scrollbar Fix) Tasks | 1 |
| Verification Tasks | 4 |
| Files Modified | 2 (SubscriptionList.tsx, SubscriptionsPage.tsx) |
| Parallel Opportunities | 2 (F1+F2 parallel, T003+T004 parallel) |

---

## Requirements Traceability Matrix

| Requirement | Description | Task(s) | Status |
|-------------|-------------|---------|--------|
| FR-001 | Replace main table with grouped table when AI Tools clicked | T006, T016 | Implemented |
| FR-002 | Row grouping by Access Level with 6 data columns | T001, T002, T005, T006, T008, T016 | Implemented |
| FR-003 | Toggle returns to default view | T016, T018 | Implemented |
| FR-004 | Row click opens detail modal (data rows only) | T009, T016 | Implemented |
| FR-005 | Column sorting support | T016 | Implemented |
| FR-006 | Preserve search/filter state | T018 | Implemented |
| FR-007 | Monthly Cost calculation | T010 | Implemented |
| FR-008 | Mutually exclusive toggle behavior | T018 | Implemented |
| FR-009 | Visual selected state for active button | T018 | Implemented |
| FR-010 | Group headers show count and aggregated totals | T003, T004, T005, T016 | Implemented |
| FR-011 | Groups expanded by default | T007, T016 | Implemented |
| FR-012 | Status Bar shows total row count | T012, T013, T015, T017 | Implemented |
| FR-013 | Status Bar shows count/sum/avg for selected cells | T011, T012, T014, T015, T017 | Implemented |
| FR-014 | Filter to "AI Tool" category | T020 | Implemented |
| FR-015 | Filter to "Active" status | T021 | Implemented |

**Coverage**: 15/15 requirements (100%)

---

## Notes

- [P] tasks = different files or independent concerns, no dependencies
- [Feature] label maps task to specific feature for traceability
- [FR-XXX] label maps task to functional requirement from spec.md
- Each feature is independently completable and testable
- Constitution: Manual testing acceptable - no automated test tasks required
- Commit after each task or logical group
- Stop at any checkpoint to validate feature independently
- AG Grid Enterprise modules already registered (CellSelectionModule, StatusBarModule included in AllEnterpriseModule)

---

## Phase 4: Feature 3 - Data Filtering for AI Tools View

**Goal**: Filter subscriptions to only show "AI Tool" category AND "Active" status when in AI Tools view.

**Independent Test**: Click "AI Tools" button, verify only subscriptions with category "AI Tool" and status "Active" are shown.

### Implementation for Feature 3

- [x] T020 [F3] [FR-014] Add filter for category_name === 'AI Tool' in filteredSubscriptions useMemo when activeViewMode is 'ai_tools' in `frontend/src/pages/SubscriptionsPage.tsx`
- [x] T021 [F3] [FR-015] Add filter for status === 'Active' in filteredSubscriptions useMemo when activeViewMode is 'ai_tools' in `frontend/src/pages/SubscriptionsPage.tsx`

**Checkpoint**: Feature 3 complete - AI Tools view only shows AI Tool category with Active status

---

## Phase 5: Feature 4 - Horizontal Scrollbar Fix (Default View)

**Goal**: Ensure horizontal scrollbar appears in default view when columns exceed viewport width.

**Independent Test**: In default view, verify horizontal scrollbar is visible at bottom of grid.

### Implementation for Feature 4

- [x] T022 [F4] Wrap AgGridReact in a div with minWidth: 3500px for default view, parent container with overflowX: auto in `frontend/src/components/SubscriptionList.tsx`

**Checkpoint**: Feature 4 complete - Horizontal scrollbar visible in default view
