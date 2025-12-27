# Feature Specification: Pivot View Group Expand/Collapse Controls

**Feature Branch**: `014-group-expand-collapse`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "For all pivot views, by default, show all groups collapsed. Add a button to expand/collapse all groups"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Groups Collapsed by Default (Priority: P1)

When a user activates any pivot view (AI Tools, By Distribution, or By Authentication), all groups should be collapsed by default instead of expanded. This gives users a clean overview of the group structure without overwhelming them with details.

**Why this priority**: This is the foundational behavior change that affects the user's first interaction with grouped views. Without this, the expand/collapse controls would not make sense.

**Independent Test**: Activate any pivot view and verify all group rows show as collapsed (expandable) with no child rows visible.

**Acceptance Scenarios**:

1. **Given** I am on the Subscriptions page viewing the default list, **When** I click the "AI Tools" toggle button, **Then** all access level groups should appear collapsed with expand indicators
2. **Given** I am on the Subscriptions page viewing the default list, **When** I click the "By Distribution" toggle button, **Then** all destination email groups should appear collapsed with expand indicators
3. **Given** I am on the Subscriptions page viewing the default list, **When** I click the "By Authentication" toggle button, **Then** all authentication method groups should appear collapsed with expand indicators
4. **Given** I have manually expanded some groups in a pivot view, **When** I switch to a different pivot view, **Then** all groups in the new view should appear collapsed

---

### User Story 2 - Expand All Groups with One Click (Priority: P1)

Users need a quick way to expand all groups at once when they want to see all subscription details without clicking each group individually.

**Why this priority**: Equally critical as US1 - together they form the core feature. Without the ability to expand all groups, users would be frustrated clicking each group one by one.

**Independent Test**: Click the "Expand All" button and verify all groups expand to show their child rows.

**Acceptance Scenarios**:

1. **Given** I am viewing a pivot view with all groups collapsed, **When** I click the "Expand All" button, **Then** all groups should expand to reveal their child subscription rows
2. **Given** I am viewing a pivot view with some groups manually expanded and some collapsed, **When** I click the "Expand All" button, **Then** all groups should be expanded (already expanded groups remain expanded)
3. **Given** all groups are already expanded, **When** I click the "Expand All" button, **Then** the view should remain unchanged with all groups expanded

---

### User Story 3 - Collapse All Groups with One Click (Priority: P1)

Users need a quick way to collapse all groups at once to return to a clean overview or to reset the view after exploring details.

**Why this priority**: Completes the core expand/collapse functionality and provides symmetry with the Expand All feature.

**Independent Test**: Click the "Collapse All" button and verify all groups collapse to hide their child rows.

**Acceptance Scenarios**:

1. **Given** I am viewing a pivot view with all groups expanded, **When** I click the "Collapse All" button, **Then** all groups should collapse to hide their child subscription rows
2. **Given** I am viewing a pivot view with some groups manually expanded and some collapsed, **When** I click the "Collapse All" button, **Then** all groups should be collapsed
3. **Given** all groups are already collapsed, **When** I click the "Collapse All" button, **Then** the view should remain unchanged with all groups collapsed

---

### User Story 4 - Button Visibility Based on View Mode (Priority: P2)

The expand/collapse controls should only be visible when a pivot view is active, as they have no meaning in the default list view.

**Why this priority**: Important for clean UX but not core functionality - the buttons would still work correctly if shown in default view (they just wouldn't do anything useful).

**Independent Test**: Toggle between default and pivot views and verify buttons appear/disappear appropriately.

**Acceptance Scenarios**:

1. **Given** I am viewing the default subscription list (no pivot view active), **When** I look at the toolbar area, **Then** the "Expand All" and "Collapse All" buttons should not be visible
2. **Given** I am viewing any pivot view (AI Tools, By Distribution, or By Authentication), **When** I look at the toolbar area, **Then** both "Expand All" and "Collapse All" buttons should be visible
3. **Given** I have a pivot view active with the buttons visible, **When** I click the active pivot toggle to return to default view, **Then** the expand/collapse buttons should disappear

---

### Edge Cases

- **Empty groups**: If a pivot view has no data (e.g., no active subscriptions), the buttons should still be visible but have no effect
- **Single group**: If only one group exists, the buttons should still work for that single group
- **Search filtering**: When search reduces visible groups, expand/collapse should only affect visible groups
- **View switching**: Switching between pivot views should reset to collapsed state for the new view

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all groups in collapsed state by default when any pivot view is activated
- **FR-002**: System MUST provide an "Expand All" button that expands all currently visible group rows
- **FR-003**: System MUST provide a "Collapse All" button that collapses all currently visible group rows
- **FR-004**: System MUST hide the expand/collapse buttons when no pivot view is active (default list view)
- **FR-005**: System MUST show the expand/collapse buttons when any pivot view is active
- **FR-006**: System MUST preserve individual group expand/collapse state during user interactions within the same view
- **FR-007**: System MUST reset all groups to collapsed state when switching between different pivot views

### Key Entities

- **Pivot View**: A grouped display mode that organizes subscriptions by a specific field (AI Tools by access level, By Distribution by subscriber email, By Authentication by auth method)
- **Group Row**: A collapsible row that represents a grouping value and contains child subscription rows
- **Group State**: Whether a group row is expanded (showing children) or collapsed (hiding children)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can scan all group headers in under 5 seconds with groups collapsed by default
- **SC-002**: Users can expand all groups with a single click, taking less than 1 second to fully expand
- **SC-003**: Users can collapse all groups with a single click, taking less than 1 second to fully collapse
- **SC-004**: Button visibility changes within 100ms when switching between default and pivot views
- **SC-005**: 100% of pivot views (AI Tools, By Distribution, By Authentication) support the expand/collapse functionality consistently

## Assumptions

- The existing AG Grid Enterprise row grouping functionality supports programmatic expand/collapse operations
- The expand/collapse buttons will be placed in the view toggle area near the existing pivot view buttons
- No backend changes are required - this is purely a frontend feature
- Performance will remain acceptable even with many groups (50+ subscription groups)
