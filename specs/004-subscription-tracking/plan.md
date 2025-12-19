# Implementation Plan: Software Tab Missing - Investigation & Fix

**Branch**: `004-subscription-tracking` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: User report: "The app should have three tabs to track: equipment, software, subscription. However, after adding subscription tracking, software tab disappeared."

## Summary

**Issue**: The Software tab is missing from the application after the subscription tracking feature was added.

**Root Cause**: The `004-subscription-tracking` branch was created from commit `decf687` (before the Software feature), missing the Software Inventory Tracking feature from commit `6dedf8a` on `003-software-tracking` branch.

**Solution**: Merge `003-software-tracking` into `004-subscription-tracking` to bring in the Software feature, then integrate the three tabs (Equipment, Software, Subscriptions) together.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/React 18 (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy, React, react-router-dom, Vite
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: pytest (backend), manual testing (frontend per constitution)
**Target Platform**: Web application, internal network
**Project Type**: Web application (frontend + backend separation)

## Constitution Check

*GATE: All principles verified as compatible*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Solution is a merge + minimal integration |
| II. Web Application Structure | ✅ PASS | Maintains frontend/backend separation |
| III. Data Integrity | ✅ PASS | No data model conflicts |
| IV. Pragmatic Testing | ✅ PASS | Manual verification acceptable |
| V. Incremental Delivery | ✅ PASS | Single focused fix |

## Investigation Findings

### Branch Analysis

```
003-software-tracking:     7743244 → 359ddd6 → decf687 → 6dedf8a
004-subscription-tracking: 7743244 → 359ddd6 → decf687 (uncommitted subscription work)
                                                   ↑
                                         Common ancestor (decf687)
```

The `004-subscription-tracking` branch diverged BEFORE the Software feature commit was made.

### Current State Comparison

| Component | 003-software-tracking | 004-subscription-tracking |
|-----------|----------------------|---------------------------|
| App.tsx tabs | Equipment, Software, Admin | Inventory, Subscriptions, Admin |
| SoftwarePage | ✅ Present | ❌ Missing |
| SubscriptionsPage | ❌ Missing | ✅ Present |
| CategoryContext | ❌ Not present | ✅ Present (for subscriptions) |

### Files Affected by Merge

From `003-software-tracking`:
- `frontend/src/App.tsx` - Has Software tab (will conflict)
- `frontend/src/pages/SoftwarePage.tsx` - New file needed
- `frontend/src/components/Software*.tsx` - Component files
- `backend/app/api/software.py` - API routes
- `backend/app/models/software.py` - Database model
- `backend/app/schemas/software.py` - Pydantic schemas
- `backend/app/services/software_service.py` - Business logic

## Resolution Approach

### Option A: Merge branches (Recommended)

1. Merge `003-software-tracking` into `004-subscription-tracking`
2. Resolve conflicts in `App.tsx` to include all three tabs
3. Ensure CategoryProvider wraps all routes appropriately
4. Verify all three pages work

**Pros**: Clean git history, preserves all work
**Cons**: Potential merge conflicts to resolve

### Option B: Cherry-pick software files

1. Cherry-pick or manually copy software-related files
2. Update App.tsx to add Software tab

**Pros**: More control over what gets merged
**Cons**: Loses commit history association

## Recommended Fix

Execute Option A with the following steps:

```bash
# 1. Merge software tracking branch
git merge 003-software-tracking

# 2. Resolve conflicts in App.tsx to have all three tabs:
#    - Equipment (or Inventory)
#    - Software
#    - Subscriptions
#    - Admin

# 3. Test all three pages work correctly
```

### Expected App.tsx After Fix

```tsx
<nav className="nav-links">
  <Link to="/">Equipment</Link>
  <Link to="/software">Software</Link>
  <Link to="/subscriptions">Subscriptions</Link>
  <Link to="/admin">Admin</Link>
</nav>

<Routes>
  <Route path="/" element={<InventoryPage />} />
  <Route path="/software" element={<SoftwarePage />} />
  <Route path="/subscriptions" element={<SubscriptionsPage />} />
  <Route path="/admin" element={<AdminPage />} />
</Routes>
```

## Project Structure

### Documentation (this feature)

```text
specs/004-subscription-tracking/
├── plan.md              # This file (investigation findings)
├── spec.md              # Subscription feature specification
└── (other artifacts as subscription feature progresses)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   ├── equipment.py      # Existing
│   │   ├── software.py       # From 003-software-tracking merge
│   │   └── subscriptions.py  # New (subscription feature)
│   ├── models/
│   │   ├── equipment.py      # Existing
│   │   ├── software.py       # From merge
│   │   └── subscription.py   # New
│   ├── schemas/
│   │   ├── equipment.py      # Existing
│   │   ├── software.py       # From merge
│   │   └── subscription.py   # New
│   └── services/
│       ├── equipment_service.py  # Existing
│       ├── software_service.py   # From merge
│       └── subscription.py       # New
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── Equipment*.tsx       # Existing
│   │   ├── Software*.tsx        # From merge
│   │   └── Subscription*.tsx    # New
│   ├── pages/
│   │   ├── InventoryPage.tsx    # Existing (equipment)
│   │   ├── SoftwarePage.tsx     # From merge
│   │   ├── SubscriptionsPage.tsx # New
│   │   └── AdminPage.tsx        # Existing
│   └── contexts/
│       └── CategoryContext.tsx  # New (for subscriptions)
└── tests/
```

**Structure Decision**: Web application with frontend/backend separation. The merge will combine software tracking (from feature branch) with subscription tracking (current work).

## Complexity Tracking

No constitution violations. This is a straightforward branch merge to integrate parallel feature development.
