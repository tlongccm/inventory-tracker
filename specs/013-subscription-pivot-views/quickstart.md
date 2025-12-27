# Quickstart: Subscription Pivot Views

**Feature**: 013-subscription-pivot-views
**Date**: 2025-12-27

## Prerequisites

- Node.js installed
- Backend running (for subscription data)
- Frontend dependencies installed

## Setup

```bash
# Start backend (if not running)
cd backend
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd frontend
npm run dev
```

## Testing the Feature

### 1. Access Subscriptions Page

Navigate to: http://localhost:3000/subscriptions

### 2. Test By Distribution View

1. Click the **"By Distribution"** toggle button
2. Verify:
   - Table switches to grouped view
   - Rows are grouped by Destination Email
   - Only Active subscriptions are shown
   - Group headers show item counts (e.g., "(5)")
   - Data columns visible: Authentication Method, Provider
3. Click a group header to expand/collapse
4. Click a data row to open the detail modal
5. Click **"By Distribution"** again to return to default view

### 3. Test By Authentication View

1. Click the **"By Authentication"** toggle button
2. Verify:
   - Table switches to grouped view
   - Rows are grouped by Authentication Method
   - Only Active subscriptions are shown
   - Group headers show item counts
   - Data column visible: Provider
3. Click a group header to expand/collapse
4. Click a data row to open the detail modal
5. Click **"By Authentication"** again to return to default view

### 4. Test Toggle Mutual Exclusivity

1. Click **"AI Tools"** button
2. Click **"By Distribution"** button
3. Verify: AI Tools is deselected, By Distribution is active
4. Click **"By Authentication"** button
5. Verify: By Distribution is deselected, By Authentication is active

### 5. Test Search Preservation

1. Enter a search term in the search box
2. Click **"By Distribution"** button
3. Verify: Grouped view shows only matching subscriptions
4. Click **"By Authentication"** button
5. Verify: Search still applied in new grouped view

### 6. Test Edge Cases

**Null/Empty Grouping Values:**
- If subscriptions have empty Destination Email, they should appear under a "(No Destination Email)" group
- If subscriptions have empty Authentication Method, they should appear under a "(No Authentication Method)" group

**Empty State:**
- If all subscriptions are Inactive, view should show empty state message

## Verification Checklist

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| By Distribution shows grouped view | Grouped by Destination Email | |
| By Distribution filters to Active only | No Inactive subscriptions visible | |
| By Distribution shows correct columns | Auth Method, Provider columns | |
| By Authentication shows grouped view | Grouped by Authentication Method | |
| By Authentication filters to Active only | No Inactive subscriptions visible | |
| By Authentication shows correct column | Provider column only | |
| Toggle buttons are mutually exclusive | Only one view active at a time | |
| Row click opens detail modal | Detail modal appears | |
| Search persists across view switches | Filtered results maintained | |
| View switch is fast | < 1 second, no page reload | |

## Troubleshooting

**Grid doesn't switch views:**
- Check browser console for errors
- Verify `viewMode` prop is being passed correctly

**Groups not expanding:**
- Ensure AG Grid Enterprise license is active
- Check that `groupDefaultExpanded={1}` is set

**Status Bar not showing:**
- Verify `statusBar` prop is configured on AgGridReact
- Check that `cellSelection={true}` is enabled
