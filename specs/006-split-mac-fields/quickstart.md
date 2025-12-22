# Quickstart: Split MAC Address Fields

**Branch**: `006-split-mac-fields` | **Date**: 2025-12-21

## Prerequisites

- Python 3.11+ with virtual environment
- Node.js 18+ with npm
- Backend and frontend already set up per main CLAUDE.md

## Implementation Steps

### 1. Database Migration

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Create migration file (already designed - copy from data-model.md)
# File: alembic/versions/004_split_mac_address_fields.py

# Run migration
alembic upgrade head
```

### 2. Backend Updates

#### 2.1 Update Model (app/models/equipment.py)

Replace:
```python
mac_address = Column(String(17))
```

With:
```python
mac_lan = Column(String(17))
mac_wlan = Column(String(17))
```

#### 2.2 Update Schemas (app/schemas/equipment.py)

In `EquipmentBase`, `EquipmentListItem`, replace `mac_address` with:
```python
mac_lan: Optional[str] = Field(None, max_length=17)
mac_wlan: Optional[str] = Field(None, max_length=17)
```

#### 2.3 Update CSV Service (app/services/csv_service.py)

Update `CSV_FIELD_MAP`:
```python
'MAC (LAN)': 'mac_lan',
'MAC (WLAN)': 'mac_wlan',
'MAC Address': 'mac_lan',  # Legacy support
```

Update `FIELD_CSV_MAP` and `EXPORT_FIELDS` similarly.

Update validation in `_validate_row()` to validate both fields.

### 3. Frontend Updates

#### 3.1 Update Types (src/types/equipment.ts)

Replace `mac_address?: string` with:
```typescript
mac_lan?: string;
mac_wlan?: string;
```

#### 3.2 Update Form (src/components/EquipmentForm.tsx)

Replace single MAC input with two inputs:
- Label: "MAC (LAN)" → field: `mac_lan`
- Label: "MAC (WLAN)" → field: `mac_wlan`

#### 3.3 Update Detail View (src/components/EquipmentDetail.tsx)

Display both MAC addresses for PC-type equipment.

#### 3.4 Update List View (src/components/EquipmentList.tsx)

Update column configuration if MAC is displayed in list.

### 4. Verification

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (new terminal)
cd frontend
npm run dev
```

#### Test Cases

1. **Create PC**: Fill both MAC fields → Both saved correctly
2. **Edit PC**: Modify MAC (WLAN) only → MAC (LAN) unchanged
3. **View PC**: Both MAC addresses displayed in detail view
4. **CSV Export**: Both columns present with correct headers
5. **CSV Import (new)**: Both columns imported correctly
6. **CSV Import (legacy)**: Single "MAC Address" column maps to MAC (LAN)

### 5. Rollback (if needed)

```bash
cd backend
alembic downgrade -1  # Reverts to previous migration
```

## Files Changed

| File | Change |
|------|--------|
| `backend/alembic/versions/004_*.py` | New migration |
| `backend/app/models/equipment.py` | Replace mac_address field |
| `backend/app/schemas/equipment.py` | Update all schemas |
| `backend/app/services/csv_service.py` | Update mappings |
| `frontend/src/types/equipment.ts` | Update interface |
| `frontend/src/components/EquipmentForm.tsx` | Two MAC inputs |
| `frontend/src/components/EquipmentDetail.tsx` | Display both MACs |
| `frontend/src/components/EquipmentList.tsx` | Update columns |
| `frontend/src/components/ImportModal.tsx` | Handle dual columns |
