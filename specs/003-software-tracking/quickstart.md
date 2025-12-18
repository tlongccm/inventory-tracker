# Quickstart: Software Inventory Tracking

## Overview

This guide covers setup and verification for the Software Tracking feature, which adds a new "Software" tab to the Equipment Inventory Tracker for managing software licenses and installations.

## Prerequisites

- Equipment Inventory Tracker already set up and running
- Python 3.11+ with virtual environment
- Node.js 18+ with npm
- Existing database (SQLite or MySQL)

## Backend Setup

### 1. Apply Database Migration

After implementing the Software model, run the migration:

```bash
cd backend
venv\Scripts\activate           # Windows
source venv/bin/activate        # macOS/Linux

# Generate migration
alembic revision --autogenerate -m "add software table"

# Apply migration
alembic upgrade head
```

### 2. Verify API Endpoints

Start the backend server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs and verify the following endpoints appear:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/software | List software |
| POST | /api/v1/software | Create software |
| GET | /api/v1/software/{id} | Get software |
| PUT | /api/v1/software/{id} | Update software |
| DELETE | /api/v1/software/{id} | Delete software |
| POST | /api/v1/software/{id}/restore | Restore software |
| GET | /api/v1/software/export | Export CSV |
| POST | /api/v1/software/import | Import CSV |
| GET | /api/v1/admin/deleted-software | List deleted |

### 3. Test API (curl examples)

Create a software entry:
```bash
curl -X POST http://localhost:8000/api/v1/software \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Office",
    "name": "Microsoft Office 365",
    "version": "2023.1.0",
    "key": "XXXXX-XXXXX-XXXXX-XXXXX",
    "type": "Subscription",
    "purchase_date": "2024-01-15",
    "purchaser": "John Smith",
    "vendor": "Microsoft Corporation",
    "cost": 299.99,
    "deployment": "All workstations",
    "install_location": "\\\\server\\software\\office365\\setup.exe",
    "status": "Active",
    "comments": "Enterprise E3 plan"
  }'
```

List all software:
```bash
curl http://localhost:8000/api/v1/software
```

Search software:
```bash
curl "http://localhost:8000/api/v1/software?search=Microsoft"
```

Filter by category:
```bash
curl "http://localhost:8000/api/v1/software?category=Office"
```

## Frontend Setup

### 1. Install Dependencies (if new)

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 and verify:

1. **Navigation**: "Software" tab appears in header navigation
2. **Software Page**: Click "Software" tab to view software list
3. **Add Software**: Click "Add Software" button, fill form, save
4. **Edit Software**: Click on a software entry, edit details
5. **Search**: Use search box to filter software list

## Verification Checklist

### Backend API
- [ ] `GET /api/v1/software` returns empty array initially
- [ ] `POST /api/v1/software` creates new entry with auto-generated SW-0001 ID
- [ ] `GET /api/v1/software/SW-0001` returns the created entry
- [ ] `PUT /api/v1/software/SW-0001` updates the entry
- [ ] `DELETE /api/v1/software/SW-0001` soft-deletes (sets is_deleted=true)
- [ ] `GET /api/v1/admin/deleted-software` shows deleted entry
- [ ] `POST /api/v1/software/1/restore` restores the entry
- [ ] Search parameter filters results correctly
- [ ] Category filter works
- [ ] Status filter works
- [ ] Vendor filter works
- [ ] Export produces valid CSV
- [ ] Import processes CSV correctly

### Frontend UI
- [ ] Software tab appears in navigation
- [ ] Software list displays all 14 fields correctly
- [ ] Add Software form shows all fields
- [ ] Edit Software form updates all fields
- [ ] Delete prompts for confirmation
- [ ] Admin panel shows deleted software with restore option
- [ ] Search filters software list
- [ ] Sorting works on columns

### Field Verification
- [ ] Software ID auto-generates correctly (SW-0001, SW-0002, etc.)
- [ ] Category field saves and displays
- [ ] Name field saves and displays (required)
- [ ] Version field saves and displays
- [ ] Key field saves and displays
- [ ] Type field saves and displays
- [ ] Purchase Date field saves and displays
- [ ] Purchaser field saves and displays
- [ ] Vendor field saves and displays
- [ ] Cost field saves and displays
- [ ] Deployment field saves and displays
- [ ] Installation File Location field saves and displays
- [ ] Status field saves and displays
- [ ] Comments field saves and displays

## Sample Test Data

Use this data for manual testing:

### Software Entry 1: Microsoft Office
```json
{
  "category": "Office",
  "name": "Microsoft Office 365",
  "version": "2023.1.0",
  "key": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
  "type": "Subscription",
  "purchase_date": "2024-01-15",
  "purchaser": "John Smith",
  "vendor": "Microsoft Corporation",
  "cost": 12500.00,
  "deployment": "All workstations",
  "install_location": "\\\\fileserver\\software\\office365\\setup.exe",
  "status": "Active",
  "comments": "Enterprise E3 plan - 50 seats"
}
```

### Software Entry 2: Adobe Acrobat
```json
{
  "category": "Office",
  "name": "Adobe Acrobat Pro",
  "version": "2024",
  "key": "1234-5678-9012-3456-7890",
  "type": "Perpetual",
  "purchase_date": "2023-06-15",
  "purchaser": "Jane Doe",
  "vendor": "Adobe Inc.",
  "cost": 4500.00,
  "deployment": "Design team only",
  "install_location": "\\\\fileserver\\software\\adobe\\acrobat_setup.exe",
  "status": "Active",
  "comments": "10-seat license"
}
```

### Software Entry 3: Visual Studio Code
```json
{
  "category": "Development",
  "name": "Visual Studio Code",
  "version": "1.85.0",
  "key": "",
  "type": "Open Source",
  "purchase_date": null,
  "purchaser": "",
  "vendor": "Microsoft Corporation",
  "cost": 0,
  "deployment": "Developer workstations",
  "install_location": "https://code.visualstudio.com/download",
  "status": "Active",
  "comments": "MIT License - no cost"
}
```

### Software Entry 4: Antivirus
```json
{
  "category": "Security",
  "name": "Norton 360",
  "version": "22.24.1",
  "key": "ABCD-EFGH-IJKL-MNOP",
  "type": "Subscription",
  "purchase_date": "2024-03-01",
  "purchaser": "IT Department",
  "vendor": "NortonLifeLock",
  "cost": 1200.00,
  "deployment": "All endpoints",
  "install_location": "\\\\fileserver\\software\\norton\\setup.exe",
  "status": "Active",
  "comments": "Expires 2025-03-01"
}
```

### Software Entry 5: Legacy System (Inactive)
```json
{
  "category": "Business",
  "name": "Legacy Accounting System",
  "version": "5.2.1",
  "key": "OLD-LICENSE-KEY",
  "type": "Perpetual",
  "purchase_date": "2018-01-01",
  "purchaser": "Previous Admin",
  "vendor": "OldSoft Inc.",
  "cost": 5000.00,
  "deployment": "Accounting server (retired)",
  "install_location": "\\\\oldserver\\software\\accounting\\",
  "status": "Inactive",
  "comments": "Migrated to new system in 2023"
}
```

## Troubleshooting

### Common Issues

**Migration fails:**
- Ensure virtual environment is activated
- Check database connection in `.env` or `DATABASE_URL`
- Run `alembic history` to check current state

**API returns 500 error:**
- Check backend console for stack trace
- Verify database migrations are applied
- Check for missing fields in request

**Frontend doesn't show Software tab:**
- Clear browser cache
- Check console for JavaScript errors
- Verify React Router configuration in App.tsx

**Search not working:**
- Check search debounce is functioning
- Verify API receives search parameter
- Check backend logs for query errors

### Logs

Backend logs: Check terminal running uvicorn
Frontend logs: Browser developer console (F12)

## CSV Import Format

Expected columns for software import:

```csv
category,name,version,key,type,purchase_date,purchaser,vendor,cost,deployment,install_location,status,comments
Office,Microsoft Office,2023,XXXXX-XXXXX,Subscription,2024-01-15,John Smith,Microsoft,299.99,All workstations,\\server\software\office\setup.exe,Active,Enterprise plan
Development,Visual Studio Code,1.85.0,,Open Source,,,Microsoft,0,Developer PCs,https://code.visualstudio.com,Active,Free
```

**Required columns:** name
**Optional columns:** All others

**Note:** The software_id is auto-generated and should NOT be included in import files.
