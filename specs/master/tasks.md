# Tasks: Migrate Equipment Table to AG Grid

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Manual testing per constitution (Pragmatic Testing principle). No automated tests required.

**Organization**: This is a single-feature migration with one primary user story. Tasks are sequenced for incremental delivery.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for all changes (backend unchanged)

---

## Phase 1: Setup (Column Definitions)

**Purpose**: Create AG Grid column definitions before modifying components

- [X] T001 Create AG Grid column definitions file at `frontend/src/config/equipmentGridColumns.ts` with all base, summary, spec, performance, and history columns per data-model.md
- [X] T002 Add VIEW_GROUP_COL_IDS mapping for column visibility toggling in `frontend/src/config/equipmentGridColumns.ts`

**Checkpoint**: Column definitions ready for EquipmentList rewrite

---

## Phase 2: Cell Renderers

**Purpose**: Create/reuse cell renderers needed for AG Grid columns

- [X] T003 [P] Extract StatusCellRenderer from SubscriptionList.tsx to shared location at `frontend/src/components/grid/StatusCellRenderer.tsx`
- [X] T004 [P] Create MarkdownCellRenderer for notes column at `frontend/src/components/grid/MarkdownCellRenderer.tsx`
- [X] T005 [P] Create value formatters (DateFormatter, CurrencyFormatter, NumberFormatter) at `frontend/src/config/equipmentGridColumns.ts`

**Checkpoint**: All cell renderers available for grid configuration

---

## Phase 3: EquipmentList Rewrite (Core Migration)

**Purpose**: Replace HTML table with AG Grid in EquipmentList component

**Goal**: Equipment table renders with AG Grid, base columns visible, row selection works

**Independent Test**: Load Equipment tab, verify grid renders with equipment data, click row to select

- [X] T006 Create EquipmentListHandle interface with resetFiltersAndSort() and hasActiveFilters() methods in `frontend/src/components/EquipmentList.tsx`
- [X] T007 Rewrite EquipmentList.tsx to use AgGridReact with forwardRef pattern, replacing HTML table implementation
- [X] T008 Add column visibility useEffect that calls gridApi.setColumnsVisible() when viewPreferences change
- [X] T009 Configure AG Grid with status bar, row selection, column menu filtering per data-model.md grid configuration

**Checkpoint**: Equipment grid renders with data, base columns visible, row click works

---

## Phase 4: View Group Integration

**Purpose**: Connect view toggle buttons to AG Grid column visibility

**Goal**: View group toggles (Summary, Spec, Performance, History, Full) show/hide correct columns

**Independent Test**: Click each view toggle, verify correct columns appear/disappear

- [X] T010 Pass viewPreferences prop from InventoryPage to EquipmentList in `frontend/src/pages/InventoryPage.tsx`
- [X] T011 Implement Full meta-toggle logic in column visibility useEffect at `frontend/src/components/EquipmentList.tsx`
- [X] T012 Verify column order: base columns first, view group columns in order, status column last

**Checkpoint**: All view group toggles work correctly with multi-select behavior

---

## Phase 5: InventoryPage Integration

**Purpose**: Update InventoryPage to work with new AG Grid EquipmentList

**Goal**: Reset button works, column width hooks removed, all existing functionality preserved

**Independent Test**: Use reset button, verify filters clear; verify search still works

- [X] T013 Add EquipmentListHandle ref to InventoryPage at `frontend/src/pages/InventoryPage.tsx`
- [X] T014 Connect Reset button to equipmentListRef.resetFiltersAndSort() in `frontend/src/pages/InventoryPage.tsx`
- [X] T015 Remove useColumnWidths hook usage from InventoryPage at `frontend/src/pages/InventoryPage.tsx`
- [X] T016 Remove custom column resize handlers and related props from EquipmentList usage

**Checkpoint**: InventoryPage works with new grid, reset button functional

---

## Phase 6: Cleanup

**Purpose**: Remove unused code and verify final implementation

- [X] T017 [P] Delete or deprecate `frontend/src/hooks/useColumnWidths.ts` if unused elsewhere
- [X] T018 [P] Remove old HTML table CSS styles specific to EquipmentList if no longer needed
- [ ] T019 Run manual verification checklist from quickstart.md

**Checkpoint**: Migration complete, no unused code remaining

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start here
- **Phase 2 (Cell Renderers)**: No dependencies on Phase 1 - can run in parallel
- **Phase 3 (EquipmentList Rewrite)**: Depends on Phase 1 and Phase 2 completion
- **Phase 4 (View Group Integration)**: Depends on Phase 3 completion
- **Phase 5 (InventoryPage Integration)**: Depends on Phase 4 completion
- **Phase 6 (Cleanup)**: Depends on Phase 5 completion

### Task-Level Dependencies

```
T001 ──┬──► T006 ──► T007 ──► T008 ──► T009 ──► T010 ──► T011 ──► T012
T002 ──┘                                        │
                                                ▼
T003 ──┐                                       T013 ──► T014 ──► T015 ──► T016
T004 ──┼──► T007                                                          │
T005 ──┘                                                                  ▼
                                                                   T017, T018 ──► T019
```

### Parallel Opportunities

**Phase 1-2 Parallel Execution**:
```
# Run these in parallel:
Task: "T001 Create AG Grid column definitions..."
Task: "T003 Extract StatusCellRenderer..."
Task: "T004 Create MarkdownCellRenderer..."
Task: "T005 Create value formatters..."

# Then run T002 after T001 completes
```

**Phase 6 Parallel Execution**:
```
# Run these in parallel:
Task: "T017 Delete useColumnWidths.ts..."
Task: "T018 Remove old table CSS..."
```

---

## Implementation Strategy

### Incremental Delivery

1. **Complete Phase 1-2**: Column definitions and renderers ready
2. **Complete Phase 3**: Grid renders - can demo basic functionality
3. **Complete Phase 4**: View toggles work - feature parity checkpoint
4. **Complete Phase 5**: Full integration - production ready
5. **Complete Phase 6**: Cleanup - final polish

### Verification Points

After each phase, verify:
- No TypeScript compilation errors
- No console errors in browser
- Expected functionality works

### Rollback Strategy

If issues discovered:
- Phase 3-4: Revert EquipmentList.tsx to HTML table version
- Phase 5-6: Restore InventoryPage to use old props

---

## Manual Verification Checklist (from quickstart.md)

Run after T019:

- [ ] AG Grid renders with equipment data
- [ ] Base columns always visible
- [ ] View toggles show/hide correct column groups
- [ ] Multiple views can be active simultaneously
- [ ] Row click selects item and opens detail panel
- [ ] Column menu filtering works
- [ ] Status bar shows row count
- [ ] Search box filters data correctly
- [ ] URL query params sync (sort, filters)
- [ ] No console errors

---

## Notes

- [P] tasks = different files, no dependencies, can run simultaneously
- AG Grid Enterprise already installed - no npm install needed
- Follow SubscriptionList.tsx patterns for consistency
- Constitution: Simplicity First - remove unused code promptly
- Manual testing acceptable per Pragmatic Testing principle
