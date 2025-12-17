# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Equipment Inventory Tracker - A web application for managing organization equipment (PCs, monitors, scanners, printers) with full CRUD operations, CSV import/export, and assignment history tracking.

## Development Commands

### Backend (Python/FastAPI)

```bash
cd backend

# Setup
python -m venv venv
venv\Scripts\activate              # Windows
source venv/bin/activate           # macOS/Linux
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest tests/test_specific.py -v   # Single test file
pytest -k "test_name"              # Run specific test

# Database migrations (MySQL production)
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Frontend (React/TypeScript/Vite)

```bash
cd frontend

# Setup
npm install

# Run dev server (port 3000)
npm run dev
npm start                          # Alias for npm run dev

# Build
npm run build                      # TypeScript compile + Vite build

# Preview production build
npm run preview
```

### Quick Verification

- API docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Health check: http://localhost:8000/

## Architecture

- **Backend**: FastAPI REST API at `/api/v1/*`, SQLAlchemy ORM, Pydantic schemas
- **Frontend**: React 18 with react-router-dom, Vite bundler, TypeScript
- **Database**: SQLite (development), MySQL 8.0+ (production via `DATABASE_URL` env var)

### Backend Layers

- `app/api/` - Route handlers (controllers)
- `app/services/` - Business logic
- `app/models/` - SQLAlchemy models
- `app/schemas/` - Pydantic request/response schemas

### Frontend Structure

- `src/pages/` - Route pages (InventoryPage, AdminPage)
- `src/components/` - Reusable UI components
- `src/services/api.ts` - API client
- `src/types/` - TypeScript type definitions

## Key Design Decisions

1. **No authentication** - Open access on internal network
2. **Soft delete** - Records hidden but recoverable via admin section
3. **Last-write-wins** - No conflict detection for concurrent edits
4. **Assignment history** - Automatic tracking when assignment fields change
5. **Equipment ID format** - `{TYPE}-NNNN` (PC-0001, MON-0001, SCN-0001, PRN-0001)

## Constitution Principles

See `.specify/memory/constitution.md` for full details:

1. **Simplicity First** - YAGNI, minimal dependencies, explicit code over abstractions
2. **Data Integrity** - Validation at API boundaries, database constraints enforce rules
3. **Pragmatic Testing** - Focus on critical paths, manual testing acceptable for CRUD
4. **Incremental Delivery** - Small working increments, each providing user value

## Design Documents

Feature specifications are in `specs/001-computer-inventory/`:
- `spec.md` - Requirements and user stories
- `plan.md` - Implementation approach
- `data-model.md` - Database schema
- `contracts/openapi.yaml` - API contract
- `quickstart.md` - Detailed setup guide
