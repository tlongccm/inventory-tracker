# Implementation Plan: Tab Layout Consistency

**Branch**: `009-tab-layout-consistency` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-tab-layout-consistency/spec.md`

**Note**: This plan standardizes UI layout across Software and Subscriptions tabs to match the Equipment tab pattern.

## Summary

Update Software and Subscriptions tab layouts to match the Equipment tab's consistent structure: Toolbar > Filter Bar > Search Box > View Group Toggle > List. The Software tab needs its search box moved above view buttons. The Subscriptions tab needs filter label removal, search box addition, and four placeholder view group buttons (AI Tools, SA Resources, By Distribution, By Category).

## Technical Context

**Language/Version**: TypeScript/React (frontend only)
**Primary Dependencies**: React, existing SearchBox component, existing ViewGroupToggle component
**Storage**: N/A (UI-only changes, view preferences in localStorage)
**Testing**: Manual testing (per constitution - UI changes)
**Target Platform**: Web application (internal network)
**Project Type**: web (frontend only for this feature)
**Performance Goals**: Standard web app responsiveness (no new API calls)
**Constraints**: Must reuse existing components where possible
**Scale/Scope**: 3 React page components, 1 filter bar component update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Reusing existing components, no new abstractions |
| II. Web Application Structure | ✅ PASS | Frontend-only changes, no backend impact |
| III. Data Integrity | ✅ N/A | No data mutations in this feature |
| IV. Pragmatic Testing | ✅ PASS | Manual testing acceptable for UI layout changes |
| V. Incremental Delivery | ✅ PASS | Can deliver Software and Subscriptions changes independently |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/009-tab-layout-consistency/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for UI feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBox.tsx              # Existing - reuse
│   │   ├── ViewGroupToggle.tsx        # Existing - reuse
│   │   ├── FilterBar.tsx              # Existing - reference for style
│   │   ├── SoftwareFilterBar.tsx      # No changes needed
│   │   └── SubscriptionFilterBar.tsx  # Update: remove external labels
│   ├── pages/
│   │   ├── InventoryPage.tsx          # Reference for layout pattern
│   │   ├── SoftwarePage.tsx           # Update: reorder search/view buttons
│   │   └── SubscriptionsPage.tsx      # Update: add search, view buttons
│   ├── utils/
│   │   └── subscriptionColumns.ts     # New: view group definitions
│   └── hooks/
│       └── useViewPreferences.ts      # Existing - may extend for subscriptions
```

**Structure Decision**: Web application structure with frontend-only changes. No backend modifications required.

## Complexity Tracking

> No violations to justify - implementation follows existing patterns.

