# Implementation Plan: URL Features

**Branch**: `010-url-features` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-url-features/spec.md`

**Note**: This plan covers two feature areas: clickable subscription URLs and shareable app configuration URLs with browser history support.

## Summary

Implement two URL-related features: (1) Make subscription URL fields clickable hyperlinks that open in new browser tabs, and (2) Enable shareable/bookmarkable app configuration URLs that encode the current tab, filters, view groups, and sort order. The browser URL will automatically update as users change settings, supporting back/forward navigation.

## Technical Context

**Language/Version**: TypeScript/React (frontend), Python 3.11/FastAPI (backend - minimal changes)
**Primary Dependencies**: React, react-router-dom (existing), URLSearchParams API
**Storage**: N/A (URL state is transient; localStorage for view preferences unchanged)
**Testing**: Manual testing (per constitution - UI changes)
**Target Platform**: Web application (internal network)
**Project Type**: web (primarily frontend, minor backend display changes)
**Performance Goals**: Standard web app responsiveness (no additional API calls for URL features)
**Constraints**: URL length must stay within browser limits (~2000 chars)
**Scale/Scope**: 3 React page components, 1 list component update, routing configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Using native browser APIs (URLSearchParams, history), no new dependencies |
| II. Web Application Structure | ✅ PASS | Frontend changes with existing react-router-dom |
| III. Data Integrity | ✅ N/A | No data mutations; URL state is transient |
| IV. Pragmatic Testing | ✅ PASS | Manual testing acceptable for UI features |
| V. Incremental Delivery | ✅ PASS | Clickable URLs and shareable URLs can be delivered separately |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/010-url-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for URL feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── SubscriptionList.tsx     # Update: render URL field as clickable link
│   │   ├── ShareLinkButton.tsx      # New: copy shareable URL to clipboard
│   │   └── FilterBar.tsx            # Reference for filter state structure
│   ├── pages/
│   │   ├── InventoryPage.tsx        # Update: read/write URL params, add ShareLinkButton
│   │   ├── SoftwarePage.tsx         # Update: read/write URL params, add ShareLinkButton
│   │   └── SubscriptionsPage.tsx    # Update: read/write URL params, add ShareLinkButton
│   ├── hooks/
│   │   └── useUrlState.ts           # New: custom hook for URL state synchronization
│   ├── utils/
│   │   └── urlParams.ts             # New: URL encoding/decoding utilities
│   └── App.tsx                      # Update: routing configuration if needed
```

**Structure Decision**: Web application structure with frontend-only changes. The clickable URL feature is a display change in SubscriptionList. The shareable URL feature requires a new hook and utilities for URL state management.

## Complexity Tracking

> No violations to justify - implementation uses native browser APIs.

