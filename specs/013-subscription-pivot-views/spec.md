# Feature Specification: Subscription Pivot Views (By Distribution & By Authentication)

**Feature Branch**: `013-subscription-pivot-views`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "Implement the 'By Distribution' pivot view in the subscription tab. The implementation should use the same approach as the 'AI Tools' pivot view. 1. Pivot view should group by 'Destination Email'. 2. Pivot view should show: Destination Email, Authentication Method, Provider. 3. Only include Active rows. Also implement 'By Authentication' pivot view in the subscriptions tab. The implementation should use the same approach as the 'AI Tools' pivot view. 1. Pivot view should group by 'Authentication Method'. 2. Columns include: Authentication method, Provider. 3. Only include Active rows."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Subscriptions Grouped by Distribution (Priority: P1)

A user wants to see all active subscriptions organized by where communications are delivered (Destination Email). This helps identify which email addresses are receiving subscription content and what services are associated with each destination. When the user clicks the "By Distribution" toggle button, the main subscription table is replaced with a grouped view where rows are organized by Destination Email, showing related authentication methods and providers.

**Why this priority**: Distribution-based grouping is the primary use case described. Users need to quickly audit which email addresses receive subscription content for compliance, security, and organizational purposes.

**Independent Test**: Can be fully tested by clicking the "By Distribution" button and verifying rows are grouped by Destination Email, group headers show item counts, and only Active subscriptions are displayed.

**Acceptance Scenarios**:

1. **Given** the subscription list is displayed with the main table, **When** the user clicks the "By Distribution" button, **Then** the main table is replaced with a grouped view showing only subscriptions with status "Active", where rows are organized by Destination Email (as collapsible group headers), with 2 data columns: Authentication Method, Provider.

2. **Given** the By Distribution grouped view is active (button shows selected state), **When** the user clicks the "By Distribution" button again, **Then** the view returns to the default main table view.

3. **Given** the By Distribution grouped view is active, **When** the user clicks a different view button (e.g., "AI Tools" or "By Authentication"), **Then** the By Distribution grouped view is deactivated and the new view is shown.

4. **Given** the By Distribution grouped view is displayed, **When** the user views a group header (e.g., "research@company.com"), **Then** the group header shows the item count (e.g., "(5)") for that destination email.

5. **Given** the By Distribution grouped view is displayed, **When** the user clicks the expand/collapse arrow on a group header, **Then** the group expands or collapses to show/hide its child rows.

6. **Given** a subscription has a null or empty Destination Email, **When** displayed in the By Distribution grouped view, **Then** it appears under a "(No Destination Email)" group or similar placeholder.

---

### User Story 2 - View Subscriptions Grouped by Authentication Method (Priority: P1)

A user wants to see all active subscriptions organized by how users authenticate to access them (Authentication Method). This helps with security audits, password management planning, and identifying which services use similar authentication patterns. When the user clicks the "By Authentication" toggle button, the main subscription table is replaced with a grouped view where rows are organized by Authentication Method.

**Why this priority**: Authentication-based grouping is equally important as distribution grouping. Users need to audit authentication methods for security compliance and credential management.

**Independent Test**: Can be fully tested by clicking the "By Authentication" button and verifying rows are grouped by Authentication Method, group headers show item counts, and only Active subscriptions are displayed.

**Acceptance Scenarios**:

1. **Given** the subscription list is displayed with the main table, **When** the user clicks the "By Authentication" button, **Then** the main table is replaced with a grouped view showing only subscriptions with status "Active", where rows are organized by Authentication Method (as collapsible group headers), with 1 data column: Provider.

2. **Given** the By Authentication grouped view is active (button shows selected state), **When** the user clicks the "By Authentication" button again, **Then** the view returns to the default main table view.

3. **Given** the By Authentication grouped view is active, **When** the user clicks a different view button (e.g., "AI Tools" or "By Distribution"), **Then** the By Authentication grouped view is deactivated and the new view is shown.

4. **Given** the By Authentication grouped view is displayed, **When** the user views a group header (e.g., "SSO"), **Then** the group header shows the item count (e.g., "(12)") for that authentication method.

5. **Given** the By Authentication grouped view is displayed, **When** the user clicks the expand/collapse arrow on a group header, **Then** the group expands or collapses to show/hide its child rows.

6. **Given** a subscription has a null or empty Authentication Method, **When** displayed in the By Authentication grouped view, **Then** it appears under a "(No Authentication Method)" group or similar placeholder.

---

### User Story 3 - Maintain Interactivity in Grouped Views (Priority: P2)

While viewing either the By Distribution or By Authentication grouped view, users need to retain core table functionality including row selection to view subscription details, column sorting, and maintaining current search state.

**Why this priority**: Without interactivity, the grouped views would be read-only and less useful than the default view. This extends the base functionality established in the AI Tools view.

**Independent Test**: Can be tested by activating either grouped view, clicking a data row to verify detail modal opens, and clicking column headers to verify sorting works.

**Acceptance Scenarios**:

1. **Given** the By Distribution grouped view is displayed, **When** the user clicks on a data row, **Then** the subscription detail modal opens showing full subscription information.

2. **Given** the By Authentication grouped view is displayed, **When** the user clicks on a data row, **Then** the subscription detail modal opens showing full subscription information.

3. **Given** a search term is active in the search box, **When** the user activates the By Distribution grouped view, **Then** only subscriptions matching the search are displayed in the grouped view.

4. **Given** a search term is active in the search box, **When** the user activates the By Authentication grouped view, **Then** only subscriptions matching the search are displayed in the grouped view.

5. **Given** either grouped view is displayed, **When** the user clicks a column header (e.g., "Provider"), **Then** the table sorts by that column.

---

### Edge Cases

- What happens when Destination Email is null or empty? Display as "(No Destination Email)" group.
- What happens when Authentication Method is null or empty? Display as "(No Authentication Method)" group.
- What happens when all subscriptions are Inactive? Display empty state with message "No active subscriptions found."
- What happens when only one subscription exists for a group? Display the group with count (1) and single child row.

## Requirements *(mandatory)*

### Functional Requirements

**By Distribution View:**

- **FR-001**: System MUST replace the main subscription table with a grouped table when "By Distribution" button is clicked
- **FR-002**: The By Distribution grouped view MUST use AG Grid row grouping with rows grouped by Destination Email (subscriber_email field). The following 2 data columns MUST be displayed: Authentication Method (authentication), Provider (provider)
- **FR-003**: The By Distribution view MUST filter subscriptions to only show items where status equals "Active"
- **FR-004**: Clicking the "By Distribution" button when already active MUST return to the default main table view

**By Authentication View:**

- **FR-005**: System MUST replace the main subscription table with a grouped table when "By Authentication" button is clicked
- **FR-006**: The By Authentication grouped view MUST use AG Grid row grouping with rows grouped by Authentication Method (authentication field). The following 1 data column MUST be displayed: Provider (provider)
- **FR-007**: The By Authentication view MUST filter subscriptions to only show items where status equals "Active"
- **FR-008**: Clicking the "By Authentication" button when already active MUST return to the default main table view

**Shared Requirements:**

- **FR-009**: Both grouped tables MUST support row click to open subscription detail modal (data rows only, not group headers)
- **FR-010**: Both grouped tables MUST support column sorting (click header to sort ascending/descending)
- **FR-011**: Current search state MUST be preserved when switching between views
- **FR-012**: Both grouped views MUST respect the existing mutually exclusive toggle behavior (only one view active at a time)
- **FR-013**: The active view button MUST maintain its visual selected state while active
- **FR-014**: Group headers MUST display item count for each group
- **FR-015**: All groups MUST be expanded by default when entering either grouped view
- **FR-016**: Both views MUST inherit the Status Bar functionality (row count, cell selection statistics) from the existing grid implementation

### Key Entities

- **SubscriptionListItem**: Existing entity containing subscriber_email (Destination Email), authentication (Authentication Method), provider, and status fields
- **SubscriptionViewGroupKey**: Existing type for view group toggles - by_distribution and by_category keys already exist as placeholders

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between main table and either grouped view in under 1 second with no page reload
- **SC-002**: All specified data columns display correctly for 100% of active subscriptions in the dataset
- **SC-003**: Users can complete row selection and sorting actions identically to the main table experience
- **SC-004**: View toggle state persists correctly across search operations (view not reset when filtering)
- **SC-005**: Both views filter out all Inactive subscriptions (0 Inactive subscriptions visible in grouped views)
- **SC-006**: Status Bar displays accurate row count for filtered active subscriptions

## Assumptions

- The existing toggle buttons "By Distribution" and "By Category" in SubscriptionsPage.tsx will be repurposed - "By Distribution" remains as-is, and "By Category" will be replaced with "By Authentication"
- The implementation follows the same pattern as the AI Tools grouped view using AG Grid Enterprise row grouping
- No new backend API endpoints are required - all data is already available in SubscriptionListItem
- The existing mutually exclusive toggle behavior and visual styling will be reused
- Group headers use the same styling as the AI Tools view

## Terminology

The following canonical terms are used throughout this specification:

| Canonical Term            | Definition                                                               | Avoid Using         |
|---------------------------|--------------------------------------------------------------------------|---------------------|
| **Grouped View**          | The pivot view using AG Grid row grouping by a specific field            | "pivot table"       |
| **Group Header**          | The collapsible row showing the grouping field value with item count     | "group row"         |
| **Data Row**              | An individual subscription row within a group                            | "child row"         |
| **Default View**          | The standard flat table view (all columns, no grouping)                  | "main table"        |
| **Destination Email**     | The subscriber_email field - where subscription communications are sent  | "subscriber email"  |
| **Authentication Method** | The authentication field - how users log in to access the subscription   | "auth method"       |
