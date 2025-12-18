# Implementation Plan: Software Inventory Tracking

**Branch**: `003-software-tracking` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: User request: "Add another tab or page to the current app to track software."

## Summary

Add a new "Software" tab/page to the Equipment Inventory Tracker to manage software licenses and installations. The feature will mirror the equipment tracking patterns while adding software-specific fields for version management and license tracking. Software can be linked to equipment (e.g., which PCs have which software installed).

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, React 18, react-router-dom, Vite
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: pytest (backend), manual testing (frontend per constitution)
**Target Platform**: Web application (localhost/internal network)
**Project Type**: Web application with frontend/backend separation
**Performance Goals**: <500ms search response, <1s page load
**Constraints**: No authentication required, soft delete pattern
**Scale/Scope**: Hundreds of software entries, single admin user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Reuses existing patterns from equipment tracking; no new abstractions |
| II. Web Application Structure | ✅ PASS | Same frontend/backend separation; new API router and React page |
| III. Data Integrity | ✅ PASS | Validation at API boundaries, database constraints for uniqueness |
| IV. Pragmatic Testing | ✅ PASS | Focus on API tests for critical paths; manual UI testing acceptable |
| V. Incremental Delivery | ✅ PASS | Delivered as single feature increment providing standalone value |

**Gate Status**: ✅ PASS - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/003-software-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # Software API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── equipment.py           # Existing
│   │   └── software.py            # NEW: Software model
│   ├── schemas/
│   │   ├── equipment.py           # Existing
│   │   └── software.py            # NEW: Software schemas
│   ├── services/
│   │   ├── equipment_service.py   # Existing
│   │   ├── csv_service.py         # Existing
│   │   └── software_service.py    # NEW: Software service
│   └── api/
│       ├── computers.py           # Existing
│       └── software.py            # NEW: Software API routes
└── tests/
    └── test_software.py           # NEW: Software API tests

frontend/
├── src/
│   ├── pages/
│   │   ├── InventoryPage.tsx      # Existing
│   │   ├── AdminPage.tsx          # Existing (update to include software)
│   │   └── SoftwarePage.tsx       # NEW: Software inventory page
│   ├── components/
│   │   ├── SoftwareList.tsx       # NEW: Software table
│   │   ├── SoftwareForm.tsx       # NEW: Create/edit form
│   │   └── SoftwareDetail.tsx     # NEW: Detail view
│   ├── types/
│   │   ├── equipment.ts           # Existing
│   │   └── software.ts            # NEW: Software types
│   └── services/
│       └── api.ts                 # UPDATE: Add software API methods
```

**Structure Decision**: Web application (Option 2) - extends existing frontend/backend structure with parallel software tracking components.

## Key Design Decisions

### 1. Software-Equipment Relationship
- Initial implementation: Software tracked independently (no equipment linking)
- Future consideration: Installation tracking linking software to equipment

### 2. Software ID Format
- Format: `SW-NNNN` (e.g., SW-0001, SW-0002)
- Follows same pattern as equipment IDs for consistency

### 3. License Tracking
- Track license type via Type field (Subscription, Perpetual, Volume, OEM, Freeware, Open Source)
- License key storage via Key field (optional, for internal reference)

### 4. Reuse Existing Patterns
- Same soft delete pattern
- Same import/export CSV capability
- Same search and filter patterns

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |

## Implementation Phases

### Phase 0: Research (Complete)
- Confirmed existing patterns from equipment module
- No external research needed; internal consistency review sufficient

### Phase 1: Design Artifacts
- [ ] data-model.md - Software entity and relationships
- [ ] contracts/openapi.yaml - Software REST API
- [ ] quickstart.md - Setup and testing guide

### Phase 2: Tasks (via /speckit.tasks)
- Backend model and migrations
- Backend API routes and service
- Frontend page and components
- Integration testing
