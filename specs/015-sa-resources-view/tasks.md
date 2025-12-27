# Tasks: SA Resources Pivot View

**Input**: Design documents from `/specs/015-sa-resources-view/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Manual testing per constitution (acceptable for UI/CRUD). No automated tests required.

**Organization**: Single user story - simple feature with minimal tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` (React/TypeScript/Vite)
- **Backend**: No changes required (frontend-only feature)

---

## Phase 1: Setup

**Purpose**: No setup required - feature adds to existing infrastructure

*No tasks in this phase - all dependencies already installed*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define column set for SA Resources view

- [X] T001 Add SA_RESOURCES_COLUMNS column definition array in frontend/src/components/SubscriptionList.tsx

**Checkpoint**: Column definition ready for use in view mode switch

---

## Phase 3: User Story 1 - View SA Resources with Consultant Access (Priority: P1) 🎯 MVP

**Goal**: Filter to Active + Consultant subscriptions, display 5 specified columns

**Independent Test**: Click "SA Resources" toggle and verify only Active/Consultant records appear with correct columns

### Implementation for User Story 1

- [X] T002 [US1] Add sa_resources case to columnDefs switch statement in frontend/src/components/SubscriptionList.tsx
- [X] T003 [US1] Add sa_resources filtering logic (Active + Consultant) in filteredSubscriptions useMemo in frontend/src/pages/SubscriptionsPage.tsx

**Checkpoint**: SA Resources view shows filtered data with correct columns

---

## Phase 4: Polish & Validation

**Purpose**: Final verification

- [X] T004 Run manual validation per quickstart.md verification checklist
- [X] T005 Verify Expand All/Collapse All toggle works (no-op for flat list)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skip - no setup needed
- **Phase 2 (Foundational)**: No dependencies - start immediately
- **Phase 3 (User Story 1)**: Depends on Phase 2 (T001)
- **Phase 4 (Polish)**: Depends on Phase 3 completion

### Task Dependencies

- T001 must complete before T002 (column definition needed)
- T002 and T003 can run in parallel [P] (different files)
- T004 and T005 depend on T002 and T003

### Parallel Opportunities

After T001 completes:
- T002 (SubscriptionList.tsx) and T003 (SubscriptionsPage.tsx) can run in parallel

---

## Parallel Example: After Foundational Phase

```bash
# These can run in parallel (different files):
Task T002: Add sa_resources case to columnDefs in SubscriptionList.tsx
Task T003: Add sa_resources filtering logic in SubscriptionsPage.tsx
```

---

## Implementation Strategy

### MVP (Complete Feature)

1. Complete T001: Add SA_RESOURCES_COLUMNS
2. Complete T002 + T003 (parallel): Column switch + filtering
3. Complete T004 + T005: Validation

### Files Modified

| File | Tasks | Changes |
|------|-------|---------|
| frontend/src/components/SubscriptionList.tsx | T001, T002 | Add column definition, add switch case |
| frontend/src/pages/SubscriptionsPage.tsx | T003 | Add filtering logic |

---

## Notes

- All implementation is frontend-only (no backend changes)
- SA Resources toggle already exists (placeholder from feature 013)
- No grouping - flat list display
- Expand All/Collapse All works but has no effect (no groups)
- Manual testing acceptable per constitution
