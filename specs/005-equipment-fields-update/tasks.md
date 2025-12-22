# Tasks: Equipment Fields Update

**Input**: Design documents from `/specs/005-equipment-fields-update/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested per constitution (manual testing acceptable for CRUD and import workflow).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`
- Backend: Python/FastAPI at `backend/app/`
- Frontend: React/TypeScript at `frontend/src/`

---

## Phase 1: Setup

**Purpose**: Install dependencies and prepare development environment

- [ ] T001 Install frontend markdown dependencies: `npm install react-markdown dompurify @types/dompurify` in `frontend/`
- [ ] T002 Verify backend dependencies are up to date in `backend/requirements.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migration

- [ ] T003 Create Alembic migration to add `purpose` field to Equipment table in `backend/alembic/versions/`
- [ ] T004 Update migration to convert `computer_subtype`, `status`, `usage_type` from Enum to String(50) in `backend/alembic/versions/`
- [ ] T005 Run and verify migration: `alembic upgrade head`

### Backend Validators & Normalizers

- [ ] T006 [P] Create `backend/app/services/validators.py` with IPv4, MAC address, Equipment ID validators
- [ ] T007 [P] Create `backend/app/utils/normalizers.py` with MAC normalization, CPU speed normalization, title case conversion

### Model & Schema Updates

- [ ] T008 Update Equipment model in `backend/app/models/equipment.py`: add `purpose` field, change enum columns to String
- [ ] T009 Update Equipment schemas in `backend/app/schemas/equipment.py`: add `purpose` field, update field types, add preview types (ImportPreviewRow, ImportPreviewResult, FieldError)

### CSV Field Mappings

- [ ] T010 Update CSV_FIELD_MAP in `backend/app/services/csv_service.py`: add column aliases (Category→Equipment Type, Subcategory→Computer Subtype, CPU Base Speed→CPU Speed, Ownership→Usage Type)
- [ ] T011 Add value mappings in `backend/app/services/csv_service.py`: Subcategory (Tower/SFF/PC→Desktop), Status (Inactive - In Storage→In Storage), Ownership (CCM→Work)

**Checkpoint**: Foundation ready - validators, normalizers, model changes, and CSV mappings are in place

---

## Phase 3: User Story 1 - Import Equipment from CSV with Preview (Priority: P1) 🎯 MVP

**Goal**: Bulk import equipment data with preview/confirmation workflow

**Independent Test**: Upload CSV file, see preview with validated/problematic/duplicate sections, fix entries, confirm import

### Backend Implementation

- [ ] T012 [US1] Implement preview parsing logic in `backend/app/services/csv_service.py`: parse_csv_preview() that returns ImportPreviewResult
- [ ] T013 [US1] Add Equipment ID handling in `backend/app/services/csv_service.py`: auto-generate if missing, uppercase conversion, uniqueness check
- [ ] T014 [US1] Add field validation in preview in `backend/app/services/csv_service.py`: validate IPv4, MAC, apply normalizations
- [ ] T015 [US1] Implement duplicate detection in `backend/app/services/csv_service.py`: check Equipment ID exists in database
- [ ] T016 [US1] Create preview endpoint `POST /api/v1/computers/import/preview` in `backend/app/api/computers.py`
- [ ] T017 [US1] Create validate row endpoint `POST /api/v1/computers/validate/row` in `backend/app/api/computers.py`
- [ ] T018 [US1] Create confirm import endpoint `POST /api/v1/computers/import/confirm` in `backend/app/api/computers.py`

### Frontend Implementation

- [ ] T019 [P] [US1] Add preview types to `frontend/src/types/equipment.ts`: ImportPreviewRow, ImportPreviewResult, FieldError, PreviewStatus
- [ ] T020 [P] [US1] Add API functions in `frontend/src/services/api.ts`: previewImport(), validateRow(), confirmImport()
- [ ] T021 [US1] Create ImportPreview component in `frontend/src/components/ImportPreview.tsx`: display validated/problematic/duplicate sections with checkboxes
- [ ] T022 [US1] Create ImportRowEditor component in `frontend/src/components/ImportRowEditor.tsx`: inline editing for problematic rows
- [ ] T023 [US1] Update ImportModal in `frontend/src/components/ImportModal.tsx`: two-phase workflow (preview → confirm)

**Checkpoint**: User Story 1 complete - CSV import with preview/confirmation works end-to-end

---

## Phase 4: User Story 4 - Add New Equipment Fields (Priority: P1)

**Goal**: Support Purpose field and display Category/Subcategory/Ownership mappings correctly

**Independent Test**: Create equipment with Purpose field, verify it saves and displays correctly

### Backend Implementation

- [ ] T024 [US4] Ensure Purpose field is included in create/update endpoints in `backend/app/api/computers.py`
- [ ] T025 [US4] Add Purpose to CSV export in `backend/app/services/csv_service.py`

### Frontend Implementation

- [ ] T026 [US4] Add Purpose field to EquipmentForm in `frontend/src/components/EquipmentForm.tsx`
- [ ] T027 [US4] Update equipment display components to show Purpose in detail views

**Checkpoint**: User Story 4 complete - Purpose field works in forms, display, and CSV import/export

---

## Phase 5: User Story 2 - Add New Enumeration Values (Priority: P2)

**Goal**: Allow administrators to add new Category, Subcategory, Status, Ownership values with title case enforcement

**Independent Test**: Enter new Subcategory value in form, verify it converts to title case and is saved

### Backend Implementation

- [ ] T028 [US2] Update validation in `backend/app/schemas/equipment.py`: accept any string for enum fields, apply title case normalization
- [ ] T029 [US2] Update create/update handlers in `backend/app/services/equipment_service.py`: apply title case to enum fields before save

### Frontend Implementation

- [ ] T030 [US2] Update EquipmentForm dropdowns in `frontend/src/components/EquipmentForm.tsx`: change from fixed dropdowns to combo boxes allowing new entries
- [ ] T031 [US2] Add client-side title case preview in `frontend/src/components/EquipmentForm.tsx`: show user how their value will be stored

**Checkpoint**: User Story 2 complete - new enumeration values can be added with title case enforcement

---

## Phase 6: User Story 3 - Validate Field Formats on Entry (Priority: P2)

**Goal**: Real-time validation for IP address, MAC address, CPU speed in equipment form

**Independent Test**: Enter invalid IP address in form, see validation error immediately

### Backend Implementation

- [ ] T032 [US3] Add field validation endpoint `POST /api/v1/computers/validate/field` in `backend/app/api/computers.py`

### Frontend Implementation

- [ ] T033 [US3] Add real-time validation to IP Address field in `frontend/src/components/EquipmentForm.tsx`: validate IPv4 on blur
- [ ] T034 [US3] Add real-time validation to MAC Address field in `frontend/src/components/EquipmentForm.tsx`: validate format on blur, show normalized preview
- [ ] T035 [US3] Add real-time validation to CPU Speed field in `frontend/src/components/EquipmentForm.tsx`: show normalized format preview

**Checkpoint**: User Story 3 complete - field validation works with immediate feedback in equipment form

---

## Phase 7: User Story 5 - View Notes with Markdown Rendering (Priority: P2)

**Goal**: Render Notes field as markdown in Equipment, Software, and Subscription detail views

**Independent Test**: Add markdown text to Notes, verify it renders with formatting in detail view

### Frontend Implementation

- [ ] T036 [P] [US5] Create MarkdownRenderer component in `frontend/src/components/MarkdownRenderer.tsx`: use react-markdown with DOMPurify sanitization
- [ ] T037 [US5] Update EquipmentDetail in `frontend/src/components/EquipmentDetail.tsx`: render Notes using MarkdownRenderer
- [ ] T038 [P] [US5] Update SoftwareDetail in `frontend/src/components/SoftwareDetail.tsx`: render Notes using MarkdownRenderer
- [ ] T039 [P] [US5] Update SubscriptionDetail in `frontend/src/components/SubscriptionDetail.tsx`: render Notes using MarkdownRenderer
- [ ] T040 [US5] Add markdown-content CSS styles in `frontend/src/styles/` for consistent markdown appearance

**Checkpoint**: User Story 5 complete - Notes render as markdown in all detail views with XSS protection

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 Manual test: Import source CSV file (54 records) and verify all records import correctly
- [ ] T042 Manual test: Verify field validation errors show within 1 second
- [ ] T043 Manual test: Verify existing equipment data is unchanged after migration
- [ ] T044 Manual test: Test markdown XSS protection with script tags in Notes
- [ ] T045 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 4 (P1) can proceed in parallel after Foundational
  - User Story 2, 3, 5 (P2) can proceed after or in parallel with P1 stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - no dependencies on other stories
- **User Story 4 (P1)**: Depends on Foundational - can run parallel with US1
- **User Story 2 (P2)**: Depends on Foundational - uses validators from US1 but independently testable
- **User Story 3 (P2)**: Depends on Foundational - uses validators, independently testable
- **User Story 5 (P2)**: Depends on Setup (npm packages) only - completely independent of other stories

### Within Each User Story

- Backend implementation before frontend (API must exist for frontend to call)
- Core functionality before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- T006 and T007 can run in parallel (different files)
- T019 and T020 can run in parallel (different files)
- T021 and T022 can run in parallel (different files)
- T036, T037, T038, T039 can run in parallel (different files)
- User Story 5 can run entirely in parallel with other stories (frontend-only)

---

## Parallel Example: User Story 1 Backend

```bash
# After Foundational complete, launch backend tasks:
Task: "Implement preview parsing logic in backend/app/services/csv_service.py"
# Then in sequence:
Task: "Add Equipment ID handling in backend/app/services/csv_service.py"
Task: "Add field validation in preview in backend/app/services/csv_service.py"
Task: "Implement duplicate detection in backend/app/services/csv_service.py"

# API endpoints can be done in parallel once service is ready:
Task: "Create preview endpoint in backend/app/api/computers.py"
Task: "Create validate row endpoint in backend/app/api/computers.py"
Task: "Create confirm import endpoint in backend/app/api/computers.py"
```

## Parallel Example: User Story 5 (Frontend-only)

```bash
# Can run entirely in parallel with other stories:
Task: "Create MarkdownRenderer component in frontend/src/components/MarkdownRenderer.tsx"
# Then in parallel:
Task: "Update EquipmentDetail in frontend/src/components/EquipmentDetail.tsx"
Task: "Update SoftwareDetail in frontend/src/components/SoftwareDetail.tsx"
Task: "Update SubscriptionDetail in frontend/src/components/SubscriptionDetail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (npm install)
2. Complete Phase 2: Foundational (migration, validators, model updates)
3. Complete Phase 3: User Story 1 (CSV import with preview)
4. **STOP and VALIDATE**: Import source CSV file (54 records) successfully
5. Demo CSV import workflow

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 4 (P1) → CSV import with Purpose field works → Demo
3. Add User Story 2 (P2) → Extensible enumerations work → Demo
4. Add User Story 3 (P2) → Real-time validation works → Demo
5. Add User Story 5 (P2) → Markdown Notes work → Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing per constitution - no automated test tasks required
