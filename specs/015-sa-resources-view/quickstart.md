# Quickstart: SA Resources Pivot View

**Feature**: 015-sa-resources-view
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

### 2. Test SA Resources View Toggle

1. Click the **"SA Resources"** toggle button
2. Verify:
   - Table switches to SA Resources view
   - Only 5 columns visible: Provider, URL, CCM Owner, Username, Password
   - All visible records have Status = "Active"
   - All visible records have Access Level = "Consultant"

### 3. Test Column Display

1. With SA Resources view active, verify only these columns appear:
   - **Provider** - Subscription provider name
   - **URL** - Clickable link to the resource
   - **CCM Owner** - Owner within CCM
   - **Username** - Login username
   - **Password** - Login password

2. Verify no other columns from default view are visible

### 4. Test Filtering

1. Count total subscriptions in default view
2. Switch to SA Resources view
3. Verify:
   - Only Active subscriptions shown (no Inactive)
   - Only Consultant access level shown (not Public, Team Only, etc.)
   - Record count should be less than or equal to default view

### 5. Test View Switching

1. Click "SA Resources" to activate
2. Click "AI Tools" to switch views
3. Verify: AI Tools view displays correctly
4. Click "SA Resources" again
5. Verify: SA Resources view displays correctly with proper columns

### 6. Test Toggle Off

1. With SA Resources active, click "SA Resources" again
2. Verify: Returns to default view with all columns

## Verification Checklist

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| SA Resources toggle activates | View switches to SA Resources | |
| Only 5 columns displayed | Provider, URL, CCM Owner, Username, Password | |
| Only Active records | No Inactive subscriptions visible | |
| Only Consultant access level | No other access levels visible | |
| URL column clickable | Links open in new tab | |
| Toggle off returns to default | All columns visible again | |
| Mutually exclusive with other views | Only one view active at a time | |
| Expand All button works | No error (no-op for flat list) | |

## Troubleshooting

**Wrong columns displayed:**
- Check that `SA_RESOURCES_COLUMNS` is defined in SubscriptionList.tsx
- Verify columnDefs switch case includes `case 'sa_resources'`

**Records not filtered correctly:**
- Check filteredSubscriptions useMemo in SubscriptionsPage.tsx
- Verify filter uses exact match for 'Consultant' and 'Active'

**Toggle button not working:**
- Verify `sa_resources` is in SUBSCRIPTION_VIEW_GROUP_KEYS
- Check toggleViewGroup function handles sa_resources
