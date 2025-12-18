# Tasks: Software Inventory Tracking

**Input**: Design documents from `/specs/003-software-tracking/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml

**Tests**: Manual testing per constitution (Pragmatic Testing principle). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source

---

## Phase 1: Setup

**Purpose**: No new setup required - extending existing project

*All infrastructure already exists. Proceed to Foundational phase.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend model, schemas, and service that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create Software SQLAlchemy model in backend/app/models/software.py
- [x] T002 Create Pydantic schemas (SoftwareCreate, SoftwareUpdate, SoftwareResponse, SoftwareListItem) in backend/app/schemas/software.py
- [x] T003 Create SoftwareService with CRUD operations and ID generation in backend/app/services/software_service.py
- [x] T004 Create Software API router with all endpoints in backend/app/api/software.py
- [x] T005 Register software router in backend/app/main.py
- [x] T006 [P] Create TypeScript Software interface and types in frontend/src/types/software.ts
- [x] T007 [P] Add software API methods to frontend/src/services/api.ts

**Checkpoint**: Backend API functional at http://localhost:8000/docs, frontend types ready

---

## Phase 3: User Story 1 - View Software Inventory (Priority: P1) 🎯 MVP

**Goal**: Staff can view list of all software with search functionality

**Independent Test**: Navigate to Software tab, see list with columns, click entry to see details, search works

### Implementation for User Story 1

- [x] T008 [US1] Create SoftwarePage component with state management in frontend/src/pages/SoftwarePage.tsx
- [x] T009 [US1] Create SoftwareList table component with sortable columns in frontend/src/components/SoftwareList.tsx
- [x] T010 [US1] Create SoftwareDetail modal component in frontend/src/components/SoftwareDetail.tsx
- [x] T011 [US1] Add Software route and navigation link in frontend/src/App.tsx
- [x] T012 [US1] Implement universal search in SoftwarePage using existing SearchBox component
- [x] T013 [US1] Add column definitions for software list in frontend/src/utils/softwareColumns.ts

**Checkpoint**: Can navigate to Software tab, see list, click to view details, search works

---

## Phase 4: User Story 2 - Add New Software (Priority: P1)

**Goal**: Staff can add new software entries with all 14 fields

**Independent Test**: Click "Add Software", fill form with all fields, save, see new entry in list with auto-generated ID

### Implementation for User Story 2

- [x] T014 [US2] Create SoftwareForm component with all 14 fields in frontend/src/components/SoftwareForm.tsx
- [x] T015 [US2] Implement dropdown fields with predefined values + "Other" option (Category, Type, Status)
- [x] T016 [US2] Add "Add Software" button and form modal to SoftwarePage
- [x] T017 [US2] Connect form submission to POST /api/v1/software endpoint
- [x] T018 [US2] Add form validation (Name required, date formats, cost as number)

**Checkpoint**: Can add new software, see auto-generated SW-NNNN ID, entry appears in list

---

## Phase 5: User Story 3 - Edit Software (Priority: P1)

**Goal**: Staff can edit existing software entries

**Independent Test**: Click software entry, click Edit, modify fields, save, see updated values

### Implementation for User Story 3

- [x] T019 [US3] Add edit mode to SoftwareForm component (reuse create form)
- [x] T020 [US3] Add Edit button to SoftwareDetail modal
- [x] T021 [US3] Connect form submission to PUT /api/v1/software/{id} endpoint
- [x] T022 [US3] Handle form pre-population with existing software data

**Checkpoint**: Can edit any software entry, changes persist and display correctly

---

## Phase 6: User Story 4 - Delete and Recover Software (Priority: P2)

**Goal**: Staff can delete software; admins can recover deleted entries

**Independent Test**: Delete software (disappears from list), go to Admin page, see deleted software, restore it

### Implementation for User Story 4

- [x] T023 [US4] Add Delete button with confirmation dialog to SoftwareDetail modal
- [x] T024 [US4] Connect delete to DELETE /api/v1/software/{id} endpoint
- [x] T025 [US4] Add deleted software section to AdminPage in frontend/src/pages/AdminPage.tsx
- [x] T026 [US4] Implement restore functionality calling POST /api/v1/software/{id}/restore

**Checkpoint**: Can delete software, view in admin panel, restore to main list

---

## Phase 7: User Story 5 - Filter Software (Priority: P2)

**Goal**: Staff can filter software list by Category, Vendor, Status

**Independent Test**: Select Category filter, list shows only matching entries; combine multiple filters

### Implementation for User Story 5

- [x] T027 [US5] Create SoftwareFilterBar component in frontend/src/components/SoftwareFilterBar.tsx
- [x] T028 [US5] Add filter dropdowns for Category, Vendor, Status, Type
- [x] T029 [US5] Connect filters to API query parameters
- [x] T030 [US5] Integrate SoftwareFilterBar into SoftwarePage

**Checkpoint**: Can filter by any field, filters combine correctly, clear filters works

---

## Phase 8: User Story 6 - Import/Export Software CSV (Priority: P3)

**Goal**: Staff can import software from CSV and export to CSV

**Independent Test**: Export CSV (download file with all fields), import CSV (new entries created)

### Implementation for User Story 6

- [x] T031 [US6] Implement CSV export/import methods in backend/app/services/software_service.py
- [x] T032 [US6] Add Export button to SoftwarePage calling GET /api/v1/software/export
- [x] T033 [US6] Implement CSV download handling in frontend
- [x] T034 [US6] Create SoftwareImportModal component in frontend/src/components/SoftwareImportModal.tsx
- [x] T035 [US6] Implement file upload and POST /api/v1/software/import
- [x] T036 [US6] Display import results (success count, errors)

**Checkpoint**: Can export all software to CSV, import CSV creates new entries with error reporting

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: View groups, preferences persistence, and refinements

- [x] T037 [P] Implement view group toggles (License View, Purchase View, Details View) in frontend/src/components/SoftwareViewGroupToggle.tsx
- [x] T038 [P] Create useViewPreferences hook for software in frontend/src/hooks/useSoftwareViewPreferences.ts
- [x] T039 [P] Add column width persistence for software list
- [x] T040 Integrate view groups into SoftwarePage
- [x] T041 Add sortable column indicators to SoftwareList
- [ ] T042 Manual testing per quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped - project exists
- **Foundational (Phase 2)**: No dependencies - start immediately - **BLOCKS all user stories**
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Polish (Phase 9)**: Depends on US1 (View) completion minimum

### User Story Dependencies

- **User Story 1 (View)**: Depends only on Foundational - can start immediately after Phase 2
- **User Story 2 (Add)**: Depends on US1 (needs list to verify new entry)
- **User Story 3 (Edit)**: Depends on US2 (reuses form component)
- **User Story 4 (Delete)**: Depends on US1 (needs detail modal)
- **User Story 5 (Filter)**: Depends on US1 (needs list to filter)
- **User Story 6 (Import/Export)**: Depends only on Foundational (independent of CRUD UI)

### Parallel Opportunities

**Within Foundational (Phase 2):**
```
Parallel group 1: T001, T002, T003 (backend core - must be sequential)
Parallel group 2: T006, T007 (frontend - can run parallel to backend after T004)
```

**After Foundational:**
```
US1 (View) and US6 (Import/Export) can run in parallel
US4 (Delete) and US5 (Filter) can run in parallel after US1
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 2: Foundational (T001-T007)
2. Complete Phase 3: User Story 1 - View (T008-T013)
3. Complete Phase 4: User Story 2 - Add (T014-T018)
4. Complete Phase 5: User Story 3 - Edit (T019-T022)
5. **STOP and VALIDATE**: Full CRUD working, test manually
6. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

1. Foundational → Backend API complete
2. US1 (View) → Can see software list and details
3. US2 (Add) → Can create new entries
4. US3 (Edit) → Can modify entries
5. US4 (Delete/Recover) → Full lifecycle management
6. US5 (Filter) → Better navigation for large lists
7. US6 (Import/Export) → Bulk operations
8. Polish → View groups and refinements

---

## Summary

| Phase | Tasks | User Story | Priority |
|-------|-------|------------|----------|
| Foundational | T001-T007 (7) | - | Required |
| US1 View | T008-T013 (6) | View Software Inventory | P1 |
| US2 Add | T014-T018 (5) | Add New Software | P1 |
| US3 Edit | T019-T022 (4) | Edit Software | P1 |
| US4 Delete | T023-T026 (4) | Delete and Recover | P2 |
| US5 Filter | T027-T030 (4) | Filter Software | P2 |
| US6 Import/Export | T031-T036 (6) | Import/Export CSV | P3 |
| Polish | T037-T042 (6) | Cross-cutting | - |

**Total Tasks**: 42
**MVP Scope**: T001-T022 (22 tasks) - Foundational + US1 + US2 + US3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing acceptable per constitution (Pragmatic Testing principle)
