# Quickstart: Pivot View Group Expand/Collapse Controls

**Feature**: 014-group-expand-collapse
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

### 2. Test Default Collapsed State

1. Click the **"AI Tools"** toggle button
2. Verify:
   - Table switches to grouped view
   - All groups are **collapsed by default** (showing only group headers)
   - Each group header shows the count indicator
3. Click **"AI Tools"** again to deselect, then click **"By Distribution"**
4. Verify: All groups are collapsed by default
5. Repeat for **"By Authentication"** view

### 3. Test Expand All Button

1. With a pivot view active (e.g., "AI Tools"), verify groups are collapsed
2. Click the **"Expand All"** button
3. Verify:
   - All groups expand to show child subscription rows
   - Operation completes quickly (< 1 second)
4. Click one group header to manually collapse it
5. Click **"Expand All"** again
6. Verify: All groups are now expanded (including the one you collapsed)

### 4. Test Collapse All Button

1. With a pivot view active and groups expanded, click **"Collapse All"**
2. Verify:
   - All groups collapse to hide child rows
   - Only group headers are visible
   - Operation completes quickly (< 1 second)
3. Click one group header to manually expand it
4. Click **"Collapse All"** again
5. Verify: All groups are now collapsed (including the one you expanded)

### 5. Test Button Visibility

1. Click any active pivot toggle to return to default view
2. Verify: "Expand All" and "Collapse All" buttons are **not visible**
3. Click any pivot view toggle (AI Tools, By Distribution, By Authentication)
4. Verify: Both buttons become **visible**

### 6. Test View Switching Reset

1. Click **"AI Tools"** toggle, then click **"Expand All"**
2. Click **"By Distribution"** toggle (switching to different pivot view)
3. Verify: All groups in By Distribution view are **collapsed** (reset)
4. Click **"Expand All"** in By Distribution view
5. Click **"AI Tools"** toggle again
6. Verify: AI Tools groups are collapsed (not remembering previous expand state)

## Verification Checklist

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| AI Tools view starts collapsed | All groups collapsed by default | |
| By Distribution view starts collapsed | All groups collapsed by default | |
| By Authentication view starts collapsed | All groups collapsed by default | |
| Expand All expands all groups | All groups show child rows | |
| Collapse All collapses all groups | All groups hide child rows | |
| Buttons hidden in default view | No expand/collapse buttons visible | |
| Buttons visible in pivot views | Both buttons visible | |
| View switch resets to collapsed | Groups collapsed when switching views | |
| Expand All is fast | < 1 second for all groups | |
| Collapse All is fast | < 1 second for all groups | |

## Troubleshooting

**Groups not starting collapsed:**
- Check that `groupDefaultExpanded={0}` is set in AgGridReact props
- Verify the grid key changes when view mode changes

**Expand/Collapse buttons not working:**
- Check browser console for errors
- Verify grid ref is properly connected
- Ensure `expandAllGroups` and `collapseAllGroups` are exposed via ref

**Buttons visible in default view:**
- Check that conditional rendering uses `activeViewMode !== 'default'`
