# Tasks: URL Features

**Input**: Design documents from `/specs/010-url-features/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Manual testing per constitution (UI features) - no automated test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for this feature (frontend-only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and URL utility structure

- [X] T001 Create URL params utility file in frontend/src/utils/urlParams.ts
- [X] T002 [P] Add clickable-url CSS styles in frontend/src/index.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create useUrlState custom hook in frontend/src/hooks/useUrlState.ts
- [X] T004 Implement parseUrlParams function in frontend/src/utils/urlParams.ts
- [X] T005 [P] Implement serializeFilters function in frontend/src/utils/urlParams.ts
- [X] T006 Create ShareLinkButton component in frontend/src/components/ShareLinkButton.tsx
- [X] T007 Add toast notification for copy success/failure in frontend/src/components/ShareLinkButton.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Clickable Subscription URLs (Priority: P1) 🎯 MVP

**Goal**: Make subscription URL fields clickable hyperlinks that open in new browser tabs

**Independent Test**: Navigate to Subscriptions tab, click on any URL cell, verify new browser tab opens

### Implementation for User Story 1

- [X] T008 [US1] Update SubscriptionList.tsx to render URL field as anchor tag in frontend/src/components/SubscriptionList.tsx
- [X] T009 [US1] Add target="_blank" and rel="noopener noreferrer" to URL anchor in frontend/src/components/SubscriptionList.tsx
- [X] T010 [US1] Handle empty/null URL with dash placeholder in frontend/src/components/SubscriptionList.tsx
- [X] T011 [US1] Apply clickable-url CSS class for visual distinction in frontend/src/components/SubscriptionList.tsx

**Checkpoint**: User Story 1 complete - subscription URLs are clickable and open in new tabs

---

## Phase 4: User Story 2 - Share Current View Configuration (Priority: P1)

**Goal**: Enable users to copy a shareable link that captures current view settings

**Independent Test**: Configure filters, click "Copy Link", paste in new browser, verify same configuration

### Implementation for User Story 2

- [X] T012 [P] [US2] Add ShareLinkButton to InventoryPage toolbar in frontend/src/pages/InventoryPage.tsx
- [X] T013 [P] [US2] Add ShareLinkButton to SoftwarePage toolbar in frontend/src/pages/SoftwarePage.tsx
- [X] T014 [P] [US2] Add ShareLinkButton to SubscriptionsPage toolbar in frontend/src/pages/SubscriptionsPage.tsx
- [X] T015 [US2] Update ShareLinkButton to copy current URL with all params in frontend/src/components/ShareLinkButton.tsx
- [X] T016 [US2] Implement URL loading from params on InventoryPage mount in frontend/src/pages/InventoryPage.tsx
- [X] T017 [US2] Implement URL loading from params on SoftwarePage mount in frontend/src/pages/SoftwarePage.tsx
- [X] T018 [US2] Implement URL loading from params on SubscriptionsPage mount in frontend/src/pages/SubscriptionsPage.tsx

**Checkpoint**: User Story 2 complete - users can copy and share configuration URLs

---

## Phase 5: User Story 3 - Automatic URL Update on Configuration Change (Priority: P2)

**Goal**: Browser URL automatically updates as users change tabs, filters, and view settings

**Independent Test**: Change a filter and observe browser URL updates; use back button to return to previous state

### Implementation for User Story 3

- [X] T019 [US3] Add URL state sync on filter change in InventoryPage in frontend/src/pages/InventoryPage.tsx
- [X] T020 [US3] Add URL state sync on filter change in SoftwarePage in frontend/src/pages/SoftwarePage.tsx
- [X] T021 [US3] Add URL state sync on filter change in SubscriptionsPage in frontend/src/pages/SubscriptionsPage.tsx
- [X] T022 [P] [US3] Add URL state sync on view group toggle in InventoryPage in frontend/src/pages/InventoryPage.tsx
- [X] T023 [P] [US3] Add URL state sync on view group toggle in SoftwarePage in frontend/src/pages/SoftwarePage.tsx
- [X] T024 [P] [US3] Add URL state sync on view group toggle in SubscriptionsPage in frontend/src/pages/SubscriptionsPage.tsx
- [X] T025 [US3] Add URL state sync on sort change across all pages in frontend/src/hooks/useUrlState.ts
- [X] T026 [US3] Implement history.replaceState for filter changes in frontend/src/hooks/useUrlState.ts
- [X] T027 [US3] Implement history.pushState for tab changes in frontend/src/hooks/useUrlState.ts

**Checkpoint**: User Story 3 complete - URL updates automatically, back/forward buttons work

---

## Phase 6: User Story 4 - Direct Navigation to Specific Tab (Priority: P2)

**Goal**: Users can navigate directly to a specific tab using a URL parameter

**Independent Test**: Enter URL with tab=subscriptions, verify Subscriptions tab loads

### Implementation for User Story 4

Note: App uses route-based navigation (/, /software, /subscriptions) which provides direct tab access via URL.

- [X] T028 [US4] Parse tab parameter from URL on app load in frontend/src/App.tsx (N/A - routes handle this)
- [X] T029 [US4] Add tab parameter encoding when switching tabs in frontend/src/App.tsx (N/A - Link component handles this)
- [X] T030 [US4] Default to Equipment tab when no tab parameter in frontend/src/App.tsx (/ route is default)
- [X] T031 [US4] Update URL when tab changes in frontend/src/App.tsx (N/A - routes auto-update)

**Checkpoint**: User Story 4 complete - direct tab navigation via URL works

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Handle invalid/malformed URL parameters gracefully in frontend/src/utils/urlParams.ts
- [X] T033 [P] Handle non-existent filter values by ignoring them in frontend/src/utils/urlParams.ts
- [X] T034 Verify URL length stays within browser limits in frontend/src/utils/urlParams.ts
- [X] T035 Run quickstart.md verification steps for all features (see quickstart.md for steps)
- [ ] T036 Manual testing: clickable URLs open in new tabs (READY FOR TESTING)
- [ ] T037 Manual testing: shareable URLs restore exact view state (READY FOR TESTING)
- [ ] T038 Manual testing: browser back/forward navigation works (READY FOR TESTING)
- [ ] T039 Manual testing: direct tab navigation via URL works (READY FOR TESTING)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (different components)
  - US3 depends on US2 (needs URL state foundation)
  - US4 depends on US3 (needs URL sync mechanism)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on US1
- **User Story 3 (P2)**: Depends on US2 infrastructure (URL params parsing)
- **User Story 4 (P2)**: Depends on US3 infrastructure (URL sync hooks)

### Within Each User Story

- Models/utilities before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T004 and T005 can run in parallel (different functions)
- T012, T013, T014 can run in parallel (different page files)
- T022, T023, T024 can run in parallel (different page files)
- T032 and T033 can run in parallel (different error cases)

---

## Parallel Example: User Story 2

```bash
# Launch ShareLinkButton additions to all pages in parallel:
Task: "Add ShareLinkButton to InventoryPage toolbar in frontend/src/pages/InventoryPage.tsx"
Task: "Add ShareLinkButton to SoftwarePage toolbar in frontend/src/pages/SoftwarePage.tsx"
Task: "Add ShareLinkButton to SubscriptionsPage toolbar in frontend/src/pages/SubscriptionsPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Clickable URLs)
4. **STOP and VALIDATE**: Test clickable URLs work
5. Deploy/demo if ready - users can already click URLs!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Test independently → Deploy (shareable links)
4. Add User Story 3 → Test independently → Deploy (auto URL update)
5. Add User Story 4 → Test independently → Deploy (direct tab navigation)
6. Complete Polish → Final verification

### Recommended Priority

Since US1 and US2 are both P1:
- **US1 first**: Simplest, provides immediate value (5 minutes of work)
- **US2 second**: Builds on US1, enables collaboration
- **US3 and US4**: P2 enhancements that complete the URL feature set

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing per constitution (UI features)
