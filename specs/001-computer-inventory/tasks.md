# Tasks: Equipment Inventory Tracker

**Input**: Design documents from `/specs/001-computer-inventory/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are OPTIONAL per constitution (Principle IV). Not included unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project structure: `backend/app/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/api/`, `backend/app/services/`
- [x] T002 Create `backend/requirements.txt` with dependencies: fastapi, uvicorn, sqlalchemy, alembic, pymysql, python-multipart
- [x] T003 [P] Create frontend project with Create React App + TypeScript in `frontend/`
- [x] T004 [P] Create `backend/app/__init__.py` (empty package marker)
- [x] T005 [P] Create `frontend/src/types/equipment.ts` with TypeScript interfaces matching OpenAPI schemas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create database connection module in `backend/app/database.py` with SQLite/MySQL support via DATABASE_URL env var
- [x] T007 Create Equipment SQLAlchemy model in `backend/app/models/equipment.py` with all fields from data-model.md (including location, acquisition_date, usage_type)
- [x] T008 [P] Create AssignmentHistory SQLAlchemy model in `backend/app/models/assignment_history.py` (with previous_usage_type field)
- [x] T009 Create `backend/app/models/__init__.py` exporting Equipment, AssignmentHistory, and enums (EquipmentType, Status, UsageType, ComputerSubtype)
- [x] T010 Create Pydantic schemas in `backend/app/schemas/equipment.py` (EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentListItem) including location, acquisition_date, usage_type
- [x] T011 [P] Create `backend/app/schemas/__init__.py` exporting all schemas
- [x] T012 Create FastAPI application entry point in `backend/app/main.py` with CORS middleware and API router mounting
- [x] T013 Initialize Alembic for migrations in `backend/alembic/` with `alembic init alembic`
- [x] T014 Create initial Alembic migration for Equipment and AssignmentHistory tables
- [x] T015 [P] Create API client service in `frontend/src/services/api.ts` with base configuration for localhost:8000

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Inventory List (Priority: P1) MVP

**Goal**: Staff can view all equipment in the inventory with key attributes displayed

**Independent Test**: Load the inventory list page and verify equipment records display with Equipment ID, Equipment Name, Model, Equipment Type, Primary User, and Status

### Implementation for User Story 1

- [x] T016 [US1] Create EquipmentService class in `backend/app/services/equipment_service.py` with `get_all()` method (excludes soft-deleted)
- [x] T017 [US1] Implement `generate_equipment_id()` function in `backend/app/services/equipment_service.py` for {TYPE}-NNNN format
- [x] T018 [US1] Create `backend/app/api/__init__.py` with API router
- [x] T019 [US1] Implement GET `/api/v1/computers` endpoint in `backend/app/api/computers.py` (list all equipment)
- [x] T020 [US1] Implement GET `/api/v1/computers/{serial_number}` endpoint in `backend/app/api/computers.py` (get details)
- [x] T021 [P] [US1] Create EquipmentList component in `frontend/src/components/EquipmentList.tsx` displaying table with key columns
- [x] T022 [P] [US1] Create EquipmentDetail component in `frontend/src/components/EquipmentDetail.tsx` showing all fields (including Location, Acquisition Date, Usage Type)
- [x] T023 [US1] Create InventoryPage in `frontend/src/pages/InventoryPage.tsx` combining list view with detail panel
- [x] T024 [US1] Configure React Router and render InventoryPage at root in `frontend/src/App.tsx`
- [x] T025 [US1] Add empty state message to EquipmentList when inventory is empty

**Checkpoint**: User Story 1 complete - staff can view inventory list and details

---

## Phase 4: User Story 2 - Add and Edit Equipment Records (Priority: P2)

**Goal**: Staff can add new equipment and edit existing records to maintain accurate inventory

**Independent Test**: Add a new PC record with all fields, then edit the Primary User and Status to verify changes are saved

### Implementation for User Story 2

- [x] T026 [US2] Add `create()` method to EquipmentService in `backend/app/services/equipment_service.py` with serial number uniqueness check
- [x] T027 [US2] Add `update()` method to EquipmentService with assignment history creation when assignment fields change (primary_user, usage_type, equipment_name)
- [x] T028 [US2] Implement POST `/api/v1/computers` endpoint in `backend/app/api/computers.py` (create equipment)
- [x] T029 [US2] Implement PUT `/api/v1/computers/{serial_number}` endpoint in `backend/app/api/computers.py` (update equipment)
- [x] T030 [P] [US2] Create EquipmentForm component in `frontend/src/components/EquipmentForm.tsx` with all field groups (Specifications, Performance, Assignment) including Location, Acquisition Date, Usage Type (Personal/Work)
- [x] T031 [US2] Add create/update API methods to `frontend/src/services/api.ts`
- [x] T032 [US2] Integrate EquipmentForm into InventoryPage with Add/Edit modal in `frontend/src/pages/InventoryPage.tsx`
- [x] T033 [US2] Add validation error display to EquipmentForm for required fields (Equipment Type)
- [x] T034 [US2] Add 409 Conflict handling for duplicate serial number in EquipmentForm

**Checkpoint**: User Story 2 complete - staff can add and edit equipment records

---

## Phase 5: User Story 3 - Filter and Sort Inventory (Priority: P3)

**Goal**: Staff can filter by multiple criteria and sort by any column to find specific equipment quickly

**Independent Test**: Apply filters (Type=PC, Status=Active, Usage Type=Work, Location=Office) and sort by Overall Rating to verify results

### Implementation for User Story 3

- [x] T035 [US3] Add filter parameters to `get_all()` method in `backend/app/services/equipment_service.py` (status, equipment_type, usage_type, location, primary_user, model, min_rating, max_rating)
- [x] T036 [US3] Add sort parameters to `get_all()` method in `backend/app/services/equipment_service.py` (sort_by, sort_order)
- [x] T037 [US3] Update GET `/api/v1/computers` endpoint to accept filter and sort query parameters in `backend/app/api/computers.py`
- [x] T038 [P] [US3] Create FilterBar component in `frontend/src/components/FilterBar.tsx` with dropdowns for Status, Type, Usage Type (Personal/Work), Location and text inputs for User, Model
- [x] T039 [US3] Add filter/sort state management to InventoryPage and pass to API calls in `frontend/src/pages/InventoryPage.tsx`
- [x] T040 [US3] Add Clear Filters button to FilterBar in `frontend/src/components/FilterBar.tsx`
- [x] T041 [US3] Add column header sorting to EquipmentList in `frontend/src/components/EquipmentList.tsx`
- [x] T042 [US3] Add "No results match filters" message when filter returns empty in `frontend/src/components/EquipmentList.tsx`

**Checkpoint**: User Story 3 complete - staff can filter and sort inventory

---

## Phase 6: User Story 4 - Import and Export CSV (Priority: P4)

**Goal**: Staff can export inventory to CSV and import from CSV for bulk updates and backup

**Independent Test**: Export current inventory, modify the CSV (without Equipment ID column for new records), re-import, and verify changes are applied correctly with auto-generated Equipment IDs

### Implementation for User Story 4

- [x] T043 [US4] Create CSVService class in `backend/app/services/csv_service.py` with `export_to_csv()` method including Location, Acquisition Date, Usage Type columns
- [x] T044 [US4] Add `import_from_csv()` method to CSVService with Equipment ID (optional) / Serial Number matching (create/update/restore logic)
- [x] T045 [US4] Add import error handling to CSVService - collect errors per row, continue processing (partial success)
- [x] T046 [US4] Implement GET `/api/v1/computers/export` endpoint in `backend/app/api/computers.py` returning CSV file
- [x] T047 [US4] Implement POST `/api/v1/computers/import` endpoint in `backend/app/api/computers.py` accepting multipart file upload
- [x] T048 [P] [US4] Add Export button to InventoryPage triggering CSV download in `frontend/src/pages/InventoryPage.tsx`
- [x] T049 [P] [US4] Create ImportModal component in `frontend/src/components/ImportModal.tsx` with file upload and error display
- [x] T050 [US4] Integrate ImportModal into InventoryPage with import result display in `frontend/src/pages/InventoryPage.tsx`
- [x] T051 [US4] Handle import without Equipment ID column - auto-generate Equipment IDs for new records in `backend/app/services/csv_service.py`
- [x] T051a [US4] Verify CSV export returns headers-only file when database is empty in `backend/app/services/csv_service.py`

**Checkpoint**: User Story 4 complete - staff can import/export CSV (Equipment ID optional on import)

---

## Phase 7: User Story 5 - View Assignment History (Priority: P5)

**Goal**: Staff can view chronological assignment history showing who used equipment over time

**Independent Test**: Reassign a computer multiple times (change Primary User, Usage Type, Equipment Name) and verify history shows all previous assignments with dates

### Implementation for User Story 5

- [x] T052 [US5] Add `get_history()` method to EquipmentService in `backend/app/services/equipment_service.py` returning assignment history ordered by end_date DESC
- [x] T053 [US5] Implement GET `/api/v1/computers/{serial_number}/history` endpoint in `backend/app/api/computers.py`
- [x] T054 [P] [US5] Create AssignmentHistory component in `frontend/src/components/AssignmentHistory.tsx` displaying history list with Previous User, Previous Usage Type, Previous Equipment Name, Start Date, End Date
- [x] T055 [US5] Add "View History" button/panel to EquipmentDetail in `frontend/src/components/EquipmentDetail.tsx`
- [x] T056 [US5] Add history API method to `frontend/src/services/api.ts`
- [x] T057 [US5] Display "No assignment history" message for new equipment with no reassignments

**Checkpoint**: User Story 5 complete - staff can view assignment history

---

## Phase 8: Soft Delete & Admin (Cross-cutting)

**Purpose**: Soft delete functionality and admin recovery section

- [x] T058 Add `soft_delete()` method to EquipmentService in `backend/app/services/equipment_service.py`
- [x] T059 Add `restore()` method to EquipmentService in `backend/app/services/equipment_service.py`
- [x] T060 Add `get_deleted()` method to EquipmentService in `backend/app/services/equipment_service.py`
- [x] T061 Implement DELETE `/api/v1/computers/{serial_number}` endpoint (soft delete) in `backend/app/api/computers.py`
- [x] T062 Implement POST `/api/v1/computers/{serial_number}/restore` endpoint in `backend/app/api/computers.py`
- [x] T063 Implement GET `/api/v1/admin/deleted` endpoint in `backend/app/api/computers.py`
- [x] T064 [P] Create AdminPanel component in `frontend/src/components/AdminPanel.tsx` showing deleted equipment list
- [x] T065 [P] Create AdminPage in `frontend/src/pages/AdminPage.tsx` with restore functionality
- [x] T066 Add navigation to AdminPage in `frontend/src/App.tsx`
- [x] T067 Add Delete button to EquipmentDetail with confirmation in `frontend/src/components/EquipmentDetail.tsx`

---

## Phase 9: Schema Updates for New Fields

**Purpose**: Add Location, Acquisition Date, and rename Function to Usage Type

- [x] T068 Add `location` column (String 200) to Equipment model in `backend/app/models/equipment.py`
- [x] T069 Add `acquisition_date` column (Date) to Equipment model in `backend/app/models/equipment.py`
- [x] T070 Rename `function` to `usage_type` in Equipment model with values Personal/Work in `backend/app/models/equipment.py`
- [x] T071 Rename `previous_function` to `previous_usage_type` in AssignmentHistory model in `backend/app/models/assignment_history.py`
- [x] T072 Update Pydantic schemas to include location, acquisition_date, usage_type (replacing function) in `backend/app/schemas/equipment.py`
- [x] T073 Create Alembic migration to add location, acquisition_date columns and rename function to usage_type
- [x] T074 Update TypeScript interfaces to include location, acquisitionDate, usageType in `frontend/src/types/equipment.ts`
- [x] T075 Update EquipmentForm to include Location text field and Acquisition Date date picker in `frontend/src/components/EquipmentForm.tsx`
- [x] T076 Update EquipmentForm Usage Type dropdown with options Personal/Work (replacing Trading, Research, Admin, Development, Other) in `frontend/src/components/EquipmentForm.tsx`
- [x] T077 Update EquipmentDetail to display Location and Acquisition Date in `frontend/src/components/EquipmentDetail.tsx`
- [x] T078 Update FilterBar to include Location filter and update Function filter to Usage Type in `frontend/src/components/FilterBar.tsx`
- [x] T079 Update CSVService to export/import Location, Acquisition Date, Usage Type columns in `backend/app/services/csv_service.py`
- [x] T080 Update AssignmentHistory component to display Previous Usage Type (was Previous Function) in `frontend/src/components/AssignmentHistory.tsx`

---

## Phase 10: Equipment Reassignment UI (NEW FEATURE)

**Purpose**: Add dedicated reassignment workflow to streamline equipment reassignments

**Goal**: Allow users to select existing equipment and reassign it to a new user with a dedicated modal showing machine info and editable assignment fields

**Independent Test**:
1. Click "Reassign" on equipment row in list
2. Verify modal shows equipment info (read-only) and current assignment as "previous"
3. Fill in new assignment details
4. Click "Reassign" button
5. Verify equipment list shows new user
6. View equipment history to confirm previous assignment was recorded

### Implementation for Equipment Reassignment

- [x] T081 [P] [US2] Create ReassignmentModal component in `frontend/src/components/ReassignmentModal.tsx`
  - Display equipment info (ID, type, model, serial) in read-only section
  - Show current assignment as "Previous Assignment" reference
  - Editable fields: Equipment Name, Primary User, Usage Type, IP Address, Assignment Date
  - Save button calls existing `updateEquipment` API
  - Loading state during save
  - Error handling and display

- [x] T082 [P] [US2] Add CSS styles for ReassignmentModal in `frontend/src/index.css`
  - Read-only equipment info section styling
  - Previous/New assignment visual separation
  - Form field layout consistent with EquipmentForm

- [x] T083 [US2] Add "Reassign" action button to EquipmentList in `frontend/src/components/EquipmentList.tsx`
  - Add "Reassign" button to each equipment row actions
  - Button triggers opening ReassignmentModal with selected equipment

- [x] T084 [US2] Wire up ReassignmentModal state in InventoryPage in `frontend/src/pages/InventoryPage.tsx`
  - Add state for reassignmentEquipment (equipment being reassigned, null when modal closed)
  - Add handler to open modal from EquipmentList "Reassign" action
  - Add handler to close modal
  - Add handler to refresh list after successful reassignment
  - Render ReassignmentModal when equipment selected

- [x] T085 [US2] Manual testing of reassignment flow per quickstart.md
  - Test reassigning equipment to new user
  - Test that machine info (model, CPU, etc.) remains unchanged
  - Test that assignment history is created (view via "View History")
  - Test modal cancel behavior
  - Test error handling for API failures

**Checkpoint**: Equipment reassignment feature complete

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T086 Add loading states to all API calls in frontend components
- [x] T087 Add error boundary and generic error handling to `frontend/src/App.tsx`
- [x] T088 Verify CORS configuration works for frontend-backend communication
- [x] T089 Run quickstart.md manual verification checklist (including reassignment)
- [x] T090 Verify Equipment ID auto-generation works correctly for all equipment types (PC, Monitor, Scanner, Printer)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 -> P2 -> P3 -> P4 -> P5)
  - Each story builds incrementally on previous stories
- **Soft Delete & Admin (Phase 8)**: Can start after Phase 2, parallel with user stories
- **Schema Updates (Phase 9)**: Can start anytime after Phase 2, but should be done before full testing
- **Equipment Reassignment UI (Phase 10)**: Frontend-only feature, can start after US1/US2 complete (needs list and edit infrastructure)
- **Polish (Phase 11)**: Depends on all user stories and features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after US1 (needs list view for context)
- **User Story 3 (P3)**: Can start after US1 (adds filtering to existing list)
- **User Story 4 (P4)**: Can start after US2 (import creates/updates records)
- **User Story 5 (P5)**: Can start after US2 (history created on assignment changes)

### Within Each User Story

- Backend implementation before frontend (API must exist for frontend to consume)
- Services before API endpoints
- API endpoints before frontend components
- Core components before page integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Frontend type definitions [P] can run parallel with backend foundation
- Within user stories: Backend service and frontend component development can overlap if API contract is stable

---

## Parallel Example: Phase 2 Foundation

```bash
# Launch in parallel after T006 (database):
Task: "T007 Create Equipment SQLAlchemy model"
Task: "T008 [P] Create AssignmentHistory SQLAlchemy model"
Task: "T015 [P] Create API client service in frontend"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test viewing inventory list independently
5. Deploy/demo if ready - staff can see equipment!

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy (MVP: View inventory!)
3. Add User Story 2 -> Test independently -> Deploy (Can add/edit!)
4. Add User Story 3 -> Test independently -> Deploy (Can filter/sort!)
5. Add User Story 4 -> Test independently -> Deploy (Can import/export!)
6. Add User Story 5 -> Test independently -> Deploy (Can view history!)
7. Add Soft Delete/Admin -> Test independently -> Deploy
8. Apply Schema Updates (Phase 9) -> Add Location, Acquisition Date, Usage Type
9. Polish -> Full feature complete!

### Single Developer Strategy

Work through phases in order:
1. Phase 1 (Setup) -> Phase 2 (Foundation) -> Phase 3 (US1-MVP)
2. Validate MVP works end-to-end
3. Continue Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
4. Complete Phase 8 (Admin), Phase 9 (Schema Updates), and Phase 10 (Polish)

---

## Summary

| Phase | Description | Task Count | Status |
|-------|-------------|------------|--------|
| 1 | Setup | 5 | Complete |
| 2 | Foundational | 10 | Complete |
| 3 | US1 - View Inventory | 10 | Complete |
| 4 | US2 - Add/Edit | 9 | Complete |
| 5 | US3 - Filter/Sort | 8 | Complete |
| 6 | US4 - Import/Export | 10 | Complete |
| 7 | US5 - Assignment History | 6 | Complete |
| 8 | Soft Delete & Admin | 10 | Complete |
| 9 | Schema Updates | 13 | Pending |
| 10 | Equipment Reassignment UI (NEW) | 5 | **Pending** |
| 11 | Polish | 5 | Pending |
| **Total** | | **91** | |

**New Tasks Added (Phase 10)**: T081-T085 for Equipment Reassignment UI feature - allows users to select existing equipment and reassign it with machine info copied over

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Equipment ID format: {TYPE}-NNNN where TYPE is PC, MON, SCN, or PRN
- Database: SQLite for development, MySQL via DATABASE_URL for production
- **NEW FIELDS**: Location (physical location), Acquisition Date (when acquired)
- **RENAMED FIELD**: Function -> Usage Type with values Personal, Work (was Trading, Research, Admin, Development, Other)
- **IMPORT CHANGE**: Equipment ID column is optional in CSV imports; auto-generated for new records
