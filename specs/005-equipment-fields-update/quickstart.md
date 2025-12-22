# Quickstart: Equipment Fields Update

**Branch**: `005-equipment-fields-update` | **Date**: 2025-12-21

## Prerequisites

- Python 3.11+
- Node.js 18+
- Git

## Setup

### 1. Clone and checkout branch

```bash
git checkout 005-equipment-fields-update
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows
# source venv/bin/activate         # macOS/Linux
pip install -r requirements.txt
```

### 3. Run database migration

```bash
# Apply the new migration for purpose field and enum changes
alembic upgrade head
```

### 4. Start backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Frontend setup (new terminal)

```bash
cd frontend
npm install
# Install new dependencies for markdown rendering
npm install react-markdown dompurify @types/dompurify
npm run dev
```

## Verification

### 1. API Health Check

```bash
curl http://localhost:8000/
# Expected: {"status": "ok"}
```

### 2. Test Import Preview Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/computers/import/preview \
  -F "file=@test.csv"
```

### 3. Frontend

Open http://localhost:3000 and navigate to:
1. Click "Import" button
2. Upload a CSV file
3. Verify preview shows validated/problematic/duplicate sections

## Key Files Modified

### Backend

| File | Changes |
|------|---------|
| `app/models/equipment.py` | Add `purpose` field, change enum columns to String |
| `app/schemas/equipment.py` | Add preview types, update validation |
| `app/services/csv_service.py` | Add preview mode, field normalization |
| `app/services/validators.py` | NEW: IPv4, MAC, CPU speed validators |
| `app/api/computers.py` | Add `/import/preview` and `/import/confirm` endpoints |
| `alembic/versions/003_*.py` | Migration for schema changes |

### Frontend

| File | Changes |
|------|---------|
| `src/components/ImportModal.tsx` | Two-phase preview/confirm workflow |
| `src/components/ImportPreview.tsx` | NEW: Preview table with validation status |
| `src/components/ImportRowEditor.tsx` | NEW: Inline editing for problematic rows |
| `src/components/EquipmentForm.tsx` | Add Purpose field |
| `src/components/MarkdownRenderer.tsx` | NEW: Reusable markdown component |
| `src/components/EquipmentDetail.tsx` | Render Notes as markdown |
| `src/components/SoftwareDetail.tsx` | Render Notes as markdown |
| `src/components/SubscriptionDetail.tsx` | Render Notes as markdown |
| `src/types/equipment.ts` | Add preview types |
| `src/services/api.ts` | Add preview/validate API calls |

## Testing the Import Workflow

### 1. Prepare test CSV

Create a test CSV with mix of valid and invalid data:

```csv
Equipment ID,Category,Subcategory,Manufacturer,Model,Primary User,Purpose,IP Address,MAC Address,CPU Base Speed,Status
PC-0001,Computer,Tower,Lenovo,ThinkCentre,John Doe,CEO,192.168.1.100,1C:87:2C:59:E3:C9,2.5 GHz,Active
,Computer,Laptop,Dell,XPS,Jane Smith,Trading,10.0.0.50,1c-87-2c-59-e3-ca,3.2GHz,Active
PC-0003,Computer,SFF,Intel,NUC,Bob Wilson,Research,192.168.1.999,invalid-mac,2.0,In Storage
```

### 2. Expected preview result

- Row 1: **Validated** - all fields valid
- Row 2: **Validated** - Equipment ID auto-generated, MAC normalized, CPU speed normalized
- Row 3: **Problematic** - invalid IP address (999 > 255), invalid MAC format

### 3. Test inline editing

1. Click on Row 3 in problematic section
2. Fix IP address to "192.168.1.99"
3. Fix MAC address to "1C:87:2C:59:E3:CB"
4. Verify row moves to validated section

### 4. Confirm import

1. Deselect any rows you don't want to import
2. Click "Confirm Import"
3. Verify success message with counts

## Validation Rules

| Field | Valid Examples | Invalid Examples |
|-------|----------------|------------------|
| IP Address | `192.168.1.100`, `10.0.0.1` | `192.168.1.999`, `2001:db8::1` |
| MAC Address | `1C:87:2C:59:E3:C9` | `1C:87:2C:59:E3` (too short), `ZZ:87:2C:59:E3:C9` (invalid hex) |
| CPU Speed | `2.5 GHz`, `3.20 GHz` | (accepts most formats, normalizes to "X.XX GHz") |
| Equipment ID | `PC-0001`, `MON-0002` | `pc-0001` (auto-fixed to uppercase), `PC-1` (invalid format) |
| Status | `Active`, `In Storage` | (title case enforced) |

## Testing Markdown Rendering

### 1. Create equipment with markdown notes

Create or edit an equipment record with markdown in the Notes field:

```markdown
## Purchase Info
- **Date**: 2025-01-15
- **Vendor**: [Lenovo](https://lenovo.com)
- **Cost**: $1,400

### Configuration
1. RAM upgraded to 64GB
2. SSD replaced with 1TB NVMe

> Note: Check warranty expires 2028-01-15
```

### 2. View the equipment detail

Open the equipment detail view and verify:
- "Purchase Info" displays as a heading
- "Date", "Vendor", "Cost" display in bold
- "Lenovo" displays as a clickable link
- Configuration items display as numbered list
- Note displays as a blockquote

### 3. Test XSS protection

Try adding a script tag to Notes:

```html
<script>alert('XSS')</script>
```

Verify that when viewing the detail, no alert popup appears (script is sanitized).

### 4. Test across all tabs

Verify markdown rendering works in:
- Equipment detail view
- Software detail view
- Subscription detail view
