# Quickstart: Tab Layout Consistency

**Feature**: 009-tab-layout-consistency
**Date**: 2025-12-22

## Prerequisites

- Existing Inventory Tracker application running
- Node.js 18+ with npm
- Frontend development server

## Development Setup

```bash
cd frontend
npm install   # If not already done
npm run dev   # Start development server
```

## Feature Implementation Overview

### 1. Software Tab Layout Fix

**File**: `frontend/src/pages/SoftwarePage.tsx`

**Change**: Move SearchBox component above ViewGroupToggle in the JSX render order.

**Before**:
```jsx
<ViewGroupToggle ... />
<SearchBox ... />
```

**After**:
```jsx
<SearchBox ... />
<ViewGroupToggle ... />
```

### 2. Subscriptions Tab Updates

**Files**:
- `frontend/src/pages/SubscriptionsPage.tsx` - Add SearchBox and ViewGroupToggle
- `frontend/src/components/SubscriptionFilterBar.tsx` - Remove external labels
- `frontend/src/utils/subscriptionColumns.ts` - Define view group constants (new file)

**Changes**:
1. Import SearchBox component
2. Add search state management
3. Import or create ViewGroupToggle for subscriptions
4. Define 4 placeholder view groups: AI Tools, SA Resources, By Distribution, By Category
5. Update filter bar to use placeholder text instead of external labels

### 3. Filter Bar Label Removal

**File**: `frontend/src/components/SubscriptionFilterBar.tsx`

**Change**: Remove `<label>` elements, add placeholder attributes to select/input elements.

## Verification Steps

1. **Software Tab**:
   - Navigate to Software tab
   - Verify layout order: Toolbar > Filters > Search > View Buttons > List

2. **Subscriptions Tab**:
   - Navigate to Subscriptions tab
   - Verify filter dropdowns have no external labels (placeholders only)
   - Verify Search box appears below filters
   - Verify 4 view group buttons appear below Search
   - Verify buttons toggle visually when clicked

3. **Cross-Tab Consistency**:
   - Compare layout across Equipment, Software, and Subscriptions tabs
   - Verify identical ordering of elements

## No Backend Changes

This feature is frontend-only. No backend server restart or database migrations required.
