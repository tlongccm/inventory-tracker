# Implementation Plan: Equipment Reassignment Feature

**Branch**: `001-computer-inventory` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: User request to allow selecting an existing piece of equipment to reassign it, with machine information copied over.

## Summary

Add equipment reassignment functionality that allows users to select existing equipment from the inventory and reassign it to a new user. When reassigning, the equipment's machine information (model, specs, performance data) remains with the equipment while only the assignment fields (primary_user, usage_type, equipment_name, assignment_date) change. This triggers automatic assignment history creation per FR-030.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic (backend); React 18, Vite (frontend)
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: pytest (backend), manual testing (frontend per Principle IV)
**Target Platform**: Web application (internal network)
**Project Type**: Web application (frontend/backend separation)
**Performance Goals**: Equipment list and reassignment operations < 3 seconds (SC-001)
**Constraints**: No authentication required, last-write-wins concurrency
**Scale/Scope**: ~500 equipment records, ~10 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First - PASS

| Check | Status | Notes |
|-------|--------|-------|
| YAGNI applied | ✅ | Feature directly requested by user; not speculative |
| Explicit code over abstractions | ✅ | Using existing update API pattern |
| Complexity only when needed | ✅ | Leveraging existing AssignmentHistory mechanism |
| No premature abstraction | ✅ | Reusing existing EquipmentForm component |
| Dependencies justified | ✅ | No new dependencies required |

### Principle II: Web Application Structure - PASS

| Check | Status | Notes |
|-------|--------|-------|
| Backend: FastAPI REST API | ✅ | Existing `/api/v1/computers` endpoints |
| Frontend: React UI | ✅ | Existing EquipmentForm and EquipmentList components |
| JSON over HTTP contracts | ✅ | Using existing Pydantic schemas |
| Independently deployable | ✅ | No cross-layer dependencies added |

### Principle III: Data Integrity - PASS

| Check | Status | Notes |
|-------|--------|-------|
| Input validation at API boundaries | ✅ | Existing Pydantic validation handles updates |
| Database constraints enforced | ✅ | FK constraints on AssignmentHistory |
| Changes traceable | ✅ | AssignmentHistory auto-created on assignment field changes |
| Error states handled explicitly | ✅ | 404 for non-existent equipment |

### Principle IV: Pragmatic Testing - PASS

| Check | Status | Notes |
|-------|--------|-------|
| Focus on critical paths | ✅ | Test reassignment updates history correctly |
| Avoid testing trivial code | ✅ | UI interactions tested manually |
| Manual testing acceptable for CRUD | ✅ | Form interaction tested via browser |

### Principle V: Incremental Delivery - PASS

| Check | Status | Notes |
|-------|--------|-------|
| Independently testable | ✅ | Can test reassignment without other features |
| Small working increment | ✅ | Single feature: reassignment UI |
| Provides user value | ✅ | Users can reassign equipment efficiently |

## Project Structure

### Documentation (this feature)

```text
specs/001-computer-inventory/
├── plan.md              # This file
├── research.md          # Phase 0 output (updated for reassignment)
├── data-model.md        # Phase 1 output (no changes needed)
├── quickstart.md        # Phase 1 output (updated)
├── contracts/           # Phase 1 output (minor updates)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── computers.py      # Existing endpoints (no changes)
│   ├── models/
│   │   ├── equipment.py      # Existing model (no changes)
│   │   └── assignment_history.py  # Existing model (no changes)
│   ├── schemas/
│   │   └── equipment.py      # Existing schemas (no changes)
│   └── services/
│       └── equipment_service.py  # Existing service (no changes)
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── EquipmentForm.tsx     # Existing - add reassignment UI
│   │   ├── EquipmentList.tsx     # Existing - add "Reassign" action
│   │   └── ReassignmentModal.tsx # NEW - equipment selection for reassignment
│   ├── pages/
│   │   └── InventoryPage.tsx     # Existing - wire up reassignment flow
│   ├── services/
│   │   └── api.ts                # Existing API client (no changes)
│   └── types/
│       └── equipment.ts          # Existing types (no changes)
└── tests/
```

**Structure Decision**: Web application structure (frontend/backend). The reassignment feature adds minimal new code by reusing the existing update API and AssignmentHistory mechanism. Only frontend changes are required: a new ReassignmentModal component and "Reassign" action in the equipment list.

## Complexity Tracking

No constitution violations to justify - feature uses existing patterns.

