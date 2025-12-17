# Tasks: Configurable List Views and Universal Search

**Input**: Design documents from `/specs/002-list-views-search/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/
**Status**: ✅ Implementation Complete - Verification Tasks Remaining

**Tests**: Manual testing per constitution (Pragmatic Testing principle). No automated test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

> **Note**: Based on codebase review (2025-12-16), most implementation tasks are complete. Remaining work is verification and manual testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`
- This feature is primarily frontend-focused with minimal backend changes

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and type definitions shared across user stories

- [X] T001 [P] Create view group type definitions in frontend/src/types/viewGroups.ts
- [X] T002 [P] Create column configuration constants in frontend/src/config/columns.ts
- [X] T003 [P] Create search utility functions in frontend/src/utils/search.ts
- [X] T004 Create useViewPreferences hook in frontend/src/hooks/useViewPreferences.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Extend EquipmentListItem type with all view group fields in frontend/src/types/equipment.ts
- [X] T006 Create getVisibleColumns utility function in frontend/src/utils/columns.ts (ensures Status always last)
- [X] T007 Add CSS styles for view group toggles, sort indicators, and search box in frontend/src/index.css
- [X] T007a Change container layout from centered to left-aligned in frontend/src/index.css

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Toggle Column Group Views (Priority: P1)

**Goal**: Users can toggle view groups (Summary, Machine Spec, Performance, Assignment) on/off via buttons above the table. Always-visible columns remain constant. Status column always last.

**Independent Test**: Toggle each view group button and verify correct columns appear/disappear while Equipment ID, Sub Type, User, Name, Status remain visible with Status last.

### Implementation for User Story 1

- [X] T008 [US1] Create ViewGroupToggle component in frontend/src/components/ViewGroupToggle.tsx
- [X] T009 [US1] Refactor EquipmentList to accept visibleColumns prop in frontend/src/components/EquipmentList.tsx
- [X] T010 [US1] Update EquipmentList to render dynamic columns based on visibleColumns in frontend/src/components/EquipmentList.tsx
- [X] T011 [US1] Integrate ViewGroupToggle and useViewPreferences in frontend/src/pages/InventoryPage.tsx
- [X] T012 [US1] Wire column visibility to EquipmentList via getVisibleColumns in frontend/src/pages/InventoryPage.tsx
- [ ] T013 [US1] Verify localStorage persistence by closing/reopening browser

**Checkpoint**: User Story 1 complete - view group toggles functional with localStorage persistence

---

## Phase 4: User Story 2 - Universal Search Across All Fields (Priority: P1)

**Goal**: Single search box filters equipment list across all fields in real-time with 300ms debounce.

**Independent Test**: Type search terms and verify matching records returned based on any field match, including hidden fields.

### Implementation for User Story 2

- [X] T014 [US2] Create SearchBox component with debounced input in frontend/src/components/SearchBox.tsx
- [X] T015 [US2] Implement filterEquipment function using escapeRegex in frontend/src/utils/search.ts
- [X] T016 [US2] Add search state management (term, filtered results) to frontend/src/pages/InventoryPage.tsx
- [X] T017 [US2] Integrate SearchBox and apply filter before rendering EquipmentList in frontend/src/pages/InventoryPage.tsx
- [X] T018 [US2] Add "No results found" message when search matches nothing in frontend/src/components/EquipmentList.tsx

**Checkpoint**: User Story 2 complete - universal search functional with real-time filtering

---

## Phase 5: User Story 3 - Regex Search Mode (Priority: P2)

**Goal**: Toggle for regex mode with visual indicator, error handling for invalid patterns.

**Independent Test**: Enable regex toggle, search with patterns like `PC-00[0-9]{2}`, verify matches. Enter invalid regex, verify error message.

### Implementation for User Story 3

- [X] T019 [US3] Add regex toggle button to SearchBox component in frontend/src/components/SearchBox.tsx
- [X] T020 [US3] Add isRegex state and visual indicator (active style) in frontend/src/components/SearchBox.tsx
- [X] T021 [US3] Implement validateRegex function in frontend/src/utils/search.ts
- [X] T022 [US3] Update filterEquipment to handle regex mode in frontend/src/utils/search.ts
- [X] T023 [US3] Add error state and inline error message display in frontend/src/components/SearchBox.tsx
- [X] T024 [US3] Pass isRegex to InventoryPage and update filter logic in frontend/src/pages/InventoryPage.tsx

**Checkpoint**: User Story 3 complete - regex search with error handling functional

---

## Phase 6: User Story 4 - Visual Sortable Column Indicators (Priority: P2)

**Goal**: Sortable columns show visual indicator (⇅), active sort shows direction (▲/▼), hover shows pointer cursor.

**Independent Test**: View column headers, identify sortable columns by icon. Click to sort, verify direction indicator changes.

### Implementation for User Story 4

- [X] T025 [US4] Enhance SortHeader component with sortable prop and default indicator (⇅) in frontend/src/components/EquipmentList.tsx
- [X] T026 [US4] Add CSS class .sortable with hover background and cursor pointer in frontend/src/index.css
- [X] T027 [US4] Update column definitions with sortable: boolean flag in frontend/src/config/columns.ts
- [X] T028 [US4] Pass sortable flag from column config to SortHeader in frontend/src/components/EquipmentList.tsx

**Checkpoint**: User Story 4 complete - sortable columns visually distinguishable

---

## Phase 7: User Story 5 - Assignment History Includes Current Assignment (Priority: P2)

**Goal**: Assignment history view shows current assignment as first record with "Current" badge.

**Independent Test**: View assignment history for equipment with current assignment, verify current assignment appears first with badge.

### Implementation for User Story 5

- [X] T029 [US5] Create buildAssignmentHistory utility in frontend/src/utils/assignmentHistory.ts
- [X] T030 [US5] Update AssignmentHistoryRecord type with isCurrent flag in frontend/src/utils/assignmentHistory.ts
- [X] T031 [US5] Modify AssignmentHistory component to use buildAssignmentHistory in frontend/src/components/AssignmentHistory.tsx
- [X] T032 [US5] Add "Current" badge styling for current assignment record in frontend/src/components/AssignmentHistory.tsx
- [X] T033 [US5] Handle "No assignments" case when equipment never assigned in frontend/src/components/AssignmentHistory.tsx

**Checkpoint**: User Story 5 complete - assignment history includes current assignment with badge

---

## Phase 8: User Story 6 - Machine Specification View Group (Priority: P3)

**Goal**: Machine Spec view group shows CPU, RAM, Storage, OS, Serial Number, MAC Address.

**Independent Test**: Enable Machine Spec toggle, verify spec columns appear. Disable, verify hidden.

### Implementation for User Story 6

- [X] T034 [US6] Add machineSpec column definitions to VIEW_GROUP_COLUMNS in frontend/src/config/columns.ts
- [X] T035 [US6] Verify ViewGroupToggle includes "Machine Specs" button (should be present from US1)
- [ ] T036 [US6] Manual test: toggle Machine Spec view and verify columns appear/hide correctly

**Checkpoint**: User Story 6 complete - Machine Spec view group functional

---

## Phase 9: User Story 7 - Machine Performance View Group (Priority: P3)

**Goal**: Performance view group shows PassMark CPU Score, RAM Score, Disk Score, Overall Rating.

**Independent Test**: Enable Performance toggle, verify PassMark score columns appear. Disable, verify hidden.

### Implementation for User Story 7

- [X] T037 [US7] Add machinePerformance column definitions to VIEW_GROUP_COLUMNS in frontend/src/config/columns.ts
- [X] T038 [US7] Verify ViewGroupToggle includes "Performance" button (should be present from US1)
- [ ] T039 [US7] Manual test: toggle Performance view and verify PassMark columns appear/hide correctly

**Checkpoint**: User Story 7 complete - Machine Performance view group functional

---

## Phase 10: User Story 8 - Assignment View Group (Priority: P3)

**Goal**: Assignment view group shows assignment date, usage type, IP address.

**Independent Test**: Enable Assignment toggle, verify assignment columns appear. Disable, verify hidden.

### Implementation for User Story 8

- [X] T040 [US8] Add assignment column definitions to VIEW_GROUP_COLUMNS in frontend/src/config/columns.ts
- [X] T041 [US8] Verify ViewGroupToggle includes "Assignment" button (should be present from US1)
- [ ] T042 [US8] Manual test: toggle Assignment view and verify columns appear/hide correctly

**Checkpoint**: User Story 8 complete - Assignment view group functional

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [ ] T043 [P] Verify all view groups enabled simultaneously - confirm Status column last (SC-008)
- [ ] T044 [P] Verify search + sort combination works correctly
- [ ] T045 [P] Verify localStorage edge cases (corrupted data, unavailable storage gracefully handled)
- [ ] T046 Run full manual test per quickstart.md testing checklist
- [X] T047 Code cleanup: remove unused imports, consolidate styles

---

## Remaining Tasks Summary

**Total Remaining Tasks**: 10 verification tasks

| Task ID | User Story | Description |
|---------|------------|-------------|
| T013 | US1 | Verify localStorage persistence |
| T036 | US6 | Manual test Machine Spec view |
| T039 | US7 | Manual test Performance view |
| T042 | US8 | Manual test Assignment view |
| T043 | Polish | Verify all groups + Status last |
| T044 | Polish | Verify search + sort |
| T045 | Polish | Verify localStorage edge cases |
| T046 | Polish | Run quickstart.md checklist |

**Assignment History Verification (FR-018, FR-019, FR-020)**:
The plan.md indicates these requirements need verification:
- Current assignment shown as first record
- History displays at least one record for assigned equipment
- Current assignment has visual indicator ("Current" badge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but can run in parallel
  - US3 depends on US2 (extends search functionality)
  - US4 can run in parallel with US2/US3
  - US5 is independent of other stories
  - US6, US7, US8 depend on US1 (use view group infrastructure) but are simple additions
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Notes |
|-------|----------|------------|-------|
| US1 | P1 | Foundational | Core view group toggle infrastructure |
| US2 | P1 | Foundational | Core search infrastructure |
| US3 | P2 | US2 | Extends search with regex |
| US4 | P2 | Foundational | Independent - sort indicators |
| US5 | P2 | Foundational | Independent - assignment history |
| US6 | P3 | US1 | Uses view group infrastructure |
| US7 | P3 | US1 | Uses view group infrastructure |
| US8 | P3 | US1 | Uses view group infrastructure |

### Parallel Opportunities

- **Setup Phase**: T001, T002, T003 can run in parallel (T004 depends on types)
- **Foundational Phase**: T005, T006, T007 can run in parallel
- **User Stories**: US1 and US2 can run in parallel; US4 and US5 can run in parallel
- **Polish Phase**: T043, T044, T045 can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch all independent setup tasks together:
Task: "Create view group type definitions in frontend/src/types/viewGroups.ts"
Task: "Create column configuration constants in frontend/src/config/columns.ts"
Task: "Create search utility functions in frontend/src/utils/search.ts"
# Then: "Create useViewPreferences hook in frontend/src/hooks/useViewPreferences.ts" (needs types)
```

## Parallel Example: User Stories 1 & 2

```bash
# After Foundational complete, launch P1 stories in parallel:
# Developer A - User Story 1:
Task: "Create ViewGroupToggle component in frontend/src/components/ViewGroupToggle.tsx"

# Developer B - User Story 2:
Task: "Create SearchBox component with debounced input in frontend/src/components/SearchBox.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Group Toggles)
4. Complete Phase 4: User Story 2 (Universal Search)
5. **STOP and VALIDATE**: Both P1 stories functional - deploy/demo as MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (View Groups) → Test independently → Deploy/Demo
3. Add US2 (Search) → Test independently → Deploy/Demo (MVP Complete!)
4. Add US3 (Regex) → Test independently → Deploy/Demo
5. Add US4 (Sort Indicators) + US5 (Assignment History) → Test → Deploy/Demo
6. Add US6, US7, US8 (P3 view groups) → Final release

### Suggested MVP Scope

**MVP = User Stories 1 + 2** (both P1 priority)
- View group toggles with localStorage persistence
- Universal search across all fields
- This delivers core value: customizable views + fast equipment lookup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable per quickstart.md checklist
- Constitution allows manual testing for UI components
- Commit after each task or logical group
- US6, US7, US8 are primarily configuration tasks once US1 infrastructure exists
