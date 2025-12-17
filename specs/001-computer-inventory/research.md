# Research: Computer Inventory Tracker

**Date**: 2025-12-15
**Feature**: 001-computer-inventory

## Technology Decisions

### Backend Framework: FastAPI

**Decision**: Use FastAPI for the REST API backend.

**Rationale**:
- Mandated by project constitution (Principle II: Web Application Structure)
- Built-in OpenAPI documentation generation
- Pydantic integration for request/response validation
- Async support (though not required for this scale)
- Simple, minimal boilerplate

**Alternatives Considered**:
- Django REST Framework: More batteries-included but heavier; overkill for simple CRUD
- Flask: Simpler but lacks built-in validation and OpenAPI generation

### Frontend Framework: React

**Decision**: Use React with TypeScript for the frontend.

**Rationale**:
- Mandated by project constitution (Principle II: Web Application Structure)
- Component-based architecture fits well with inventory list/detail/form pattern
- TypeScript provides type safety matching backend Pydantic schemas
- Large ecosystem for table/filter components if needed

**Alternatives Considered**:
- Vue.js: Similar capability but React specified in constitution
- Plain JavaScript: TypeScript preferred for schema alignment

### Database: SQLite (Development) → MySQL (Production)

**Decision**: Use SQLite for development, MySQL 8.0+ for production.

**Rationale**:
- SQLite for development: zero configuration, fast local iteration
- MySQL for production: per user requirement, better concurrency support
- SQLAlchemy provides database abstraction layer
- Alembic migrations ensure schema portability between databases
- Same codebase works with both databases via environment configuration

**Alternatives Considered**:
- SQLite only: Insufficient for production concurrent access needs
- MySQL only: Unnecessary complexity for local development
- PostgreSQL: Viable alternative to MySQL but user specified MySQL

**Migration Strategy**:
1. Develop and test locally with SQLite
2. Use Alembic for all schema changes (works on both databases)
3. Export data via JSON, switch DATABASE_URL, import to MySQL
4. Avoid database-specific features in SQLAlchemy models

### ORM: SQLAlchemy

**Decision**: Use SQLAlchemy Core with ORM features.

**Rationale**:
- Standard Python ORM, well-integrated with FastAPI
- Provides database abstraction if migration to PostgreSQL needed later
- Handles connection pooling and transaction management
- Type hints support for IDE completion

**Alternatives Considered**:
- Raw SQL: Simpler but loses migration path flexibility
- Tortoise ORM: Async-first but less mature ecosystem

### CSV Processing: Python csv module

**Decision**: Use Python's built-in csv module for import/export.

**Rationale**:
- Standard library, no additional dependency
- Sufficient for ~500 record scale
- Simple API for reading/writing

**Alternatives Considered**:
- pandas: Powerful but heavy dependency for simple CSV operations
- csvkit: External dependency not justified for basic use case

## Architecture Decisions

### No Authentication

**Decision**: System operates without authentication on internal network.

**Rationale**:
- Per clarification session: open access on internal network
- Simplifies architecture significantly
- Admin functions (soft-delete recovery) via separate navigation section, not roles

**Trade-offs**:
- No audit trail of who made changes (acceptable per clarification "current state only")
- Relies on network security for access control

### Soft Delete Implementation

**Decision**: Use `is_deleted` boolean flag with `deleted_at` timestamp.

**Rationale**:
- Simple implementation
- Allows restoration of accidentally deleted records
- Admin section can filter `is_deleted=True` to show recoverable records
- CSV export excludes soft-deleted by default (FR-027)

**Implementation**:
```python
class Computer(Base):
    # ... other fields ...
    is_deleted: bool = False
    deleted_at: datetime | None = None
```

### Concurrency: Last Write Wins

**Decision**: No optimistic or pessimistic locking.

**Rationale**:
- Per clarification: last write wins, no conflict detection
- Simple implementation
- Low concurrent user count (~10) makes conflicts rare
- Users can manually coordinate or re-edit if conflicts occur

### State Management: React useState

**Decision**: Use React's built-in state management (useState, useEffect).

**Rationale**:
- Simplicity First: no Redux, MobX, or other state libraries
- Application state is simple: list of computers, current filters, form state
- API calls fetch fresh data; no complex client-side caching needed

### Assignment History Tracking

**Decision**: Use a separate `assignment_history` table with automatic record creation on assignment changes.

**Rationale**:
- Simple append-only table design
- History records are immutable (never updated or deleted)
- Triggered automatically when assignment fields change (Primary User, Function, Computer Name)
- Foreign key relationship to Computer via serial_number

**Implementation**:
```python
class AssignmentHistory(Base):
    __tablename__ = "assignment_history"

    id = Column(Integer, primary_key=True)
    computer_id = Column(Integer, ForeignKey("computers.id"), nullable=False)
    previous_user = Column(String(200))
    previous_function = Column(Enum(Function))
    previous_computer_name = Column(String(100))
    start_date = Column(Date)  # When this assignment started
    end_date = Column(Date)    # When this assignment ended
    created_at = Column(DateTime, server_default=func.now())
```

**Alternatives Considered**:
- Event sourcing: Overkill for this use case; adds significant complexity
- JSON field for history: Poor queryability, harder to report on
- Audit log table: More generic but less focused on assignment tracking

**Trade-offs**:
- Additional table increases schema complexity slightly
- History creation adds a small overhead to update operations
- Worth it for the audit capability it provides

### Equipment ID Generation (Type-Based Prefixes)

**Decision**: Auto-generate unique Equipment IDs with type-based prefixes: {TYPE}-NNNN.

**Equipment Type Prefixes**:
| Equipment Type | Prefix | Example |
|---------------|--------|---------|
| PC (Computer) | PC | PC-0001 |
| Monitor | MON | MON-0001 |
| Scanner | SCN | SCN-0001 |
| Printer | PRN | PRN-0001 |

**Rationale**:
- Provides a human-friendly, organization-specific identifier
- Type-based prefix allows quick visual identification of equipment category
- Separate counter per type (PC-0001, MON-0001 can coexist)
- Zero-padded 4-digit format supports up to 9999 items per type

**Implementation**:
```python
# Equipment type to prefix mapping
EQUIPMENT_TYPE_PREFIXES = {
    EquipmentType.PC: "PC",
    EquipmentType.MONITOR: "MON",
    EquipmentType.SCANNER: "SCN",
    EquipmentType.PRINTER: "PRN",
}

def generate_equipment_id(db: Session, equipment_type: EquipmentType) -> str:
    prefix = EQUIPMENT_TYPE_PREFIXES[equipment_type]
    # Get max number for this equipment type
    result = db.query(func.max(Equipment.equipment_id_num)).filter(
        Equipment.equipment_type == equipment_type
    ).scalar()
    next_num = (result or 0) + 1
    return f"{prefix}-{next_num:04d}"
```

**Alternatives Considered**:
- Single global counter: Loses type-based organization
- Type embedded in number: Less readable (e.g., 1-0001 vs PC-0001)
- User-entered ID: Prone to duplicates and inconsistency

**Notes**:
- Equipment ID stored as String for flexibility
- Also store numeric portion for efficient per-type sequencing
- Equipment ID is read-only after creation
- Included in CSV export but ignored on import (auto-generated)

### Multi-Equipment Type Support

**Decision**: Use single table with shared fields; equipment type determines which fields are applicable.

**Rationale**:
- Simplicity First: avoid complex table inheritance or polymorphic patterns
- All equipment shares common fields (serial, model, assignment, status)
- PC-specific fields (CPU, RAM, etc.) are nullable and only filled for PCs
- Easy to add new equipment types by adding enum values

**Field Organization**:
- **Common fields** (all types): equipment_id, serial_number, equipment_type, model, manufacturer, cost, status, assignment fields
- **PC-specific fields** (nullable): computer_subtype, cpu_*, ram, storage, video_card, display_resolution, mac_address, performance scores

**Alternatives Considered**:
- Separate tables per type: Over-engineering for 4 types with mostly shared fields
- Table inheritance: Adds ORM complexity without proportional benefit
- JSON field for type-specific data: Poor queryability

## Equipment Reassignment Feature

**Decision**: Implement reassignment as a frontend-only feature using the existing PUT endpoint.

**Rationale**:
- The existing `PUT /computers/{id}` endpoint already supports updating assignment fields
- AssignmentHistory is automatically created when primary_user, usage_type, or equipment_name changes
- No backend changes required - just need a new UI workflow
- "Machine information copied over" means the equipment's specs (model, CPU, RAM, etc.) stay with the equipment record while only assignment fields change - this is already how updates work

**Implementation Approach**:
1. Add "Reassign" button/action to equipment list rows
2. Create ReassignmentModal component that:
   - Displays selected equipment's machine info (read-only)
   - Shows editable assignment fields: Equipment Name, Primary User, Usage Type, IP Address, Assignment Date
   - On save, calls existing updateEquipment API
3. AssignmentHistory creation happens automatically in backend on assignment field change

**User Flow**:
1. User clicks "Reassign" on equipment row
2. Modal opens showing:
   - Equipment ID, type, model, serial (read-only, for reference)
   - Current assignment info (shown as "previous" reference)
   - Editable fields for new assignment
3. User fills in new assignment details
4. User clicks "Reassign" button
5. System updates equipment and creates history record

**Alternatives Considered**:
- Dedicated `/reassign` endpoint: Adds backend complexity without benefit; existing PUT works
- Copy equipment to new record: Wrong approach - reassignment is about changing assignment, not duplicating equipment
- Inline editing in list view: Less explicit, harder to show both current and new values

**Trade-offs**:
- Frontend-only change minimizes risk and complexity
- Reuses existing API contract - no breaking changes
- Assignment history created automatically by existing backend logic

## Resolved Clarifications

All technical clarifications resolved. No NEEDS CLARIFICATION items remain.

| Item | Resolution |
|------|------------|
| Database choice | SQLite (dev) → MySQL (prod) via Alembic migrations |
| MySQL driver | PyMySQL (pure Python, no system dependencies) |
| Authentication | None required (internal network) |
| Concurrency | Last write wins |
| CSV library | Python built-in csv module |
| State management | React useState (no external library) |
| Assignment history | Separate table, auto-created on assignment field changes |
| Equipment ID | Auto-generated {TYPE}-NNNN format with per-type counters |
| Equipment types | PC, Monitor, Scanner, Printer with type-based prefixes |
| Field organization | Shared fields for all types; PC-specific fields nullable |
| Equipment reassignment | Frontend-only feature using existing PUT endpoint; machine info stays with equipment |

## References

- FastAPI documentation: https://fastapi.tiangolo.com/
- SQLAlchemy documentation: https://docs.sqlalchemy.org/
- Alembic documentation: https://alembic.sqlalchemy.org/
- MySQL 8.0 documentation: https://dev.mysql.com/doc/refman/8.0/en/
- PyMySQL documentation: https://pymysql.readthedocs.io/
- React documentation: https://react.dev/
- Project Constitution: `.specify/memory/constitution.md`
