# Data Model: Equipment Fields Update

**Branch**: `005-equipment-fields-update` | **Date**: 2025-12-21

## Entity Changes

### Equipment (Updated)

The Equipment entity is extended with a new `purpose` field and relaxed enum constraints for extensible enumerations.

#### New Field

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| purpose | String(100) | nullable | Equipment function (e.g., "CEO", "Trading", "Research") |

#### Modified Fields (Enum → String)

| Field | Old Type | New Type | Validation |
|-------|----------|----------|------------|
| computer_subtype | SQLEnum(ComputerSubtype) | String(50) | Title case, known values: Desktop, Laptop, Tower, SFF |
| status | SQLEnum(Status) | String(50) | Title case, known values: Active, Inactive, Decommissioned, In Repair, In Storage |
| usage_type | SQLEnum(UsageType) | String(50) | Title case, known values: Personal, Work |

#### Enhanced Validation Fields

| Field | Type | Validation Rules |
|-------|------|------------------|
| ip_address | String(45) | IPv4 format only (regex: `^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`), nullable |
| mac_address | String(17) | Normalized to uppercase with colons (e.g., "1C:87:2C:59:E3:C9"), nullable |
| cpu_speed | String(50) | Normalized to have space between number and unit (e.g., "2.5 GHz"), nullable |
| equipment_id | String(10) | Format {TYPE}-NNNN, uppercase, unique |

### Equipment Entity (Full Schema)

```
Equipment
├── id: Integer (PK, auto-increment)
├── equipment_id: String(10) (unique, not null, format: {TYPE}-NNNN)
├── equipment_id_num: Integer (not null, per-type sequence number)
├── equipment_type: SQLEnum(EquipmentType) (not null) [PC, Monitor, Scanner, Printer]
├── serial_number: String(100) (unique, nullable)
├── created_at: DateTime (auto)
├── updated_at: DateTime (auto)
├── is_deleted: Boolean (default: false)
├── deleted_at: DateTime (nullable)
│
├── # Common fields
├── model: String(200)
├── manufacturer: String(200)
├── manufacturing_date: Date
├── acquisition_date: Date
├── location: String(200)
├── cost: Decimal(10,2)
├── purpose: String(100) [NEW]
│
├── # PC-specific fields
├── computer_subtype: String(50) [CHANGED from SQLEnum]
├── cpu_model: String(100)
├── cpu_speed: String(50) [Enhanced validation]
├── operating_system: String(100)
├── ram: String(50)
├── storage: String(100)
├── video_card: String(200)
├── display_resolution: String(50)
├── mac_address: String(17) [Enhanced validation]
│
├── # Performance fields (Passmark)
├── cpu_score: Integer
├── score_2d: Integer
├── score_3d: Integer
├── memory_score: Integer
├── disk_score: Integer
├── overall_rating: Integer
│
├── # Assignment fields
├── equipment_name: String(100)
├── ip_address: String(45) [Enhanced validation]
├── assignment_date: Date
├── primary_user: String(200)
├── usage_type: String(50) [CHANGED from SQLEnum]
├── status: String(50) [CHANGED from SQLEnum]
│
└── notes: Text
```

## Import Preview Types

These are transient types used during the preview phase, not persisted to database.

### ImportPreviewRow

```
ImportPreviewRow
├── row_number: Integer (CSV row number)
├── equipment_id: String (provided or auto-generated)
├── data: Dict[str, Any] (all field values)
├── status: PreviewStatus (validated | problematic | duplicate)
├── errors: List[FieldError] (validation errors)
├── normalized_values: Dict[str, str] (normalized MAC, CPU speed, etc.)
└── original_values: Dict[str, str] (original CSV values)
```

### FieldError

```
FieldError
├── field: String (field name)
├── value: String (original value)
├── message: String (error description)
└── suggestion: String (optional - suggested fix)
```

### PreviewStatus

```
PreviewStatus (Enum)
├── VALIDATED: Row passes all validation, ready to import
├── PROBLEMATIC: Row has validation errors
└── DUPLICATE: Equipment ID already exists in database
```

### ImportPreviewResult

```
ImportPreviewResult
├── total_rows: Integer
├── validated_rows: List[ImportPreviewRow]
├── problematic_rows: List[ImportPreviewRow]
├── duplicate_rows: List[ImportPreviewRow]
└── csv_columns: List[String] (detected column names)
```

## CSV Field Mapping

| CSV Column | Database Field | Transformation |
|------------|----------------|----------------|
| Equipment ID | equipment_id | Uppercase, validate format |
| Category | equipment_type | "Computer" → "PC" |
| Subcategory | computer_subtype | "Tower"/"SFF"/"PC" → "Desktop", "Laptop" → "Laptop" |
| Manufacturer | manufacturer | None |
| Model | model | None |
| Serial Number | serial_number | None |
| Primary User | primary_user | None |
| Purpose | purpose | None (NEW) |
| Equipment Name | equipment_name | None |
| IP Address | ip_address | Validate IPv4 |
| CPU Model | cpu_model | None |
| CPU Base Speed | cpu_speed | Normalize spacing |
| Operating System | operating_system | None |
| RAM | ram | None |
| Storage | storage | None |
| Video Card | video_card | None |
| Display Resolution | display_resolution | None |
| MAC Address | mac_address | Normalize to colons, uppercase |
| CPU Score | cpu_score | Parse integer |
| 2D Score | score_2d | Parse integer |
| 3D Score | score_3d | Parse integer |
| Memory Score | memory_score | Parse integer |
| Disk Score | disk_score | Parse integer |
| Overall Rating | overall_rating | Parse integer |
| Manufacturing Date | manufacturing_date | Parse ISO date |
| Acquisition Date | acquisition_date | Parse ISO date |
| Assignment Date | assignment_date | Parse ISO date |
| Cost | cost | Parse decimal |
| Notes | notes | None |
| Status | status | "Inactive - In Storage" → "In Storage", title case |
| Ownership | usage_type | "CCM" → "Work", "Personal" → "Personal" |
| Location | location | None |

## Migration Plan

### Alembic Migration: 003_equipment_fields_update

```python
"""
Add purpose field, convert enum columns to string for extensibility
"""

def upgrade():
    # Add purpose field
    op.add_column('equipment', sa.Column('purpose', sa.String(100), nullable=True))

    # Convert enum columns to string (preserving existing data)
    # Note: SQLite doesn't support ALTER COLUMN, need to recreate table
    # For MySQL, can use ALTER TABLE ... MODIFY COLUMN

    # For SQLite (development):
    # 1. Create new table with string columns
    # 2. Copy data
    # 3. Drop old table
    # 4. Rename new table

    # For MySQL (production):
    # ALTER TABLE equipment MODIFY computer_subtype VARCHAR(50);
    # ALTER TABLE equipment MODIFY status VARCHAR(50);
    # ALTER TABLE equipment MODIFY usage_type VARCHAR(50);

def downgrade():
    op.drop_column('equipment', 'purpose')
    # Note: Reverting string→enum may lose data if new values were added
```

## Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| ip_address | IPv4 regex | "Invalid IPv4 address format. Expected format: xxx.xxx.xxx.xxx where each octet is 0-255" |
| mac_address | 12 hex chars | "Invalid MAC address format. Expected 12 hexadecimal characters" |
| cpu_speed | Number + optional unit | "Invalid CPU speed format. Expected format: X.XX GHz or X.XX MHz" |
| equipment_id | {TYPE}-NNNN | "Invalid Equipment ID format. Expected format: PC-0001, MON-0001, etc." |
| computer_subtype | Title case string | "Invalid subtype. Must be title case (e.g., Desktop, Laptop)" |
| status | Title case string | "Invalid status. Must be title case" |
| usage_type | Title case string | "Invalid usage type. Must be title case" |
