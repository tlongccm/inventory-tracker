# Data Model: Software Inventory Tracking

**Date**: 2025-12-16

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SOFTWARE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                  INTEGER        Auto-increment                        │
│ UQ  software_id         VARCHAR(20)    Auto-generated SW-NNNN               │
│     software_id_num     INTEGER        Numeric portion for sequencing       │
├─────────────────────────────────────────────────────────────────────────────┤
│     category            VARCHAR(100)   Software category                    │
│     name                VARCHAR(200)   NOT NULL - Software name             │
│     version             VARCHAR(50)    Version string                       │
│     key                 VARCHAR(500)   License key (optional)               │
│     type                VARCHAR(100)   License/software type                │
├─────────────────────────────────────────────────────────────────────────────┤
│     purchase_date       DATE           Date of purchase                     │
│     purchaser           VARCHAR(200)   Person who purchased                 │
│     vendor              VARCHAR(200)   Software vendor                      │
│     cost                DECIMAL(10,2)  Purchase cost                        │
├─────────────────────────────────────────────────────────────────────────────┤
│     deployment          VARCHAR(200)   Deployment location/method           │
│     install_location    VARCHAR(500)   Installation file location           │
│     status              VARCHAR(50)    Current status                       │
│     comments            TEXT           Additional comments                  │
├─────────────────────────────────────────────────────────────────────────────┤
│     created_at          DATETIME       Auto-set on creation                 │
│     updated_at          DATETIME       Auto-set on update                   │
│     is_deleted          BOOLEAN        Soft delete flag (default: false)    │
│     deleted_at          DATETIME       Soft delete timestamp                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Field Specifications

### Primary Identifiers

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Database primary key |
| `software_id` | VARCHAR(20) | UNIQUE, NOT NULL | User-facing ID (SW-0001) |
| `software_id_num` | INTEGER | NOT NULL | Numeric portion for sequencing |

### Core Software Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `category` | VARCHAR(100) | NULL | Software category (e.g., "Office", "Security", "Development") |
| `name` | VARCHAR(200) | NOT NULL | Software product name |
| `version` | VARCHAR(50) | NULL | Version string (e.g., "2023.1.0") |
| `key` | VARCHAR(500) | NULL | License key or serial number |
| `type` | VARCHAR(100) | NULL | License/software type (e.g., "Subscription", "Perpetual", "Open Source") |

### Purchase Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `purchase_date` | DATE | NULL | Date of acquisition |
| `purchaser` | VARCHAR(200) | NULL | Person who made the purchase |
| `vendor` | VARCHAR(200) | NULL | Software vendor/supplier |
| `cost` | DECIMAL(10,2) | NULL | Purchase cost |

### Status and Deployment

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `deployment` | VARCHAR(200) | NULL | Where/how software is deployed |
| `install_location` | VARCHAR(500) | NULL | Installation file location (file path or URL) |
| `status` | VARCHAR(50) | NULL | Current status (e.g., "Active", "Inactive", "Expired") |
| `comments` | TEXT | NULL | Additional notes or comments |

### Metadata Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `created_at` | DATETIME | NOT NULL, AUTO | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL, AUTO | Last update timestamp |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| `deleted_at` | DATETIME | NULL | Soft delete timestamp |

## Database Indexes

| Index Name | Fields | Type | Rationale |
|------------|--------|------|-----------|
| `pk_software` | `id` | PRIMARY | Primary key |
| `uq_software_id` | `software_id` | UNIQUE | Fast lookup by software ID |
| `ix_software_name` | `name` | INDEX | Name search performance |
| `ix_software_category` | `category` | INDEX | Category filter performance |
| `ix_software_vendor` | `vendor` | INDEX | Vendor filter performance |
| `ix_software_status` | `status` | INDEX | Status filter performance |
| `ix_software_deleted` | `is_deleted` | INDEX | Exclude deleted records |

## SQLAlchemy Model Definition

```python
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Numeric, Text
from datetime import datetime

class Software(Base):
    __tablename__ = "software"

    # Primary identifiers
    id = Column(Integer, primary_key=True, autoincrement=True)
    software_id = Column(String(20), unique=True, nullable=False, index=True)
    software_id_num = Column(Integer, nullable=False)

    # Core fields
    category = Column(String(100), nullable=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    version = Column(String(50), nullable=True)
    key = Column(String(500), nullable=True)
    type = Column(String(100), nullable=True)

    # Purchase fields
    purchase_date = Column(Date, nullable=True)
    purchaser = Column(String(200), nullable=True)
    vendor = Column(String(200), nullable=True, index=True)
    cost = Column(Numeric(10, 2), nullable=True)

    # Status and deployment
    deployment = Column(String(200), nullable=True)
    install_location = Column(String(500), nullable=True)
    status = Column(String(50), nullable=True, index=True)
    comments = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
```

## Migration Script Outline

```python
# Alembic migration: add_software_table

def upgrade():
    op.create_table(
        'software',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('software_id', sa.String(20), unique=True, nullable=False),
        sa.Column('software_id_num', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('version', sa.String(50), nullable=True),
        sa.Column('key', sa.String(500), nullable=True),
        sa.Column('type', sa.String(100), nullable=True),
        sa.Column('purchase_date', sa.Date(), nullable=True),
        sa.Column('purchaser', sa.String(200), nullable=True),
        sa.Column('vendor', sa.String(200), nullable=True),
        sa.Column('cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('deployment', sa.String(200), nullable=True),
        sa.Column('install_location', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), default=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
    )

    # Create indexes
    op.create_index('ix_software_name', 'software', ['name'])
    op.create_index('ix_software_category', 'software', ['category'])
    op.create_index('ix_software_vendor', 'software', ['vendor'])
    op.create_index('ix_software_status', 'software', ['status'])
    op.create_index('ix_software_deleted', 'software', ['is_deleted'])

def downgrade():
    op.drop_table('software')
```

## Data Validation Rules

### Required Fields
- `name`: Cannot be empty or null
- `software_id`: Auto-generated, immutable after creation

### Business Rules
1. `software_id` format: `SW-NNNN` (4 digits, zero-padded)
2. Soft delete sets `is_deleted=true` and `deleted_at=now()`

### Auto-Generated Values
- `software_id`: Generated from `software_id_num` as `SW-{software_id_num:04d}`
- `created_at`: Set to current timestamp on insert
- `updated_at`: Updated to current timestamp on every update
