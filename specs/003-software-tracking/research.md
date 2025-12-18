# Research: Software Inventory Tracking

**Date**: 2025-12-16

## Existing Pattern Analysis

### Equipment Module Patterns (Reference)

Analyzed the existing equipment tracking implementation to ensure consistency:

| Pattern | Equipment Implementation | Software Adaptation |
|---------|-------------------------|---------------------|
| ID Generation | `{TYPE}-NNNN` (PC-0001, MON-0001) | `SW-NNNN` (SW-0001) |
| Soft Delete | `is_deleted`, `deleted_at` fields | Same pattern |
| Assignment History | Track user changes over time | Track installation changes on equipment |
| API Structure | `/api/v1/computers/*` | `/api/v1/software/*` |
| Service Layer | `EquipmentService` class | `SoftwareService` class |
| Frontend Page | `InventoryPage.tsx` | `SoftwarePage.tsx` |

### Decision Records

#### Decision 1: Software Entity Fields

**Decision**: Create standalone Software entity with license-focused fields.

**Rationale**: Software inventory has fundamentally different attributes than hardware:
- No physical specs (CPU, RAM, storage)
- License management is primary concern
- Version tracking is essential
- Multiple installations of same software

**Alternatives Considered**:
1. ~~Extend Equipment model with software fields~~ - Rejected: Violates single responsibility, bloats equipment table
2. ~~Generic Asset model~~ - Rejected: Over-abstraction, violates Simplicity First

**Fields Selected**:
- Core: `software_id`, `name`, `version`, `publisher`
- License: `license_type`, `license_key`, `license_count`, `expiration_date`
- Common: `cost`, `purchase_date`, `notes`, `status`
- Metadata: `created_at`, `updated_at`, `is_deleted`, `deleted_at`

#### Decision 2: Software-Equipment Relationship

**Decision**: Start with optional single equipment reference, defer many-to-many.

**Rationale**:
- Many software packages are not installed on specific equipment (floating licenses)
- Simplest approach that provides value
- Can extend to full installation tracking later

**Implementation**:
- `installed_on_equipment_id` - optional FK to Equipment
- Future: `software_installations` junction table for full tracking

**Alternatives Considered**:
1. ~~Full many-to-many from start~~ - Rejected: YAGNI, adds complexity without immediate need
2. ~~No equipment relationship~~ - Rejected: Loses valuable context for installed software

#### Decision 3: License Types

**Decision**: Enum with common license types.

**Options Selected**:
- `PERPETUAL` - One-time purchase, no expiration
- `SUBSCRIPTION` - Requires renewal, has expiration date
- `VOLUME` - Multi-seat license
- `OEM` - Tied to hardware
- `FREEWARE` - No cost
- `OPEN_SOURCE` - Open source licenses

**Rationale**: Covers vast majority of software licensing models in corporate environments.

#### Decision 4: Software Status

**Decision**: Reuse similar status pattern as equipment with software-specific values.

**Options Selected**:
- `ACTIVE` - Currently in use
- `INACTIVE` - Not currently deployed
- `EXPIRED` - License has expired
- `RETIRED` - No longer in use, kept for records

#### Decision 5: Navigation Structure

**Decision**: Add "Software" as third top-level navigation item.

**Rationale**:
- Software tracking is peer-level concern with equipment
- Same user will manage both
- Consistent navigation pattern

**Implementation**:
- Nav order: Equipment | Software | Admin
- URL: `/software`

#### Decision 6: Admin Panel Update

**Decision**: Extend existing Admin panel to show deleted software alongside deleted equipment.

**Rationale**:
- Single admin interface for recovery operations
- Consistent with soft delete pattern
- Avoids separate admin page per entity type

## Technology Decisions

### No New Dependencies Required

The software tracking feature uses only existing dependencies:
- Backend: FastAPI, SQLAlchemy, Pydantic (already installed)
- Frontend: React, react-router-dom, TypeScript (already installed)

### Database Migration

- Use Alembic for schema migration (consistent with existing pattern)
- Single migration file for `software` table
- No breaking changes to existing equipment schema

## API Design Decisions

### Endpoint Consistency

Following equipment API patterns exactly:

| Operation | Equipment | Software |
|-----------|-----------|----------|
| List | GET /api/v1/computers | GET /api/v1/software |
| Create | POST /api/v1/computers | POST /api/v1/software |
| Get | GET /api/v1/computers/{id} | GET /api/v1/software/{id} |
| Update | PUT /api/v1/computers/{id} | PUT /api/v1/software/{id} |
| Delete | DELETE /api/v1/computers/{id} | DELETE /api/v1/software/{id} |
| Restore | POST /api/v1/computers/{id}/restore | POST /api/v1/software/{id}/restore |
| Export | GET /api/v1/computers/export | GET /api/v1/software/export |
| Import | POST /api/v1/computers/import | POST /api/v1/software/import |

### Query Parameters

Software list filtering:
- `license_type` - Filter by license type
- `status` - Filter by status
- `publisher` - Filter by publisher name
- `search` - Universal search across all fields
- `expiring_within_days` - Find expiring subscriptions

## Frontend Design Decisions

### Component Reuse

Maximize reuse of existing patterns:
- SearchBox component: Reuse as-is
- ViewGroupToggle pattern: Adapt for software column groups
- Import/Export modals: Reuse pattern, new implementation

### Software-Specific Column Groups

- **Always Visible**: Software ID, Name, Version, Publisher, Status
- **License View**: License Type, License Count, License Key, Expiration Date
- **Details View**: Cost, Purchase Date, Notes, Installed On

## Unknowns Resolved

| Unknown | Resolution |
|---------|------------|
| License key security | Store in plain text for internal use; not a security-critical application |
| Multi-version tracking | Single version field per software record; create new record for new versions |
| Bulk license operations | Defer to future enhancement; manual entry sufficient for initial release |

## References

- Existing Equipment model: `backend/app/models/equipment.py`
- Existing Equipment API: `backend/app/api/computers.py`
- Existing InventoryPage: `frontend/src/pages/InventoryPage.tsx`
- Constitution principles: `.specify/memory/constitution.md`
