# Tasks: Subscription Tracking

**Input**: Design documents from `/specs/004-subscription-tracking/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Manual testing acceptable per constitution (no automated test tasks included)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for Python/FastAPI, `frontend/` for React/TypeScript

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and core models that all user stories depend on

- [X] T001 Create Category SQLAlchemy model in backend/app/models/category.py
- [X] T002 [P] Create Subcategory SQLAlchemy model in backend/app/models/subcategory.py
- [X] T003 [P] Create Subscription SQLAlchemy model with all 27 fields in backend/app/models/subscription.py
- [X] T004 Update model exports in backend/app/models/__init__.py
- [X] T005 Create Alembic migration for categories, subcategories, and subscriptions tables in backend/alembic/versions/
- [ ] T006 Run migration with `alembic upgrade head` (MANUAL: run in backend venv)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create password obfuscation utilities in backend/app/services/password.py
- [X] T008 [P] Create Category Pydantic schemas (Create, Update, Response, WithSubcategories) in backend/app/schemas/category.py
- [X] T009 [P] Create Subcategory Pydantic schemas (Create, Update, Response) in backend/app/schemas/subcategory.py
- [X] T010 [P] Create Subscription Pydantic schemas (Create, Update, ListItem, Response) in backend/app/schemas/subscription.py
- [X] T011 Create Category service with CRUD operations and default category/subcategory seeding in backend/app/services/category.py
- [X] T012 Create Subscription service with CRUD and ID generation (SUB-NNNN) in backend/app/services/subscription.py
- [X] T013 Create Category API routes in backend/app/api/categories.py
- [X] T014 Create Subscription API routes in backend/app/api/subscriptions.py
- [X] T015 Register category and subscription routers in backend/app/api/__init__.py
- [X] T016 Create TypeScript Category and Subcategory types in frontend/src/types/category.ts
- [X] T017 [P] Create TypeScript Subscription types in frontend/src/types/subscription.ts
- [X] T018 Add category API methods to frontend/src/services/api.ts
- [X] T019 Add subscription API methods to frontend/src/services/api.ts
- [X] T020 Create CategoryContext provider for single source of truth in frontend/src/contexts/CategoryContext.tsx
- [X] T021 Wrap App with CategoryProvider in frontend/src/App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Subscriptions (Priority: P1)

**Goal**: Display list of all subscriptions with detail view

**Independent Test**: Navigate to Subscriptions tab, see list with columns (ID, Provider, Category, Status, Owner), click row to see detail panel

### Implementation for User Story 1

- [X] T022 [US1] Create SubscriptionsPage component with list view in frontend/src/pages/SubscriptionsPage.tsx
- [X] T023 [US1] Implement subscription list table with always-visible columns (ID, Provider, Category, Status, CCM Owner)
- [X] T023a [US1] Implement column sorting (click header to sort ascending/descending) per FR-002
- [X] T024 [US1] Add subscription detail panel/modal that opens on row click
- [X] T025 [US1] Implement search functionality across all fields
- [X] T026 [US1] Add Subscriptions tab to navigation in frontend/src/App.tsx (nav links)
- [X] T027 [US1] Add /subscriptions route in frontend/src/App.tsx

**Checkpoint**: User Story 1 complete - users can view and search subscriptions

---

## Phase 4: User Story 2 - Add New Subscription (Priority: P1)

**Goal**: Allow staff to create new subscription entries with all fields

**Independent Test**: Click "Add Subscription", fill provider, save, see new entry with auto-generated SUB-NNNN ID

### Implementation for User Story 2

- [X] T028 [US2] Create SubscriptionForm component with all 27 fields in frontend/src/components/SubscriptionForm.tsx
- [X] T029 [US2] Implement Category dropdown that fetches from CategoryContext
- [X] T030 [US2] Implement Subcategory dropdown filtered by selected category
- [X] T031 [US2] Implement password field with show/hide toggle
- [X] T032 [US2] Implement date pickers for renewal_date and last_confirmed_alive
- [X] T033 [US2] Implement enum dropdowns for status, value_level, payment_frequency
- [X] T034 [US2] Add "Add Subscription" button to SubscriptionsPage
- [X] T035 [US2] Wire form submission to create API endpoint

**Checkpoint**: User Story 2 complete - users can add new subscriptions

---

## Phase 5: User Story 3 - Edit Subscription (Priority: P1)

**Goal**: Allow staff to edit existing subscription entries

**Independent Test**: View subscription detail, click Edit, modify renewal date, save, see updated value

### Implementation for User Story 3

- [X] T036 [US3] Add Edit button to subscription detail panel
- [X] T037 [US3] Implement edit mode in SubscriptionForm (pre-populate with existing data)
- [X] T038 [US3] Wire form submission to update API endpoint
- [X] T039 [US3] Refresh list after successful edit

**Checkpoint**: User Story 3 complete - users can edit subscriptions

---

## Phase 6: User Story 4 - Delete and Recover Subscription (Priority: P2)

**Goal**: Allow deletion with admin recovery capability

**Independent Test**: Delete a subscription (disappears from list), go to Admin, see deleted subscription, restore it (reappears in list)

### Implementation for User Story 4

- [X] T040 [US4] Add Delete button with confirmation dialog to subscription detail panel
- [X] T041 [US4] Wire delete to soft-delete API endpoint
- [ ] T042 [US4] Add deleted subscriptions section to Admin page in frontend/src/pages/AdminPage.tsx
- [ ] T043 [US4] Implement restore functionality with API call
- [X] T044 [US4] Refresh lists after delete/restore operations

**Checkpoint**: User Story 4 complete - users can delete and admins can recover subscriptions

---

## Phase 7: User Story 5 - Filter Subscriptions (Priority: P2)

**Goal**: Filter subscriptions by Category, Status, Value Level, and CCM Owner

**Independent Test**: Apply Category filter, see only matching subscriptions; apply Status filter, see only Active/Inactive

### Implementation for User Story 5

- [X] T045 [US5] Add filter controls (dropdowns) above subscription list
- [X] T046 [US5] Implement Category filter using CategoryContext data
- [X] T047 [US5] Implement Status filter (Active/Inactive dropdown)
- [X] T048 [US5] Implement Value Level filter (H/M/L dropdown)
- [X] T049 [US5] Implement CCM Owner filter (dynamic based on existing owners)
- [X] T050 [US5] Wire filters to API query parameters

**Checkpoint**: User Story 5 complete - users can filter subscriptions

---

## Phase 8: User Story 6 - Import/Export CSV (Priority: P3)

**Goal**: Bulk import subscriptions from CSV and export to CSV

**Independent Test**: Export CSV (receive file with all fields), Import CSV (new subscriptions created)

### Implementation for User Story 6

- [X] T051 [US6] Add CSV export endpoint logic in backend/app/services/subscription.py
- [X] T052 [US6] Add CSV import endpoint logic with validation in backend/app/services/subscription.py
- [X] T053 [US6] Add Export button to SubscriptionsPage that triggers download
- [X] T054 [US6] Add Import button with file upload dialog
- [X] T055 [US6] Display import results (created/failed counts, errors)

**Checkpoint**: User Story 6 complete - users can import/export via CSV

---

## Phase 9: User Story 7 - Manage Categories and Subcategories (Priority: P2)

**Goal**: Admin UI to add, edit, delete categories and subcategories

**Independent Test**: Add new category (appears in dropdowns), add subcategory, try delete category in use (prevented), delete unused category

### Implementation for User Story 7

- [ ] T056 [US7] Create CategoryManager component in frontend/src/components/CategoryManager.tsx
- [ ] T057 [US7] Implement category list with edit/delete buttons
- [ ] T058 [US7] Implement add category form with name input
- [ ] T059 [US7] Implement expand to show subcategories per category
- [ ] T060 [US7] Implement add/edit/delete subcategory within category
- [ ] T061 [US7] Show usage count before delete, prevent if in use
- [ ] T062 [US7] Add Category Management section to Admin page
- [ ] T063 [US7] Refresh CategoryContext after changes

**Checkpoint**: User Story 7 complete - admins can manage categories and subcategories

---

## Phase 10: View Groups (Enhancement)

**Purpose**: Toggle column visibility by view group

- [ ] T064 Add view group toggle buttons (Access, Financial, Communication, Details) to SubscriptionsPage
- [ ] T065 Implement view group state management with localStorage persistence
- [ ] T066 Show/hide columns based on active view groups
- [ ] T067 Implement Access View columns (Link, Auth, Username, Password masked, In Lastpass, Access Level)
- [ ] T068 Implement Financial View columns (Payment Method, Cost, Annual Cost, Frequency, Renewal Date)
- [ ] T069 Implement Communication View columns (Subscriber Email, Forward To, Email Routing, Volume, Vendor Contact)
- [ ] T070 Implement Details View columns (Subcategory, Description, Value Level, Log, Actions, Last Confirmed)

**Checkpoint**: View groups complete - users can toggle column visibility

---

## Phase 11: Renewal Indicators (Enhancement)

**Purpose**: Visual indicators for upcoming renewals

- [ ] T071 Add renewal_status calculation to subscription service (ok/warning/urgent/overdue)
- [ ] T072 Implement color-coded row highlighting based on renewal_status (30-day warning, 7-day urgent)
- [ ] T073 Add renewal status icon/badge to subscription list row

**Checkpoint**: Renewal indicators complete

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T074 Validate all form fields match API contract constraints
- [ ] T075 Add loading states to all async operations
- [ ] T076 Add error handling with user-friendly messages
- [ ] T077 Run quickstart.md manual testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (View): Can start immediately after Foundational
  - US2 (Add): Requires US1 (needs list page to add button to)
  - US3 (Edit): Requires US2 (needs form component)
  - US4 (Delete/Restore): Requires US1 (needs list page)
  - US5 (Filter): Requires US1 (needs list page)
  - US6 (CSV): Requires US1 and US2 (needs list page and service layer)
  - US7 (Categories): Can start after Foundational (independent admin feature)
- **View Groups (Phase 10)**: Requires US1
- **Renewal Indicators (Phase 11)**: Requires US1
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (View) | Foundational | - |
| US2 (Add) | US1 | US7 |
| US3 (Edit) | US2 | US4, US5, US7 |
| US4 (Delete) | US1 | US2, US5, US7 |
| US5 (Filter) | US1 | US2, US3, US4, US7 |
| US6 (CSV) | US1, US2 | US7 |
| US7 (Categories) | Foundational | US1-US6 |

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration

### Parallel Opportunities

**Phase 1 (Setup):**
```bash
# Models can be created in parallel:
Task: T001 Create Category model
Task: T002 Create Subcategory model
Task: T003 Create Subscription model
```

**Phase 2 (Foundational):**
```bash
# Schemas and utilities can be created in parallel:
Task: T007 Password utilities
Task: T008 Category schemas
Task: T009 Subcategory schemas
Task: T010 Subscription schemas
```

**User Stories (after Foundational):**
```bash
# US1 and US7 can start in parallel:
Task: T022 SubscriptionsPage
Task: T056 CategoryManager
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (database models, migration)
2. Complete Phase 2: Foundational (schemas, services, routes, types, API client)
3. Complete Phase 3: User Story 1 (view subscriptions)
4. Complete Phase 4: User Story 2 (add subscriptions)
5. Complete Phase 5: User Story 3 (edit subscriptions)
6. **STOP and VALIDATE**: Test core CRUD independently
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (View) → Test → Deploy (read-only access)
3. Add US2 (Add) + US3 (Edit) → Test → Deploy (full CRUD)
4. Add US4 (Delete/Restore) → Test → Deploy (soft delete)
5. Add US5 (Filter) → Test → Deploy (improved UX)
6. Add US6 (CSV) → Test → Deploy (bulk operations)
7. Add US7 (Category Management) → Test → Deploy (admin features)
8. Add View Groups + Renewal Indicators → Test → Deploy (polish)

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Setup | T001-T006 | Database models and migration |
| 2. Foundational | T007-T021 | Schemas, services, routes, frontend types |
| 3. US1 - View | T022-T027 (+T023a) | List page with search, sorting, and detail view |
| 4. US2 - Add | T028-T035 | Create subscription form |
| 5. US3 - Edit | T036-T039 | Edit existing subscriptions |
| 6. US4 - Delete | T040-T044 | Soft delete and admin restore |
| 7. US5 - Filter | T045-T050 | Filter by category, status, etc. |
| 8. US6 - CSV | T051-T055 | Import/export functionality |
| 9. US7 - Categories | T056-T063 | Admin category management |
| 10. View Groups | T064-T070 | Toggle column visibility |
| 11. Renewal | T071-T073 | Visual renewal indicators |
| 12. Polish | T074-T077 | Final validation and cleanup |

**Total Tasks**: 78 (T001-T077 + T023a)
**MVP Tasks (US1-3)**: 40 tasks (Setup + Foundational + US1 + US2 + US3)
**Parallel Opportunities**: Identified at each phase (see examples above)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing acceptable per project constitution - no automated test tasks included
