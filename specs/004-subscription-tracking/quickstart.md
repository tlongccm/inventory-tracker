# Quickstart: Subscription Tracking

**Feature**: 004-subscription-tracking
**Date**: 2025-12-18

## Prerequisites

- Existing Inventory Tracker application running
- Python 3.11+ with virtual environment
- Node.js 18+ with npm

## Implementation Overview

This feature adds a new "Subscriptions" tab to track organization subscription services. It includes:
- Category and Subcategory management (database-backed, user-editable)
- Subscription CRUD with 27 fields
- Password obfuscation
- CSV import/export
- Soft delete with admin recovery

## Backend Implementation

### 1. Create Category and Subcategory Models

Create `backend/app/models/category.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="subcategories")

    __table_args__ = (
        Index('uq_subcategory_name_category', 'category_id', 'name', unique=True),
    )
```

### 2. Create Subscription Model

Create `backend/app/models/subscription.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, ForeignKey, Enum as SQLEnum, Text, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..database import Base

class SubscriptionStatus(str, PyEnum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"

class ValueLevel(str, PyEnum):
    HIGH = "H"
    MEDIUM = "M"
    LOW = "L"

class PaymentFrequency(str, PyEnum):
    MONTHLY = "Monthly"
    ANNUAL = "Annual"
    OTHER = "Other"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(String(10), unique=True, nullable=False, index=True)
    subscription_id_num = Column(Integer, nullable=False)

    # Core fields
    provider = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=True)
    link = Column(String(500))

    # Credentials
    authentication = Column(String(200))
    username = Column(String(200))
    password = Column(String(500))  # Obfuscated
    in_lastpass = Column(Boolean)
    access_level_required = Column(String(200))

    # Status and value
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    description_value = Column(Text)
    value_level = Column(SQLEnum(ValueLevel))
    ccm_owner = Column(String(200))
    subscription_log = Column(Text)

    # Financial
    payment_method = Column(String(200))
    cost = Column(String(100))
    annual_cost = Column(Numeric(12, 2))
    payment_frequency = Column(SQLEnum(PaymentFrequency))
    renewal_date = Column(Date)

    # Communication
    subscriber_email = Column(String(200))
    forward_to = Column(String(200))
    email_routing = Column(String(100))
    email_volume_per_week = Column(String(100))
    main_vendor_contact = Column(String(500))

    # Actions
    actions_todos = Column(Text)
    last_confirmed_alive = Column(Date)

    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    category = relationship("Category")
    subcategory = relationship("Subcategory")
```

### 3. Create Pydantic Schemas

Create `backend/app/schemas/category.py` and `backend/app/schemas/subscription.py` with Create, Update, ListItem, and Response schemas.

### 4. Create Service Layer

Create `backend/app/services/category.py`:
- CRUD operations for categories and subcategories
- Usage count queries
- Default seeding function

Create `backend/app/services/subscription.py`:
- CRUD operations
- ID generation (SUB-NNNN format)
- Password obfuscation/deobfuscation
- CSV import/export
- Renewal status calculation

### 5. Create API Routes

Create `backend/app/api/v1/categories.py`:
```python
# GET /categories - list with subcategories
# POST /categories - create
# GET /categories/{id} - get
# PUT /categories/{id} - update
# DELETE /categories/{id} - soft delete
# GET /categories/{id}/usage - count subscriptions
# GET /categories/{id}/subcategories - list
# POST /categories/{id}/subcategories - create
# PUT /subcategories/{id} - update
# DELETE /subcategories/{id} - soft delete
# GET /subcategories/{id}/usage - count subscriptions
```

Create `backend/app/api/v1/subscriptions.py`:
```python
# GET /subscriptions - list with filters
# POST /subscriptions - create
# GET /subscriptions/{id} - get details
# PUT /subscriptions/{id} - update
# DELETE /subscriptions/{id} - soft delete
# POST /subscriptions/{id}/restore - restore
# POST /subscriptions/import - CSV import
# GET /subscriptions/export - CSV export
```

### 6. Update Router Registration

In `backend/app/api/v1/__init__.py`:
```python
from .categories import router as categories_router
from .subscriptions import router as subscriptions_router

api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
```

### 7. Create Database Migration

```bash
cd backend
alembic revision --autogenerate -m "add_subscription_tables"
alembic upgrade head
```

### 8. Seed Default Categories

Create seed script or add to migration:
- 9 default categories
- 35 default subcategories (see data-model.md for full list)

## Frontend Implementation

### 1. Create Types

Create `frontend/src/types/category.ts`:

```typescript
export interface Category {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}
```

Create `frontend/src/types/subscription.ts`:

```typescript
export interface Subscription {
  subscription_id: string;
  provider: string;
  category_id?: number;
  category_name?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  status: 'Active' | 'Inactive';
  // ... all 27 fields
  renewal_status?: 'ok' | 'warning' | 'urgent' | 'overdue';
}
```

### 2. Add API Methods

Update `frontend/src/services/api.ts`:

```typescript
export const categoryApi = {
  list: (includeInactive?: boolean) =>
    api.get<Category[]>('/categories', { params: { include_inactive: includeInactive } }),
  create: (data: CategoryCreate) => api.post<Category>('/categories', data),
  update: (id: number, data: CategoryUpdate) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  getUsage: (id: number) => api.get<{ subscription_count: number }>(`/categories/${id}/usage`),
  // Subcategories
  createSubcategory: (categoryId: number, data: SubcategoryCreate) =>
    api.post<Subcategory>(`/categories/${categoryId}/subcategories`, data),
  updateSubcategory: (id: number, data: SubcategoryUpdate) =>
    api.put<Subcategory>(`/subcategories/${id}`, data),
  deleteSubcategory: (id: number) => api.delete(`/subcategories/${id}`),
};

export const subscriptionApi = {
  list: (params?: SubscriptionFilters) => api.get<Subscription[]>('/subscriptions', { params }),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`),
  create: (data: SubscriptionCreate) => api.post<Subscription>('/subscriptions', data),
  update: (id: string, data: SubscriptionUpdate) => api.put<Subscription>(`/subscriptions/${id}`, data),
  delete: (id: string) => api.delete(`/subscriptions/${id}`),
  restore: (id: string) => api.post<Subscription>(`/subscriptions/${id}/restore`),
  import: (file: File) => { /* multipart upload */ },
  export: () => api.get('/subscriptions/export', { responseType: 'blob' }),
};
```

### 3. Create Category Context (Single Source of Truth)

Create `frontend/src/contexts/CategoryContext.tsx`:

```typescript
const CategoryContext = createContext<{
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
}>({ categories: [], loading: true, refresh: async () => {} });

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await categoryApi.list();
    setCategories(data);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refresh }}>
      {children}
    </CategoryContext.Provider>
  );
}
```

### 4. Create Subscriptions Page

Create `frontend/src/pages/SubscriptionsPage.tsx`:
- List view with view group toggles
- Search and filter controls
- Add/Edit modal
- Detail panel on row click
- Renewal status indicators (color-coded)

### 5. Create Subscription Form

Create `frontend/src/components/SubscriptionForm.tsx`:
- Form with all 27 fields
- Category dropdown (from context)
- Subcategory dropdown (filtered by selected category)
- Password field with show/hide toggle
- Date pickers for date fields
- Dropdowns for enum fields

### 6. Create Category Manager (Admin)

Create `frontend/src/components/CategoryManager.tsx`:
- List categories with edit/delete
- Add new category button
- Expand to show subcategories
- Usage count shown before delete
- Inline editing

### 7. Update Navigation

Add "Subscriptions" tab to navigation header.

### 8. Update Admin Page

Add sections for:
- Category/Subcategory management
- Subscription restore capability

## Testing

### Manual Testing Checklist

**Categories:**
1. [ ] View all categories with subcategories
2. [ ] Add new category
3. [ ] Edit category name
4. [ ] Cannot delete category in use (shows count)
5. [ ] Delete unused category
6. [ ] Add subcategory to category
7. [ ] Edit subcategory
8. [ ] Delete unused subcategory

**Subscriptions:**
1. [ ] Navigate to Subscriptions tab
2. [ ] Create subscription with provider only
3. [ ] Create subscription with all fields
4. [ ] Category dropdown shows all categories
5. [ ] Subcategory dropdown filters by selected category
6. [ ] View subscription details (password visible)
7. [ ] Edit subscription
8. [ ] Delete subscription
9. [ ] Restore subscription from Admin panel
10. [ ] Search subscriptions
11. [ ] Filter by status, category, value level, owner
12. [ ] Toggle view groups
13. [ ] Renewal indicators show correctly (30/7 day thresholds)
14. [ ] Export to CSV
15. [ ] Import from CSV

## View Groups

| Group | Toggle Button | Fields |
|-------|---------------|--------|
| Always Visible | (none) | ID, Provider, Category, Status, CCM Owner |
| Access | Access View | Link, Auth, Username, Password*, In Lastpass, Access Level |
| Financial | Financial View | Payment Method, Cost, Annual Cost, Frequency, Renewal Date |
| Communication | Communication View | Subscriber Email, Forward To, Routing, Volume, Vendor Contact |
| Details | Details View | Subcategory, Description, Value Level, Log, Actions, Last Confirmed |

*Password shown as asterisks in list view, plaintext in detail view.

## File Checklist

### Backend
- [ ] `backend/app/models/category.py`
- [ ] `backend/app/models/subscription.py`
- [ ] `backend/app/schemas/category.py`
- [ ] `backend/app/schemas/subscription.py`
- [ ] `backend/app/services/category.py`
- [ ] `backend/app/services/subscription.py`
- [ ] `backend/app/api/v1/categories.py`
- [ ] `backend/app/api/v1/subscriptions.py`
- [ ] Update `backend/app/models/__init__.py`
- [ ] Update `backend/app/api/v1/__init__.py`
- [ ] Alembic migration
- [ ] Seed script for default categories

### Frontend
- [ ] `frontend/src/types/category.ts`
- [ ] `frontend/src/types/subscription.ts`
- [ ] `frontend/src/contexts/CategoryContext.tsx`
- [ ] `frontend/src/pages/SubscriptionsPage.tsx`
- [ ] `frontend/src/components/SubscriptionForm.tsx`
- [ ] `frontend/src/components/CategoryManager.tsx`
- [ ] Update `frontend/src/services/api.ts`
- [ ] Update `frontend/src/App.tsx` (routes, context provider)
- [ ] Update navigation component
- [ ] Update Admin page
