# Tasks: Subscription Pivot Views (By Distribution & By Authentication)

**Input**: Design documents from `/specs/013-subscription-pivot-views/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Manual testing per constitution (no automated test tasks required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (frontend only)**: `frontend/src/`
- Files modified: `SubscriptionList.tsx`, `SubscriptionsPage.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update shared types and view mode configuration

- [X] T001 Extend SubscriptionViewMode type to include 'by_distribution' and 'by_authentication' in `frontend/src/components/SubscriptionList.tsx`
- [X] T002 Replace 'by_category' with 'by_authentication' in SUBSCRIPTION_VIEW_GROUP_KEYS and SUBSCRIPTION_VIEW_GROUP_LABELS in `frontend/src/pages/SubscriptionsPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create column definitions that will be used by both new views

**⚠️ CRITICAL**: Column definitions must be created before view filtering logic

- [X] T003 [P] Define BY_DISTRIBUTION_COLUMNS constant with subscriber_email as rowGroup field, and authentication + provider as data columns in `frontend/src/components/SubscriptionList.tsx`
- [X] T004 [P] Define BY_AUTHENTICATION_COLUMNS constant with authentication as rowGroup field, and provider as data column in `frontend/src/components/SubscriptionList.tsx`
- [X] T005 [P] Define distributionGroupColumnDef with headerName 'Destination Email' and minWidth 250 in `frontend/src/components/SubscriptionList.tsx`
- [X] T006 [P] Define authenticationGroupColumnDef with headerName 'Authentication Method' and minWidth 200 in `frontend/src/components/SubscriptionList.tsx`

**Checkpoint**: Column definitions ready - view logic can now be implemented

---

## Phase 3: User Story 1 - View Subscriptions Grouped by Distribution (Priority: P1) 🎯 MVP

**Goal**: Enable users to see active subscriptions grouped by Destination Email, displaying Authentication Method and Provider columns

**Independent Test**: Click "By Distribution" button and verify rows are grouped by Destination Email, only Active subscriptions shown, group headers display item counts

### Implementation for User Story 1

- [X] T007 [US1] Update activeViewMode derivation to include 'by_distribution' case in `frontend/src/pages/SubscriptionsPage.tsx`
- [X] T008 [US1] Add filter logic for 'by_distribution' view to filter subscriptions where status equals 'Active' in `frontend/src/pages/SubscriptionsPage.tsx`
- [X] T009 [US1] Update columnDefs useMemo to return BY_DISTRIBUTION_COLUMNS when viewMode is 'by_distribution' in `frontend/src/components/SubscriptionList.tsx`
- [X] T010 [US1] Update autoGroupColumnDef useMemo to return distributionGroupColumnDef when viewMode is 'by_distribution' in `frontend/src/components/SubscriptionList.tsx`
- [X] T011 [US1] Update groupDisplayType, groupDefaultExpanded, and grid key to handle 'by_distribution' view mode in `frontend/src/components/SubscriptionList.tsx`
- [X] T012 [US1] Pass 'by_distribution' viewMode from SubscriptionsPage to SubscriptionList component in `frontend/src/pages/SubscriptionsPage.tsx`

**Checkpoint**: By Distribution view should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Subscriptions Grouped by Authentication Method (Priority: P1)

**Goal**: Enable users to see active subscriptions grouped by Authentication Method, displaying Provider column

**Independent Test**: Click "By Authentication" button and verify rows are grouped by Authentication Method, only Active subscriptions shown, group headers display item counts

### Implementation for User Story 2

- [X] T013 [US2] Add filter logic for 'by_authentication' view to filter subscriptions where status equals 'Active' in `frontend/src/pages/SubscriptionsPage.tsx`
- [X] T014 [US2] Update columnDefs useMemo to return BY_AUTHENTICATION_COLUMNS when viewMode is 'by_authentication' in `frontend/src/components/SubscriptionList.tsx`
- [X] T015 [US2] Update autoGroupColumnDef useMemo to return authenticationGroupColumnDef when viewMode is 'by_authentication' in `frontend/src/components/SubscriptionList.tsx`
- [X] T016 [US2] Update groupDisplayType, groupDefaultExpanded, and grid key to handle 'by_authentication' view mode in `frontend/src/components/SubscriptionList.tsx`
- [X] T017 [US2] Pass 'by_authentication' viewMode from SubscriptionsPage to SubscriptionList component in `frontend/src/pages/SubscriptionsPage.tsx`

**Checkpoint**: By Authentication view should be fully functional and testable independently

---

## Phase 5: User Story 3 - Maintain Interactivity in Grouped Views (Priority: P2)

**Goal**: Ensure both grouped views retain row selection, column sorting, and search state preservation

**Independent Test**: Activate either grouped view, click data row to verify modal opens, click column header to verify sorting works, verify search term filters grouped results

### Implementation for User Story 3

- [X] T018 [US3] Verify row click handler (onRowClicked) works for data rows in both new views - no code change expected as existing logic guards group rows in `frontend/src/components/SubscriptionList.tsx`
- [X] T019 [US3] Verify column sorting is enabled for Provider and Authentication Method columns in new view column definitions in `frontend/src/components/SubscriptionList.tsx`
- [X] T020 [US3] Verify search filtering applies before view filtering to maintain search state in `frontend/src/pages/SubscriptionsPage.tsx`

**Checkpoint**: All user stories should now be independently functional with full interactivity

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T021 Run quickstart.md verification checklist manually
- [ ] T022 Verify toggle mutual exclusivity works across all four view buttons
- [ ] T023 Verify Status Bar shows correct row count in both new views
- [ ] T024 Verify null/empty grouping values display as appropriate placeholder groups

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (can run parallel with US1)
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (verification tasks)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1
- **User Story 3 (P2)**: Depends on US1 and US2 being complete (verification of interactivity)

### Within Each User Story

- Filter logic before column selection
- Column selection before grid props update
- Grid props update before viewMode prop passing

### Parallel Opportunities

- T003, T004, T005, T006 can all run in parallel (different constants in same file, but independent definitions)
- US1 and US2 can be implemented in parallel after Foundational phase

---

## Parallel Example: Foundational Phase

```bash
# Launch all column definition tasks together:
Task: "Define BY_DISTRIBUTION_COLUMNS constant in frontend/src/components/SubscriptionList.tsx"
Task: "Define BY_AUTHENTICATION_COLUMNS constant in frontend/src/components/SubscriptionList.tsx"
Task: "Define distributionGroupColumnDef in frontend/src/components/SubscriptionList.tsx"
Task: "Define authenticationGroupColumnDef in frontend/src/components/SubscriptionList.tsx"
```

## Parallel Example: User Stories 1 & 2

```bash
# After Foundational phase, launch both stories in parallel:
# Developer A: User Story 1 (By Distribution)
# Developer B: User Story 2 (By Authentication)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003-T006)
3. Complete Phase 3: User Story 1 (T007-T012)
4. **STOP and VALIDATE**: Test By Distribution view independently
5. Demo if ready

### Full Feature Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (By Distribution works)
3. Add User Story 2 → Test independently (By Authentication works)
4. Verify User Story 3 → Confirm interactivity across both views
5. Complete Polish phase → Final validation

---

## Notes

- This is a frontend-only feature - no backend changes
- All tasks modify only two files: `SubscriptionList.tsx` and `SubscriptionsPage.tsx`
- Pattern reuses existing AI Tools view implementation
- Manual testing per constitution - no automated tests required
- Commit after each task or logical group
- US3 tasks are mostly verification - existing patterns should work
