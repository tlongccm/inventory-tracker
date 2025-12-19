# Research: Subscription Tracking

**Feature**: 004-subscription-tracking
**Date**: 2025-12-18

## Research Tasks

### 1. Category/Subcategory Storage Approach

**Question**: How should Categories and Subcategories be stored to serve as single source of truth for both frontend and backend?

**Decision**: Database tables with API endpoints

**Rationale**:
- Database storage allows runtime modification without code deployment
- Single source of truth: frontend fetches from backend API
- Follows existing patterns in the codebase (equipment types, statuses)
- Supports soft delete and audit trail
- Admin UI can manage without backend changes

**Alternatives Considered**:
1. **JSON config file** - Rejected: Requires deployment to change, harder to maintain referential integrity
2. **TypeScript/Python constants** - Rejected: Hardcoded, requires code changes to update
3. **Environment variables** - Rejected: Not suitable for hierarchical data
4. **Shared JSON file read by both** - Rejected: Synchronization issues, no referential integrity

**Implementation**:
- `categories` table with: id, name, display_order, is_active, created_at, updated_at
- `subcategories` table with: id, category_id (FK), name, display_order, is_active, created_at, updated_at
- API endpoints: GET /categories (with nested subcategories), POST/PUT/DELETE for admin
- Frontend fetches on app load and caches in React context/state
- Database seeding script populates default values on first run

---

### 2. Password Storage Approach

**Question**: How should passwords be stored for internal-network-only application?

**Decision**: Use base64 encoding with simple XOR obfuscation

**Rationale**:
- This is an internal-network-only application with no authentication
- The purpose is convenience (tracking credentials), not high-security storage
- Full encryption (e.g., AES with Fernet) would add complexity (key management, environment variables)
- Base64 with XOR provides basic obfuscation preventing casual plaintext exposure
- Database file itself should be protected by filesystem permissions

**Alternatives Considered**:
1. **Plaintext storage** - Rejected: Too easily exposed in database dumps or backups
2. **Fernet encryption** - Rejected: Overkill for internal tool, adds key management complexity
3. **Hashing** - Rejected: Passwords need to be retrievable, not just verified
4. **Environment-based key encryption** - Considered: Could be added later if security requirements increase

**Implementation**:
```python
import base64

XOR_KEY = 0x42

def obfuscate_password(password: str) -> str:
    if not password:
        return None
    obfuscated = bytes([ord(c) ^ XOR_KEY for c in password])
    return base64.b64encode(obfuscated).decode('utf-8')

def deobfuscate_password(obfuscated: str) -> str:
    if not obfuscated:
        return None
    data = base64.b64decode(obfuscated)
    return ''.join(chr(b ^ XOR_KEY) for b in data)
```

---

### 3. Existing Project Patterns

**Question**: What patterns should be followed from existing equipment/software tracking?

**Decision**: Follow existing patterns exactly

**Findings**:
- **Model Structure**: SQLAlchemy model in `backend/app/models/`
- **Schema Structure**: Pydantic schemas in `backend/app/schemas/`
- **API Structure**: FastAPI routes in `backend/app/api/v1/`
- **Service Layer**: Business logic in `backend/app/services/`
- **ID Generation**: `{PREFIX}-NNNN` format with per-type sequence counter
- **Soft Delete**: `is_deleted` boolean + `deleted_at` timestamp for subscriptions
- **Soft Delete (Categories)**: `is_active` boolean for enable/disable
- **Frontend Pages**: React components in `frontend/src/pages/`
- **API Client**: Centralized in `frontend/src/services/api.ts`

**Reusable Components**:
- Navigation tabs pattern (already exists)
- List/detail view pattern
- View group toggle buttons
- CSV import/export endpoints
- Admin panel restore capability

---

### 4. Category Deletion Strategy

**Question**: How should category/subcategory deletion be handled when records reference them?

**Decision**: Soft delete with in-use protection

**Rationale**:
- Prevent data orphaning by blocking deletion of in-use categories
- Use `is_active` flag for soft delete (category hidden from dropdowns but data preserved)
- Show count of affected subscriptions when deletion attempted
- Allow admin to reassign subscriptions before deletion if needed

**Implementation**:
- Before delete: COUNT subscriptions using this category
- If count > 0: Return 400 with message "Cannot delete: X subscriptions use this category"
- If count == 0: Set `is_active = False` (soft delete)
- Dropdown queries filter `WHERE is_active = TRUE`

---

### 5. Field Groupings for View Groups

**Question**: How should 27 fields be organized into view groups?

**Decision**: Five view groups with logical groupings

| View Group | Fields |
|------------|--------|
| **Always Visible** | Subscription ID, Provider, Category, Status, CCM Owner |
| **Access View** | Link, Authentication, Username, Password (masked), In Lastpass?, Access Level Required |
| **Financial View** | Payment Method, Cost, Annual Cost, Payment Frequency, Renewal Date |
| **Communication View** | Subscriber Email, Forward To, Email Routing, Email Volume Per Week, Main Vendor Contact |
| **Details View** | Subcategory, Description & Value to CCM, Value Level, Subscription Log & Workflow, Actions/To Do, Last Confirmed Alive |

**Rationale**: Groups are organized by domain concern - access/credentials, money/payments, email/communication, and general details.

---

### 6. Renewal Date Visual Indicator

**Question**: How should upcoming renewals be visually indicated?

**Decision**: Color-coded row highlighting with optional icon

**Implementation**:
- Renewals within 30 days: Yellow/amber background or warning icon
- Renewals within 7 days: Red/orange background or danger icon
- Expired renewals (past date): Strikethrough or dimmed with overdue indicator
- Implemented in frontend list view only (not affecting data)

---

## Resolved Clarifications

All technical context items are resolved. No NEEDS CLARIFICATION items remain.

| Item | Resolution |
|------|------------|
| Category/Subcategory storage | Database tables with API endpoints (single source of truth) |
| Category deletion | Soft delete with in-use protection |
| Password storage | Base64 + XOR obfuscation (adequate for internal tool) |
| View groups | 5 groups defined (see above) |
| Field types | All determined (see data-model.md) |
| Patterns | Follow existing equipment/software patterns |
| Renewal indicators | Color-coded rows with 30/7 day thresholds |
