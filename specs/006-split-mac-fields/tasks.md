# Tasks: Split MAC Address Fields

**Input**: Design documents from `/specs/006-split-mac-fields/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - manual testing acceptable per constitution (Principle IV)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` directories at repository root
- Backend: Python/FastAPI with SQLAlchemy
- Frontend: React/TypeScript with Vite

---

## Phase 1: Setup

**Purpose**: No setup required - this feature extends an existing project with established structure

**Note**: Project structure already exists. Proceed directly to Foundational phase.

---

## Phase 2: Foundational (Database Migration)

**Purpose**: Database schema change that MUST be complete before any other work

**⚠️ CRITICAL**: All user stories depend on this database migration being complete

- [x] T001 Create Alembic migration file in backend/alembic/versions/004_split_mac_address_fields.py
- [x] T002 Run migration to apply schema changes (`alembic upgrade head`)

**Checkpoint**: Database has `mac_lan` and `mac_wlan` columns; existing data preserved in `mac_lan`

---

## Phase 3: User Story 1 - Record Separate Network Addresses (Priority: P1) 🎯 MVP

**Goal**: Users can create/edit PC records with separate MAC (LAN) and MAC (WLAN) fields

**Independent Test**: Create a new PC record with both MAC addresses, verify both display correctly in detail view

### Implementation for User Story 1

#### Backend Updates

- [x] T003 [P] [US1] Update Equipment model: replace `mac_address` with `mac_lan` and `mac_wlan` in backend/app/models/equipment.py
- [x] T004 [P] [US1] Update EquipmentBase schema: replace `mac_address` with `mac_lan` and `mac_wlan` in backend/app/schemas/equipment.py
- [x] T005 [P] [US1] Update EquipmentListItem schema: replace `mac_address` with `mac_lan` and `mac_wlan` in backend/app/schemas/equipment.py

#### Frontend Updates

- [x] T006 [P] [US1] Update Equipment TypeScript interface: replace `mac_address` with `mac_lan` and `mac_wlan` in frontend/src/types/equipment.ts
- [x] T007 [US1] Update EquipmentForm: replace single MAC input with two inputs labeled "MAC (LAN)" and "MAC (WLAN)" in frontend/src/components/EquipmentForm.tsx
- [x] T008 [US1] Update EquipmentDetail: display both MAC addresses for PC-type equipment in frontend/src/components/EquipmentDetail.tsx
- [x] T009 [US1] Update EquipmentList: update column configuration for MAC fields in frontend/src/config/columns.ts

**Checkpoint**: Users can create/edit PCs with both MAC fields; values save and display correctly

---

## Phase 4: User Story 2 - Migrate Existing MAC Addresses (Priority: P2)

**Goal**: Existing MAC address data is preserved after migration (already handled by migration in Phase 2)

**Independent Test**: View a previously saved PC record after migration; old MAC address appears in MAC (LAN) field

### Implementation for User Story 2

**Note**: The database migration (T001-T002) already preserves data by renaming `mac_address` to `mac_lan`. This phase validates that the migration was successful.

- [x] T010 [US2] Verify migration preserves existing MAC data: check existing equipment records show mac_address values in mac_lan field

**Checkpoint**: All existing MAC addresses appear in MAC (LAN) field; MAC (WLAN) is empty and editable

---

## Phase 5: User Story 3 - Import/Export with Dual MAC Fields (Priority: P3)

**Goal**: CSV import/export supports both MAC columns with backward compatibility for legacy files

**Independent Test**: Export equipment to CSV, verify both MAC columns exist; import CSV with legacy "MAC Address" column, verify it maps to MAC (LAN)

### Implementation for User Story 3

#### Backend CSV Service Updates

- [x] T011 [US3] Update CSV_FIELD_MAP: add 'MAC (LAN)' and 'MAC (WLAN)' mappings, keep legacy 'MAC Address' → 'mac_lan' in backend/app/services/csv_service.py
- [x] T012 [US3] Update FIELD_CSV_MAP: replace 'mac_address' with 'mac_lan' and 'mac_wlan' entries in backend/app/services/csv_service.py
- [x] T013 [US3] Update EXPORT_FIELDS: replace 'mac_address' with 'mac_lan', 'mac_wlan' in backend/app/services/csv_service.py
- [x] T014 [US3] Update _validate_row: validate both mac_lan and mac_wlan fields in backend/app/services/csv_service.py
- [x] T015 [US3] Update _process_import_row: handle both MAC field normalizations in backend/app/services/csv_service.py

#### Frontend Import Modal Updates

- [x] T016 [US3] Update ImportModal/ImportPreview: handle dual MAC column display in frontend/src/components/ImportModal.tsx (no changes needed - components are data-driven from backend)

**Checkpoint**: CSV export includes "MAC (LAN)" and "MAC (WLAN)" columns; import supports both new and legacy column formats

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T017 Run quickstart.md validation steps to verify all functionality works end-to-end
- [x] T018 Verify all acceptance scenarios from spec.md pass manual testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped - project already set up
- **Foundational (Phase 2)**: No dependencies - migration runs first - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (migration complete)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (migration complete) - can run parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 3 (backend model/schema updated)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after migration (Phase 2) - Core functionality
- **User Story 2 (P2)**: Can start after migration (Phase 2) - Just verification, minimal implementation
- **User Story 3 (P3)**: Depends on US1 backend changes (needs updated model/schemas)

### Within Each User Story

- Backend model/schema changes before frontend updates
- Frontend types before components
- Form before detail view before list view

### Parallel Opportunities

- T003, T004, T005 can run in parallel (different files in backend)
- T006 can run in parallel with T003-T005 (frontend type, no backend dependency except concept)
- T011, T012, T013 are in the same file but different sections (execute sequentially)

---

## Parallel Example: User Story 1 Backend

```bash
# Launch all backend schema/model updates together:
Task: "Update Equipment model in backend/app/models/equipment.py"
Task: "Update EquipmentBase schema in backend/app/schemas/equipment.py"
Task: "Update EquipmentListItem schema in backend/app/schemas/equipment.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Migration (T001-T002)
2. Complete Phase 3: User Story 1 (T003-T009)
3. **STOP and VALIDATE**: Test creating/editing PCs with dual MAC fields
4. Deploy/demo if ready - core functionality complete

### Incremental Delivery

1. Phase 2 (Migration) → Database ready
2. User Story 1 → Core CRUD with dual MAC fields → MVP complete
3. User Story 2 → Verify data preservation → Validation complete
4. User Story 3 → CSV import/export updated → Full feature complete
5. Phase 6 (Polish) → End-to-end validation

### Suggested MVP Scope

**MVP = Phase 2 + Phase 3 (User Story 1)**
- 9 tasks total (T001-T009)
- Delivers: Create/edit/view PCs with both MAC addresses
- Value: Core functionality users requested

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- Migration (T001-T002) is the critical blocker - all other work depends on it
- Manual testing acceptable per constitution Principle IV (Pragmatic Testing)
- Commit after each task or logical group
