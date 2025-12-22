# Data Model: Split MAC Address Fields

**Branch**: `006-split-mac-fields` | **Date**: 2025-12-21

## Entity Changes

### Equipment (Modified)

The Equipment entity is modified to replace the single `mac_address` field with two separate fields.

#### Fields Changed

| Field | Type | Constraints | Change |
|-------|------|-------------|--------|
| `mac_address` | String(17) | Optional | **REMOVED** (renamed to mac_lan) |
| `mac_lan` | String(17) | Optional | **NEW** - Wired LAN MAC address |
| `mac_wlan` | String(17) | Optional | **NEW** - Wireless LAN MAC address |

#### Validation Rules

Both `mac_lan` and `mac_wlan`:
- Format: `XX:XX:XX:XX:XX:XX` or `XX-XX-XX-XX-XX-XX` (case-insensitive)
- Length: 17 characters when populated
- Optional: NULL/empty allowed
- Normalized to uppercase colon-separated format on save

#### PC-Specific Context

These fields are semantically meaningful only for PC-type equipment:
- `EquipmentType.PC`: Both MAC fields displayed/editable
- Other types: Fields hidden in UI but stored in database (nullable)

## Migration Script

### Alembic Migration: 004_split_mac_address_fields.py

```python
"""Split mac_address into mac_lan and mac_wlan fields.

Revision ID: 004
Revises: 003
Create Date: 2025-12-21

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename mac_address to mac_lan
    op.alter_column('equipment', 'mac_address',
                    new_column_name='mac_lan',
                    existing_type=sa.String(17),
                    existing_nullable=True)

    # Add new mac_wlan column
    op.add_column('equipment',
                  sa.Column('mac_wlan', sa.String(17), nullable=True))


def downgrade() -> None:
    # Remove mac_wlan column
    op.drop_column('equipment', 'mac_wlan')

    # Rename mac_lan back to mac_address
    op.alter_column('equipment', 'mac_lan',
                    new_column_name='mac_address',
                    existing_type=sa.String(17),
                    existing_nullable=True)
```

### Migration Notes

1. **Data Preservation**: Existing `mac_address` values are preserved in `mac_lan`
2. **Rollback Safe**: Downgrade removes `mac_wlan` and restores original column name
3. **No Data Loss**: `mac_wlan` starts as NULL for all existing records

## Schema Changes

### Pydantic Schemas (equipment.py)

#### EquipmentBase (Modified)

```python
# Remove:
mac_address: Optional[str] = Field(None, max_length=17)

# Add:
mac_lan: Optional[str] = Field(None, max_length=17)
mac_wlan: Optional[str] = Field(None, max_length=17)
```

#### EquipmentListItem (Modified)

```python
# Remove:
mac_address: Optional[str] = None

# Add:
mac_lan: Optional[str] = None
mac_wlan: Optional[str] = None
```

### TypeScript Types (equipment.ts)

```typescript
interface Equipment {
  // ... existing fields ...

  // Remove:
  // mac_address?: string;

  // Add:
  mac_lan?: string;
  mac_wlan?: string;
}
```

## CSV Import/Export Changes

### Export Columns

| Old Column | New Columns |
|------------|-------------|
| `MAC Address` | `MAC (LAN)`, `MAC (WLAN)` |

### Import Mapping (csv_service.py)

```python
CSV_FIELD_MAP = {
    # ... existing mappings ...

    # New primary names
    'MAC (LAN)': 'mac_lan',
    'MAC (WLAN)': 'mac_wlan',

    # Legacy alias (backward compatibility)
    'MAC Address': 'mac_lan',  # Maps legacy to LAN field
}

FIELD_CSV_MAP = {
    # ... existing mappings ...

    # Remove:
    # 'mac_address': 'MAC Address',

    # Add:
    'mac_lan': 'MAC (LAN)',
    'mac_wlan': 'MAC (WLAN)',
}

EXPORT_FIELDS = [
    # ... replace 'mac_address' with:
    'mac_lan', 'mac_wlan',
]
```

## Relationship Impact

No relationship changes. The Equipment entity maintains its existing relationships:
- `assignment_history` (one-to-many with AssignmentHistory)

## Indexing

No new indexes required. MAC address fields are not typically used for filtering or searching in this application.
