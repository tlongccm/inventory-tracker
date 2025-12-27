# Tasks: Pivot View Group Expand/Collapse Controls

**Input**: Design documents from `/specs/014-group-expand-collapse/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Manual testing per constitution (acceptable for UI/CRUD). No automated tests required.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` (React/TypeScript/Vite)
- **Backend**: No changes required (frontend-only feature)

---

## Phase 1: Setup

**Purpose**: No setup required - feature adds to existing infrastructure

*No tasks in this phase - all dependencies already installed (AG Grid Enterprise)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend component interface to expose expand/collapse methods

**⚠️ CRITICAL**: These changes must be complete before button UI can call the methods

- [X] T001 Extend SubscriptionListHandle interface with expandAllGroups and collapseAllGroups methods in frontend/src/components/SubscriptionList.tsx
- [X] T002 Implement expandAllGroups method using gridRef.current?.api.expandAll() in frontend/src/components/SubscriptionList.tsx
- [X] T003 Implement collapseAllGroups method using gridRef.current?.api.collapseAll() in frontend/src/components/SubscriptionList.tsx

**Checkpoint**: Component ref interface now exposes expand/collapse methods to parent

---

## Phase 3: User Story 1 - View Groups Collapsed by Default (Priority: P1) 🎯 MVP

**Goal**: All groups collapsed by default when activating any pivot view

**Independent Test**: Activate any pivot view and verify all groups show as collapsed with expand indicators

### Implementation for User Story 1

- [X] T004 [US1] Change groupDefaultExpanded from 1 to 0 for grouped views in frontend/src/components/SubscriptionList.tsx

**Checkpoint**: All pivot views now start with groups collapsed by default

---

## Phase 4: User Story 2 - Expand All Groups with One Click (Priority: P1)

**Goal**: Users can expand all groups at once with a single button click

**Independent Test**: Click "Expand All" button and verify all groups expand to show child rows

### Implementation for User Story 2

- [X] T005 [US2] Add handleExpandAll callback function in frontend/src/pages/SubscriptionsPage.tsx
- [X] T006 [US2] Add "Expand All" button in view-group-toggle area after pivot toggles in frontend/src/pages/SubscriptionsPage.tsx

**Checkpoint**: Expand All button works - all groups expand when clicked

---

## Phase 5: User Story 3 - Collapse All Groups with One Click (Priority: P1)

**Goal**: Users can collapse all groups at once with a single button click

**Independent Test**: Click "Collapse All" button and verify all groups collapse to hide child rows

### Implementation for User Story 3

- [X] T007 [US3] Add handleCollapseAll callback function in frontend/src/pages/SubscriptionsPage.tsx
- [X] T008 [US3] Add "Collapse All" button adjacent to Expand All button in frontend/src/pages/SubscriptionsPage.tsx

**Checkpoint**: Collapse All button works - all groups collapse when clicked

---

## Phase 6: User Story 4 - Button Visibility Based on View Mode (Priority: P2)

**Goal**: Expand/Collapse buttons only visible when a pivot view is active

**Independent Test**: Toggle between default and pivot views, verify buttons appear/disappear appropriately

### Implementation for User Story 4

- [X] T009 [US4] Wrap Expand All and Collapse All buttons in conditional rendering based on activeViewMode !== 'default' in frontend/src/pages/SubscriptionsPage.tsx

**Checkpoint**: Buttons hidden in default view, visible in pivot views

---

## Phase 7: Polish & Validation

**Purpose**: Final verification and documentation

- [X] T010 Run manual validation per quickstart.md verification checklist
- [X] T011 Verify view switching resets groups to collapsed state (FR-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skip - no setup needed
- **Phase 2 (Foundational)**: No dependencies - start immediately
- **Phase 3-6 (User Stories)**: All depend on Phase 2 completion
  - US1 can start after Phase 2
  - US2 depends on Phase 2 (needs expandAllGroups method)
  - US3 depends on Phase 2 (needs collapseAllGroups method)
  - US4 depends on US2 and US3 (buttons must exist to be conditionally rendered)
- **Phase 7 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Foundational
- **User Story 2 (P1)**: Depends on Foundational (T001-T003)
- **User Story 3 (P1)**: Depends on Foundational (T001-T003)
- **User Story 4 (P2)**: Depends on US2 and US3 (buttons must exist first)

### Within Each Phase

- T001-T003 must be sequential (same file, building on each other)
- T005-T006 sequential within US2 (handler before button)
- T007-T008 sequential within US3 (handler before button)
- T009 depends on T006 and T008 (buttons must exist)

### Parallel Opportunities

- After Phase 2 completes:
  - US1 (T004) can run in parallel with US2/US3 prep
  - US2 (T005-T006) and US3 (T007-T008) could run in parallel if different developers

---

## Parallel Example: After Foundational Phase

```bash
# These can run in parallel (different concerns):
Task T004: Change groupDefaultExpanded to 0 (US1)
Task T005: Add handleExpandAll callback (US2 prep)
Task T007: Add handleCollapseAll callback (US3 prep)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: User Story 1 (T004)
3. **STOP and VALIDATE**: Groups now collapsed by default
4. Continue with remaining stories

### Incremental Delivery

1. Foundational → Ref interface ready
2. Add US1 → Groups collapsed by default → Validate
3. Add US2 → Expand All works → Validate
4. Add US3 → Collapse All works → Validate
5. Add US4 → Buttons hidden in default view → Validate
6. Polish → Final verification

### Files Modified

| File | Tasks | Changes |
|------|-------|---------|
| frontend/src/components/SubscriptionList.tsx | T001-T004 | Interface extension, method implementations, groupDefaultExpanded change |
| frontend/src/pages/SubscriptionsPage.tsx | T005-T009 | Button handlers, button JSX, conditional rendering |

---

## Notes

- All implementation is frontend-only (no backend changes)
- Uses existing AG Grid Enterprise API (expandAll, collapseAll)
- Grid already remounts on view switch (key prop) - handles FR-007 naturally
- Manual testing acceptable per constitution
- Button styling should match existing UI patterns
