# Quickstart: AG Grid Row Grouping & Status Bar

**Feature**: 012-ai-tool-pivot
**Date**: 2025-12-27 (Updated)
**Update**: Row grouping for AI Tools view + Status Bar with cell selection statistics

## Prerequisites

- Node.js 18+ installed
- Backend server running (for subscription data)
- AG Grid Enterprise v35.0.0 already installed

## Development Setup

```bash
# 1. Checkout the feature branch
git checkout 012-ai-tool-pivot

# 2. Start backend (if not running)
cd backend
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Start frontend (new terminal)
cd frontend
npm run dev
```

## Testing the Feature

1. Open browser to http://localhost:3000
2. Navigate to **Subscriptions** tab
3. Click the **AI Tools** button in the view group toggle
4. Verify Row Grouping behavior:
   - Subscriptions grouped by **Access Level Required**
   - Expandable/collapsible group headers showing item count
   - Group headers display aggregated **Monthly Cost** and **Annual Cost** totals
   - 6 data columns: Provider, Username, Password, Description & Value to CCM, Monthly Cost, Annual Cost
   - Click expand/collapse arrow on group row to toggle
   - Click data row (not group row) to open detail modal
   - Clicking AI Tools again returns to default flat table

## AG Grid Row Grouping Features

| Feature | How to Use |
|---------|------------|
| Expand/Collapse Group | Click arrow on group row |
| Sort within groups | Click column header |
| Filter then group | Apply search/filter first, then click AI Tools |
| View all groups | All groups expanded by default |
| Group totals | Sum of Monthly/Annual costs shown on group row |

## Files Changed

| File | Changes |
|------|---------|
| `frontend/src/components/SubscriptionList.tsx` | Add `rowGroup: true` to AI_TOOLS_COLUMNS, add `autoGroupColumnDef`, add `groupDefaultExpanded` |

## Verification Checklist

### Core Functionality (FR-001, FR-002, FR-010, FR-011)
- [ ] AI Tools button toggles grouped view on/off
- [ ] Rows are grouped by Access Level Required
- [ ] Group headers show count (e.g., "Basic (5)")
- [ ] Group headers show aggregated cost totals
- [ ] Groups are expanded by default
- [ ] 6 data columns visible: Provider, Username, Password, Description & Value to CCM, Monthly Cost, Annual Cost

### Interactivity (FR-003, FR-004, FR-005, FR-006)
- [ ] Clicking group row expands/collapses (does NOT open modal)
- [ ] Clicking data row opens subscription detail modal
- [ ] Column sorting works within groups
- [ ] Search filtering works before grouping
- [ ] Reset button clears to flat table view

### Toggle Behavior (FR-008, FR-009)
- [ ] **[FR-008]** Only one pivot view active at a time: Click "AI Tools", then click "SA Resources" - AI Tools should deactivate
- [ ] **[FR-009]** Active button shows visual selected state (highlighted/pressed appearance)
- [ ] **[FR-009]** Inactive buttons show normal state

### Performance (SC-001)
- [ ] View switch completes in under 1 second (no page reload, smooth transition)

### No Errors
- [ ] No console errors related to row grouping

## Troubleshooting

### Group rows showing empty cells
Ensure `aggFunc: 'sum'` is set on cost columns for group-level aggregation.

### Clicking group row opens modal
Update `onRowClicked` to check `if (event.data)` - group rows have `data: undefined`.

### Group column not showing
Ensure `autoGroupColumnDef` is configured with proper header name and minimum width.

### All groups collapsed by default
Set `groupDefaultExpanded: -1` to expand all groups by default.

---

## Feature 2: Status Bar with Cell Selection Statistics

### Testing the Status Bar

1. Navigate to **Subscriptions** tab (either default or AI Tools view)
2. Look for the **status bar** at the bottom of the grid
3. Select cells by clicking and dragging:
   - Click a cell, then Shift+Click another cell to select a range
   - Or click and drag to select multiple cells
4. Verify statistics display:
   - **Count**: Shows number of selected cells
   - **Sum**: Shows total of numeric values (cost columns)
   - **Avg**: Shows average of numeric values

### Status Bar Features

| Feature | How to Use |
|---------|------------|
| Select single cell | Click on cell |
| Select range | Click + drag, or Shift+Click |
| View count | Always shows when cells selected |
| View sum/avg | Shows when numeric cells selected |
| Row count | Shows total rows on left side |

### Verification Checklist (Status Bar)

#### Row Count Display (FR-012)
- [ ] Status bar visible at bottom of grid
- [ ] Total row count shows on left side

#### Cell Selection Statistics (FR-013)
- [ ] Selecting cells shows "Count: X" on right side
- [ ] Selecting cost cells shows "Sum: $X" and "Avg: $X"
- [ ] Statistics update in real-time as selection changes

#### Cross-View Compatibility
- [ ] Works in default table view
- [ ] Works in AI Tools grouped view

### Troubleshooting (Status Bar)

#### Status bar not visible
Ensure `statusBar` is configured in grid options with `statusPanels` array.

#### No aggregation stats showing
Ensure `cellSelection: true` is set and you're selecting cells with numeric values.

#### Sum/Avg not showing for cost columns
Numeric values must be actual numbers, not formatted strings. Check that valueFormatter doesn't interfere with aggregation.
