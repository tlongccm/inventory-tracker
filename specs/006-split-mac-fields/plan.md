# Implementation Plan: Split MAC Address Fields

**Branch**: `006-split-mac-fields` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-split-mac-fields/spec.md`

## Summary

Split the existing `mac_address` field into two separate fields: `mac_lan` (wired LAN MAC) and `mac_wlan` (wireless LAN MAC). This involves database migration, backend schema updates, frontend form changes, and CSV import/export modifications with backward compatibility for legacy single-column imports.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, React, Vite
**Storage**: SQLite (development), MySQL 8.0+ (production via `DATABASE_URL` env var)
**Testing**: pytest (backend), manual testing acceptable per constitution
**Target Platform**: Web application (internal network)
**Project Type**: Web (frontend/backend separation)
**Performance Goals**: N/A (simple field split, no performance impact)
**Constraints**: Backward-compatible CSV import for legacy "MAC Address" column
**Scale/Scope**: Existing Equipment entity (~100s of records expected)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | PASS | Simple field split, no new abstractions, follows existing patterns |
| II. Web Application Structure | PASS | Backend API + Frontend React, matches existing architecture |
| III. Data Integrity | PASS | Migration preserves existing data in mac_lan field; validation at API boundary |
| IV. Pragmatic Testing | PASS | Manual testing acceptable for this CRUD modification |
| V. Incremental Delivery | PASS | Feature is self-contained, independently testable |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-split-mac-fields/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - no unknowns)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # Updated API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── alembic/
│   └── versions/
│       └── 004_split_mac_address_fields.py  # New migration
├── app/
│   ├── models/
│   │   └── equipment.py      # Update: mac_address → mac_lan, add mac_wlan
│   ├── schemas/
│   │   └── equipment.py      # Update: all schemas with new fields
│   └── services/
│       ├── csv_service.py    # Update: import/export mappings
│       └── validators.py     # Reuse existing MAC validation

frontend/
├── src/
│   ├── components/
│   │   ├── EquipmentForm.tsx    # Update: two MAC input fields
│   │   ├── EquipmentDetail.tsx  # Update: display both MACs
│   │   ├── EquipmentList.tsx    # Update: column if MAC shown
│   │   └── ImportModal.tsx      # Update: handle dual columns
│   ├── services/
│   │   └── api.ts               # Update: TypeScript types
│   └── types/
│       └── equipment.ts         # Update: Equipment interface
```

**Structure Decision**: Web application with frontend/backend separation (Option 2). Matches existing project structure exactly.

## Complexity Tracking

> No violations requiring justification. This is a straightforward field split following existing patterns.
