# Quickstart: Computer Inventory Tracker

This guide walks you through setting up and running the Computer Inventory Tracker locally.

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher (for frontend)
- npm or yarn

## Backend Setup

### 1. Create Python virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Initialize the database

The SQLite database is created automatically on first run. No configuration needed.

### 4. Start the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Verify backend is running

- API docs: `http://localhost:8000/docs` (Swagger UI)
- Health check: `http://localhost:8000/api/v1/computers` (should return empty array)

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Quick Verification

### Add your first computer

1. Open `http://localhost:3000` in your browser
2. Click "Add Computer"
3. Enter a Serial Number (required): `TEST-001`
4. Fill in optional fields as desired
5. Click Save
6. Verify the computer appears in the list

### Test filtering

1. Add a few more computers with different statuses and types
2. Use the filter dropdowns to filter by Status = "Active"
3. Verify only active computers are shown
4. Click "Clear Filters" to reset

### Test CSV export/import

1. With computers in the inventory, click "Export to CSV"
2. Open the downloaded file and make a change
3. Click "Import from CSV" and select your modified file
4. Verify the changes are reflected in the inventory

### Test soft delete

1. Click on a computer to view details
2. Click "Delete"
3. Verify the computer disappears from the main list
4. Navigate to Admin section
5. Find the deleted computer and click "Restore"
6. Verify it reappears in the main list

### Test equipment reassignment

1. Ensure you have at least one computer with an assigned user
2. In the equipment list, click "Reassign" on the equipment row
3. The reassignment modal opens showing:
   - Equipment details (ID, type, model, serial) in read-only section
   - Current assignment info (previous user, etc.)
   - Editable fields for new assignment
4. Enter new assignment details:
   - New Primary User name
   - New Equipment Name (hostname)
   - Usage Type (Personal/Work)
   - Assignment Date
5. Click "Reassign" to save
6. Verify:
   - Equipment now shows new user in the list
   - Click on equipment to view details
   - Click "View History" to see the previous assignment recorded

## Project Structure

```
inventory_tracker/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/             # API routes
│   │   ├── services/        # Business logic
│   │   └── database.py      # DB connection
│   ├── tests/
│   ├── requirements.txt
│   └── inventory.db         # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── package.json
│
└── specs/                   # Design documents
    └── 001-computer-inventory/
```

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/computers` | List all computers (with filters) |
| POST | `/api/v1/computers` | Create new computer |
| GET | `/api/v1/computers/{serial}` | Get computer details |
| PUT | `/api/v1/computers/{serial}` | Update computer |
| DELETE | `/api/v1/computers/{serial}` | Soft delete computer |
| POST | `/api/v1/computers/{serial}/restore` | Restore deleted computer |
| GET | `/api/v1/computers/export` | Export to CSV |
| POST | `/api/v1/computers/import` | Import from CSV |
| GET | `/api/v1/admin/deleted` | List deleted computers |

## Common Issues

### Backend won't start

- Ensure Python 3.11+ is installed: `python --version`
- Ensure virtual environment is activated
- Ensure all dependencies installed: `pip install -r requirements.txt`

### Frontend can't connect to backend

- Ensure backend is running on port 8000
- Check for CORS issues in browser console
- Verify API URL in frontend config

### Database errors

- Delete `inventory.db` and restart to recreate fresh database
- Check file permissions in backend directory

## MySQL Production Setup

The application defaults to SQLite for development. For production, configure MySQL:

### Prerequisites

- MySQL 8.0+ server running
- Database created: `CREATE DATABASE inventory_tracker;`
- User with permissions on the database

### Configure MySQL Connection

Set the `DATABASE_URL` environment variable:

```bash
# Windows (PowerShell)
$env:DATABASE_URL = "mysql+pymysql://user:password@localhost:3306/inventory_tracker"

# macOS/Linux
export DATABASE_URL="mysql+pymysql://user:password@localhost:3306/inventory_tracker"
```

### Run Migrations

```bash
cd backend
alembic upgrade head
```

### Migrate Data from SQLite

If you have existing data in SQLite to migrate:

```bash
# 1. Export from SQLite (with SQLite DATABASE_URL or default)
python -m app.scripts.export_data > data.json

# 2. Set MySQL DATABASE_URL (see above)

# 3. Run migrations on MySQL
alembic upgrade head

# 4. Import data to MySQL
python -m app.scripts.import_data data.json
```

### Verify MySQL Connection

```bash
uvicorn app.main:app --reload
# Check http://localhost:8000/docs - should connect to MySQL
```

## Next Steps

- Review the [API contract](./contracts/openapi.yaml) for full endpoint documentation
- See [data-model.md](./data-model.md) for database schema details
- See [plan.md](./plan.md) for full database migration strategy
- Run tests with `pytest` in the backend directory
