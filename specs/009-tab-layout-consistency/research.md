# Research: Tab Layout Consistency

**Feature**: 009-tab-layout-consistency
**Date**: 2025-12-22

## Research Tasks

### 1. Existing Component Reuse Analysis

**Question**: Can existing components (SearchBox, ViewGroupToggle) be reused without modification?

**Decision**: Yes - both components are already generic and reusable.

**Rationale**:
- `SearchBox` component accepts props for value, onChange, isRegex, onRegexToggle, and error
- `ViewGroupToggle` component accepts preferences object and onToggle callback
- Both are used in InventoryPage and can be directly imported into other pages

**Alternatives considered**:
- Creating new components: Rejected - violates YAGNI and Simplicity First principles
- Extending existing components: Not needed - current API is sufficient

### 2. View Group State Management for Subscriptions

**Question**: How should view group preferences be stored for the Subscriptions tab?

**Decision**: Use the same localStorage pattern as Equipment tab, with subscription-specific key.

**Rationale**:
- Consistent with existing useViewPreferences hook pattern
- localStorage provides persistence without backend changes
- Placeholder buttons need state even before column toggling is implemented

**Alternatives considered**:
- Backend storage: Rejected - unnecessary complexity for UI preference
- Session storage: Rejected - preferences should persist across sessions
- No storage (always reset): Rejected - poor UX when returning to page

### 3. Filter Bar Label Styling

**Question**: How should filter dropdowns display without external labels?

**Decision**: Use placeholder text within select/input elements.

**Rationale**:
- Equipment tab FilterBar uses this pattern successfully
- Maintains functionality while reducing visual clutter
- CSS can style placeholder text for visibility

**Alternatives considered**:
- Hidden labels with aria-label: Acceptable for accessibility, can combine with placeholder
- Tooltip on hover: Rejected - less discoverable than placeholder

### 4. Layout Order Implementation

**Question**: What is the canonical layout order from Equipment tab?

**Decision**: Toolbar > Filter Bar > Search Box > View Group Toggle > List

**Rationale**: This is the established pattern in InventoryPage.tsx (lines 287-339):
1. Toolbar with action buttons
2. FilterBar component
3. SearchBox component
4. ViewGroupToggle component
5. EquipmentList component

**Implementation**: SoftwarePage currently has Search after ViewGroupToggle - swap order. SubscriptionsPage is missing Search and ViewGroupToggle entirely - add both.

## Resolved Items

| Item | Resolution |
|------|------------|
| Component reuse | Reuse SearchBox and ViewGroupToggle as-is |
| State management | localStorage with subscription-specific key |
| Filter labels | Placeholder text within inputs |
| Layout order | Toolbar > Filter > Search > ViewGroup > List |

## No NEEDS CLARIFICATION Items

All technical questions have been resolved through codebase analysis.
