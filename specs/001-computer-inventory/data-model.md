# Data Model: Equipment Inventory Tracker

**Date**: 2025-12-15
**Feature**: 001-computer-inventory

## Entity: Equipment

The primary entity representing a piece of equipment (PC, Monitor, Scanner, Printer) in the organization.

### Core Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **id** | Integer | Auto | Primary key | Auto-generated |
| **equipment_id** | String(10) | Auto | Organization equipment ID ({TYPE}-NNNN) | Auto-generated, unique, read-only |
| **equipment_id_num** | Integer | Auto | Numeric portion for per-type sequencing | Auto-generated |
| **equipment_type** | Enum | Yes | Type of equipment | One of: PC, Monitor, Scanner, Printer |
| **serial_number** | String(100) | No | Manufacturer serial number | Unique when provided (NULL allowed) |
| **created_at** | DateTime | Auto | Record creation timestamp | Auto-set on create |
| **updated_at** | DateTime | Auto | Last modification timestamp | Auto-set on update |
| **is_deleted** | Boolean | No | Soft delete flag | Default: false |
| **deleted_at** | DateTime | No | Soft delete timestamp | Set when is_deleted=true |

### Common Equipment Fields (All Types)

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **model** | String(200) | No | Equipment model name | - |
| **manufacturer** | String(200) | No | Equipment manufacturer | - |
| **manufacturing_date** | Date | No | Date of manufacture | - |
| **acquisition_date** | Date | No | Date equipment was acquired by the organization | - |
| **location** | String(200) | No | Physical location (office, building, room) | - |
| **cost** | Decimal(10,2) | No | Purchase cost | >= 0 |

### PC-Specific Fields (Nullable for Non-PC Types)

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **computer_subtype** | Enum | No | Desktop or Laptop (PC only) | One of: Desktop, Laptop |
| **cpu_model** | String(100) | No | CPU model name | - |
| **cpu_speed** | String(50) | No | CPU speed (e.g., "3.5 GHz") | - |
| **operating_system** | String(100) | No | OS name and version | - |
| **ram** | String(50) | No | RAM capacity (e.g., "16 GB") | - |
| **storage** | String(100) | No | HDD/SSD capacity | - |
| **video_card** | String(200) | No | Graphics card model | - |
| **display_resolution** | String(50) | No | Screen resolution (e.g., "1920x1080") | - |
| **mac_address** | String(17) | No | Network MAC address | Format: XX:XX:XX:XX:XX:XX |
| **manufacturing_date** | Date | No | Date of manufacture | - |
| **cost** | Decimal(10,2) | No | Purchase cost | >= 0 |

#### Performance Fields (Passmark Benchmarks)

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **cpu_score** | Integer | No | Passmark CPU benchmark | >= 0 |
| **score_2d** | Integer | No | Passmark 2D graphics benchmark | >= 0 |
| **score_3d** | Integer | No | Passmark 3D graphics benchmark | >= 0 |
| **memory_score** | Integer | No | Passmark memory benchmark | >= 0 |
| **disk_score** | Integer | No | Passmark disk benchmark | >= 0 |
| **overall_rating** | Integer | No | Passmark overall score | >= 0 |

#### Assignment Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **equipment_name** | String(100) | No | Network hostname | - |
| **ip_address** | String(45) | No | IP address (v4 or v6) | Valid IP format |
| **assignment_date** | Date | No | Date assigned to current user | - |
| **primary_user** | String(200) | No | Name of primary user | - |
| **usage_type** | Enum | No | Personal or Work use | One of: Personal, Work |
| **status** | Enum | No | Equipment status | One of: Active, Inactive, Decommissioned, In Repair, In Storage |

#### Notes Field

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **notes** | Text | No | Free-text notes | - |

### Enumerations

#### EquipmentType
```
PC          → ID prefix: PC-
Monitor     → ID prefix: MON-
Scanner     → ID prefix: SCN-
Printer     → ID prefix: PRN-
```

#### ComputerSubtype (PC equipment only)
```
Desktop
Laptop
```

#### Status
```
Active
Inactive
Decommissioned
In Repair
In Storage
```

#### UsageType
```
Personal
Work
```

### Indexes

| Index Name | Fields | Purpose |
|------------|--------|---------|
| ix_computer_equipment_id | equipment_id | Unique lookups by equipment ID |
| ix_computer_serial | serial_number | Unique lookups, CSV import matching |
| ix_computer_status | status, is_deleted | Filter by status (excluding deleted) |
| ix_computer_user | primary_user, is_deleted | Filter by user |
| ix_computer_usage_type | usage_type, is_deleted | Filter by usage type |
| ix_computer_type | equipment_type, is_deleted | Filter by type |
| ix_computer_location | location, is_deleted | Filter by location |

### Constraints

1. **Equipment ID Uniqueness**: `equipment_id` must be unique across all records (including soft-deleted)
2. **Serial Number Uniqueness**: `serial_number` must be unique when provided (NULL values allowed, multiple NULLs permitted)
3. **Non-negative Scores**: All Passmark benchmark scores must be >= 0 when provided
4. **Non-negative Cost**: `cost` must be >= 0 when provided
5. **Valid Enums**: `equipment_type`, `status`, and `usage_type` must be from defined enum values

### State Transitions

```
                    ┌──────────────┐
                    │   Created    │
                    └──────┬───────┘
                           │
                           ▼
    ┌────────────────────────────────────────┐
    │              Active                     │
    │  (normal operating state)               │
    └────┬────────┬────────┬────────┬────────┘
         │        │        │        │
         ▼        ▼        ▼        ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │Inactive│ │In Repair│ │In Storage│ │Decomm. │
    └────┬───┘ └────┬───┘ └────┬───┘ └────────┘
         │        │        │
         └────────┴────────┘
                  │
                  ▼ (can return to Active)
```

- Any status can transition to any other status (no strict state machine)
- "Decommissioned" is typically a terminal state but not enforced
- Soft-delete is orthogonal to status (deleted records retain their last status)

### Soft Delete Behavior

When a record is soft-deleted:
1. `is_deleted` set to `true`
2. `deleted_at` set to current timestamp
3. Record excluded from normal list views
4. Record excluded from CSV exports
5. Record still matched by Serial Number during import (restored and updated)

When a record is restored:
1. `is_deleted` set to `false`
2. `deleted_at` set to `null`
3. Record appears in normal views again

## Database Compatibility Notes

This model is designed to work with both SQLite (development) and MySQL 8.0+ (production).

### MySQL-Compatible Practices Applied

1. **Explicit String Lengths**: All `String(n)` columns have explicit lengths for VARCHAR compatibility
2. **Numeric for Currency**: `Numeric(10,2)` used instead of Float for precise decimal storage
3. **Enum as String**: Enums stored as string values, compatible across both databases
4. **No SQLite-specific Features**: Avoided AUTOINCREMENT keyword, using SQLAlchemy's portable syntax
5. **DateTime Handling**: Using `func.now()` which maps to appropriate function per database

### Migration Considerations

When migrating from SQLite to MySQL:
- Alembic handles schema creation automatically
- Export data as JSON before switching databases
- MySQL uses InnoDB engine by default (supports transactions)
- Index names are consistent across both databases

## SQLAlchemy Model

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Enum, Text
from sqlalchemy.sql import func
from enum import Enum as PyEnum

class EquipmentType(str, PyEnum):
    PC = "PC"
    MONITOR = "Monitor"
    SCANNER = "Scanner"
    PRINTER = "Printer"

# Mapping for ID prefix generation
EQUIPMENT_TYPE_PREFIXES = {
    EquipmentType.PC: "PC",
    EquipmentType.MONITOR: "MON",
    EquipmentType.SCANNER: "SCN",
    EquipmentType.PRINTER: "PRN",
}

class ComputerSubtype(str, PyEnum):
    DESKTOP = "Desktop"
    LAPTOP = "Laptop"

class Status(str, PyEnum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    DECOMMISSIONED = "Decommissioned"
    IN_REPAIR = "In Repair"
    IN_STORAGE = "In Storage"

class UsageType(str, PyEnum):
    PERSONAL = "Personal"
    WORK = "Work"

class Equipment(Base):
    __tablename__ = "equipment"

    # Primary key and metadata
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String(10), unique=True, nullable=False, index=True)  # {TYPE}-NNNN format
    equipment_id_num = Column(Integer, nullable=False)  # Numeric portion for per-type sequencing
    equipment_type = Column(Enum(EquipmentType), nullable=False, index=True)
    serial_number = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    # Common equipment fields
    model = Column(String(200))
    manufacturer = Column(String(200))
    manufacturing_date = Column(Date)
    acquisition_date = Column(Date)
    location = Column(String(200))
    cost = Column(Numeric(10, 2))

    # PC-specific fields (nullable for non-PC types)
    computer_subtype = Column(Enum(ComputerSubtype))  # Desktop/Laptop
    cpu_model = Column(String(100))
    cpu_speed = Column(String(50))
    operating_system = Column(String(100))
    ram = Column(String(50))
    storage = Column(String(100))
    video_card = Column(String(200))
    display_resolution = Column(String(50))
    mac_address = Column(String(17))

    # Performance fields (Passmark) - PC only
    cpu_score = Column(Integer)
    score_2d = Column(Integer)
    score_3d = Column(Integer)
    memory_score = Column(Integer)
    disk_score = Column(Integer)
    overall_rating = Column(Integer)

    # Assignment fields
    equipment_name = Column(String(100))
    ip_address = Column(String(45))
    assignment_date = Column(Date)
    primary_user = Column(String(200))
    usage_type = Column(Enum(UsageType))
    status = Column(Enum(Status), default=Status.ACTIVE)

    # Notes
    notes = Column(Text)
```

## Entity: AssignmentHistory

Tracks historical assignments for each computer. Records are created automatically when assignment fields change.

### Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| **id** | Integer | Auto | Primary key | Auto-generated |
| **equipment_id** | Integer | Yes | Foreign key to Equipment | Must exist in equipment table |
| **previous_user** | String(200) | No | User before the change | - |
| **previous_usage_type** | Enum | No | Usage type before the change | One of: Personal, Work |
| **previous_equipment_name** | String(100) | No | Equipment name before the change | - |
| **start_date** | Date | No | When this assignment started | - |
| **end_date** | Date | Yes | When this assignment ended | Auto-set to current date on change |
| **created_at** | DateTime | Auto | Record creation timestamp | Auto-set on create |

### Indexes

| Index Name | Fields | Purpose |
|------------|--------|---------|
| ix_history_equipment | equipment_id | Fast lookup of history by equipment |
| ix_history_end_date | equipment_id, end_date | Sort history chronologically |

### Constraints

1. **Equipment Reference**: `equipment_id` must reference existing equipment (including soft-deleted)
2. **Immutable Records**: History records are never updated or deleted (append-only)

### Relationship to Equipment

```
Equipment (1) ────────< AssignmentHistory (many)
            equipment_id FK
```

- One Equipment can have many AssignmentHistory records
- History records persist even when equipment is soft-deleted
- History is ordered by end_date DESC (newest first)

### When History is Created

A new AssignmentHistory record is created when **any** of these fields change during an update:
- `primary_user`
- `usage_type`
- `equipment_name`

The history record captures the **previous** values before the change occurred.

### SQLAlchemy Model

```python
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class AssignmentHistory(Base):
    __tablename__ = "assignment_history"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    previous_user = Column(String(200))
    previous_usage_type = Column(Enum(UsageType))
    previous_equipment_name = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    equipment = relationship("Equipment", back_populates="assignment_history")


# Add to Equipment model:
class Equipment(Base):
    # ... existing fields ...
    assignment_history = relationship("AssignmentHistory", back_populates="equipment", order_by="desc(AssignmentHistory.end_date)")
```

## CSV Field Mapping

For import/export, use these column headers:

| CSV Column | Database Field | Notes |
|------------|----------------|-------|
| Equipment ID | equipment_id | Optional on import; auto-generated for new records. Used for matching existing records. |
| Equipment Type | equipment_type | Required for new records |
| Serial Number | serial_number | Optional; used for matching if Equipment ID not provided |
| Model | model | |
| Manufacturer | manufacturer | |
| Computer Subtype | computer_subtype | PC only: Desktop or Laptop |
| CPU Model | cpu_model | |
| CPU Speed | cpu_speed | |
| Operating System | operating_system | |
| RAM | ram | |
| Storage | storage | |
| Video Card | video_card | |
| Display Resolution | display_resolution | |
| MAC Address | mac_address | |
| Manufacturing Date | manufacturing_date | |
| Acquisition Date | acquisition_date | Date equipment was acquired |
| Location | location | Physical location |
| Cost | cost | |
| CPU Score | cpu_score | |
| 2D Score | score_2d | |
| 3D Score | score_3d | |
| Memory Score | memory_score | |
| Disk Score | disk_score | |
| Overall Rating | overall_rating | |
| Equipment Name | equipment_name | |
| IP Address | ip_address | |
| Assignment Date | assignment_date | |
| Primary User | primary_user | |
| Usage Type | usage_type | Personal or Work |
| Status | status | |
| Notes | notes | |
