# Implementation Plan: Equipment Fields Update

**Branch**: `005-equipment-fields-update` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-equipment-fields-update/spec.md`

## Summary

Update equipment tracking to support CSV bulk import with enhanced field validation (IPv4, MAC address normalization, CPU speed formatting), extensible enumerations stored as validated strings, a new Purpose field, and a two-phase import workflow with preview/confirmation before committing changes. Equipment IDs support auto-generation, uppercase normalization, and uniqueness validation. Additionally, the Notes field in Equipment, Software, and Subscription detail views renders as markdown with XSS sanitization.

## Technical Context

**Language/Version**: Python 3.11, TypeScript 5.x
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic (backend); React 18, Vite (frontend)
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: pytest (backend), manual testing acceptable per constitution
**Target Platform**: Web application (localhost:8000 API, localhost:3000 frontend)
**Project Type**: Web application with frontend/backend separation
**Performance Goals**: Field validation errors reported within 1 second
**Constraints**: IPv4 only, title case enumerations, Equipment ID format {TYPE}-NNNN
**Scale/Scope**: ~54 equipment records from source CSV

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Enums stored as validated strings (no lookup tables). Direct field validation without abstraction layers. |
| II. Web Application Structure | ✅ PASS | Follows existing backend/frontend separation. API endpoints for validation preview, frontend for UI. |
| III. Data Integrity | ✅ PASS | Validation at API boundary. Equipment ID uniqueness enforced. Preview before commit prevents bad imports. |
| IV. Pragmatic Testing | ✅ PASS | Manual testing acceptable for CRUD and import workflow per constitution. |
| V. Incremental Delivery | ✅ PASS | Features deliverable incrementally: (1) field validation, (2) CSV mappings, (3) preview workflow. |

## Project Structure

### Documentation (this feature)

```text
specs/005-equipment-fields-update/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # API contract updates
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── computers.py       # Update: preview/validate endpoints
│   ├── models/
│   │   └── equipment.py       # Update: add purpose field, relax enum constraints
│   ├── schemas/
│   │   └── equipment.py       # Update: add validation schemas, preview types
│   ├── services/
│   │   ├── csv_service.py     # Update: preview mode, field normalization
│   │   └── validators.py      # NEW: IPv4, MAC, CPU speed validators
│   └── utils/
│       └── normalizers.py     # NEW: title case, MAC format, CPU speed format
└── tests/                     # Optional: validation unit tests

frontend/
├── src/
│   ├── components/
│   │   ├── ImportModal.tsx           # Update: two-phase preview/confirm workflow
│   │   ├── ImportPreview.tsx         # NEW: preview table with validation status
│   │   ├── ImportRowEditor.tsx       # NEW: inline editing for problematic rows
│   │   ├── EquipmentForm.tsx         # Update: add Purpose field, validation
│   │   ├── EquipmentDetail.tsx       # Update: render Notes as markdown
│   │   ├── SoftwareDetail.tsx        # Update: render Notes as markdown
│   │   ├── SubscriptionDetail.tsx    # Update: render Notes as markdown
│   │   └── MarkdownRenderer.tsx      # NEW: reusable markdown component with sanitization
│   ├── types/
│   │   └── equipment.ts              # Update: preview types, validation errors
│   └── services/
│       └── api.ts                    # Update: preview/validate API calls
└── tests/                            # Optional: component tests
```

**Structure Decision**: Web application (Option 2) - existing backend/frontend separation is maintained. New components added to existing structure.

## Complexity Tracking

> No constitution violations requiring justification. Design follows simplicity principles.

| Decision | Rationale |
|----------|-----------|
| Validated strings instead of lookup tables | Simpler, no schema changes for new values, per clarification decision |
| Preview in frontend, validation in backend | Clear separation, backend is source of truth for validation |
| Single preview endpoint returning all validation results | Reduces round-trips, simpler frontend logic |
| react-markdown + DOMPurify for markdown rendering | Standard React markdown solution with XSS protection |

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts created.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | 2 new backend files (validators.py, normalizers.py), 2 new frontend components. No unnecessary abstractions. |
| II. Web Application Structure | ✅ PASS | API contracts defined in OpenAPI. Clear separation maintained. |
| III. Data Integrity | ✅ PASS | Comprehensive validation rules documented. Migration plan preserves existing data. |
| IV. Pragmatic Testing | ✅ PASS | Quickstart includes manual test scenarios. No mandatory test coverage. |
| V. Incremental Delivery | ✅ PASS | Can deliver in phases: (1) backend validators/migration, (2) preview API, (3) frontend workflow. |

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](./research.md) | Technical decisions and patterns |
| Data Model | [data-model.md](./data-model.md) | Entity changes, field mappings, migration plan |
| API Contract | [contracts/openapi.yaml](./contracts/openapi.yaml) | New preview/confirm endpoints |
| Quickstart | [quickstart.md](./quickstart.md) | Setup and testing guide |

## Next Steps

Run `/speckit.tasks` to generate actionable task list for implementation.
