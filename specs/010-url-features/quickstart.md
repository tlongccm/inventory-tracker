# Quickstart: URL Features

**Feature**: 010-url-features
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

### Part 1: Clickable Subscription URLs

**File**: `frontend/src/components/SubscriptionList.tsx`

**Change**: Update URL field cell rendering to use anchor tag.

**Implementation**:
```tsx
// Before
<td>{subscription.link || '-'}</td>

// After
<td>
  {subscription.link ? (
    <a
      href={subscription.link}
      target="_blank"
      rel="noopener noreferrer"
      className="clickable-url"
    >
      {subscription.link}
    </a>
  ) : '-'}
</td>
```

### Part 2: URL State Management

**New Files**:
- `frontend/src/hooks/useUrlState.ts` - Custom hook for URL synchronization
- `frontend/src/utils/urlParams.ts` - URL encoding/decoding utilities

**Key Functions**:
- `parseUrlParams(searchParams)` - Convert URL params to filter state
- `serializeFilters(filters)` - Convert filter state to URL params
- `useUrlState()` - Hook that syncs component state with URL

### Part 3: Page Updates

**Files**:
- `frontend/src/pages/InventoryPage.tsx`
- `frontend/src/pages/SoftwarePage.tsx`
- `frontend/src/pages/SubscriptionsPage.tsx`

**Changes per page**:
1. Import useUrlState hook
2. Initialize filters from URL on page load
3. Update URL when filters/views/sort change
4. Add ShareLinkButton to toolbar

### Part 4: Share Link Button

**New File**: `frontend/src/components/ShareLinkButton.tsx`

**Implementation**:
- Button that copies current URL to clipboard
- Shows toast notification on success/failure
- Placed in toolbar alongside Export/Import buttons

## Verification Steps

### Clickable URLs
1. Navigate to Subscriptions tab
2. Ensure URL column is visible
3. Click on a URL value
4. Verify new browser tab opens with the URL

### Shareable URLs
1. Navigate to Equipment tab
2. Apply filters (e.g., Status = Active, Type = PC)
3. Click "Copy Link" button
4. Open new browser window/tab
5. Paste URL and navigate
6. Verify same filters are applied

### Browser History
1. Start on Equipment tab
2. Switch to Subscriptions tab
3. Apply a filter
4. Click browser back button
5. Verify return to Equipment tab (not previous filter state)

### URL Bookmarking
1. Configure desired view (tab, filters, sort)
2. Copy URL from browser address bar
3. Open URL in different browser
4. Verify same view configuration

## No Backend Changes

This feature is frontend-only. No backend server restart or database migrations required.
