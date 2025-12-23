# Research: URL Features

**Feature**: 010-url-features
**Date**: 2025-12-22

## Research Tasks

### 1. URL State Management Approach

**Question**: How should app configuration state be synchronized with browser URL?

**Decision**: Use react-router-dom's useSearchParams hook combined with a custom useUrlState hook.

**Rationale**:
- react-router-dom is already a project dependency
- useSearchParams provides native integration with React Router
- Custom hook abstracts encoding/decoding logic for reuse across pages
- No new dependencies needed

**Alternatives considered**:
- Manual History API manipulation: Rejected - more complex, doesn't integrate with React Router
- Third-party state management libraries (zustand-querystring, etc.): Rejected - violates YAGNI/Simplicity First
- Hash-based routing: Rejected - query parameters are more standard and readable

### 2. URL Encoding Strategy

**Question**: How should filter and view state be encoded in URLs?

**Decision**: Use standard query string parameters with compact key names.

**Rationale**:
- Standard format: `?tab=equipment&status=Active&sort=name&order=asc&views=license,purchase`
- Short key names keep URLs manageable
- Multiple values (view groups) encoded as comma-separated list
- Native URLSearchParams handles encoding/decoding

**URL Parameter Schema**:
| Parameter | Description | Example |
|-----------|-------------|---------|
| tab | Active tab | `tab=subscriptions` |
| status | Status filter | `status=Active` |
| type | Equipment type filter | `type=PC` |
| category | Category filter | `category_id=1` |
| owner | Owner filter | `owner=John` |
| search | Search term | `search=laptop` |
| sort | Sort column | `sort=provider` |
| order | Sort direction | `order=desc` |
| views | Active view groups | `views=license,purchase` |

**Alternatives considered**:
- Base64 encoded JSON: Rejected - not human-readable, harder to debug
- Abbreviated single-character keys: Rejected - too cryptic
- Nested object notation: Rejected - more complex parsing

### 3. Browser History Integration

**Question**: How should back/forward navigation work with URL state?

**Decision**: Use history.replaceState for filter changes, history.pushState for tab changes.

**Rationale**:
- Tab changes are significant navigation events → push new history entry
- Filter changes within same tab → replace current entry (avoids history pollution)
- React Router handles this through its navigate function with replace option
- Back button returns to previous tab, not previous filter state

**Alternatives considered**:
- Always push: Rejected - creates excessive history entries for minor filter changes
- Always replace: Rejected - loses tab navigation history
- Debounced push: Rejected - added complexity, confusing timing

### 4. Clickable URL Implementation

**Question**: How should subscription URLs be rendered as clickable links?

**Decision**: Use standard HTML anchor (`<a>`) element with target="_blank" and rel="noopener noreferrer".

**Rationale**:
- Native browser behavior
- Security best practice (noopener noreferrer prevents tab hijacking)
- Accessible by default (keyboard navigation, screen readers)
- No JavaScript click handlers needed

**Alternatives considered**:
- Custom onClick handler with window.open: Rejected - less accessible, reinvents the wheel
- Link component from react-router: Rejected - for external URLs, native anchor is simpler

### 5. Copy Link Button Implementation

**Question**: How should the "Copy Link" button work?

**Decision**: Use Clipboard API (navigator.clipboard.writeText) with toast notification for feedback.

**Rationale**:
- Modern browsers support Clipboard API
- Async operation with promise-based error handling
- Toast provides non-intrusive success/failure feedback
- Button placement: in toolbar next to Export/Import buttons

**Alternatives considered**:
- document.execCommand('copy'): Rejected - deprecated API
- Copy button per row: Rejected - overkill, one global button is sufficient
- No feedback: Rejected - user needs confirmation that copy succeeded

## Resolved Items

| Item | Resolution |
|------|------------|
| URL state management | useSearchParams hook + custom useUrlState hook |
| URL encoding | Standard query params with short keys |
| History management | Push for tabs, replace for filters |
| Clickable URLs | Native anchor with target="_blank" |
| Copy Link | Clipboard API with toast feedback |

## No NEEDS CLARIFICATION Items

All technical questions have been resolved through research and codebase analysis.
