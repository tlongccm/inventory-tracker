# Feature Specification: SA Resources Pivot View

**Feature Branch**: `015-sa-resources-view`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "subscriptions tab's 'SA Resources' view should show: active only records, These columns: Provider URL CCM Owner Username Password, Access Level: Consultant"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View SA Resources with Consultant Access (Priority: P1)

When a user clicks the "SA Resources" toggle button in the Subscriptions tab, they see a filtered and simplified view showing only the resources relevant to consultants. This view displays active subscriptions with Consultant-level access in a clean table with essential columns: Provider, URL, CCM Owner, Username, and Password.

**Why this priority**: This is the core and only functionality of the feature - providing a focused view of consultant-accessible resources.

**Independent Test**: Click the "SA Resources" toggle button and verify only Active subscriptions with Access Level "Consultant" are displayed with the specified columns.

**Acceptance Scenarios**:

1. **Given** I am on the Subscriptions page viewing the default list, **When** I click the "SA Resources" toggle button, **Then** I see only Active subscriptions where Access Level is "Consultant"
2. **Given** I am viewing the SA Resources view, **When** I look at the table columns, **Then** I see only: Provider, URL, CCM Owner, Username, and Password columns
3. **Given** I am viewing the SA Resources view, **When** I look at the subscription records, **Then** all records shown have Status = "Active" and Access Level Required = "Consultant"
4. **Given** I am viewing the SA Resources view with the Expand All toggle, **When** I click "Expand All", **Then** all groups expand to show individual records

---

### Edge Cases

- **No Consultant-level subscriptions**: If there are no Active subscriptions with Consultant access level, the view shows an empty state message
- **Mixed access levels**: Only subscriptions with exactly "Consultant" access level are shown, not higher or lower levels
- **View switching**: Switching from SA Resources to another view or back to default properly resets the display

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST filter to show only subscriptions with Status = "Active" when SA Resources view is active
- **FR-002**: System MUST filter to show only subscriptions with Access Level Required = "Consultant" when SA Resources view is active
- **FR-003**: System MUST display exactly these columns in SA Resources view: Provider, URL, CCM Owner, Username, Password
- **FR-004**: System MUST hide all other columns that appear in the default subscription view
- **FR-005**: System MUST allow SA Resources view to be toggled on/off like other pivot views (AI Tools, By Distribution, By Authentication)
- **FR-006**: SA Resources view MUST be mutually exclusive with other pivot views (only one active at a time)
- **FR-007**: System MUST support the Expand All/Collapse All toggle button in SA Resources view

### Key Entities

- **Subscription**: The primary data entity with fields including provider, link (URL), ccm_owner, username, password, status, and access_level_required
- **Access Level**: Classification field with values including "Consultant" that determines who can access the subscription

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access SA Resources view with a single click on the toggle button
- **SC-002**: View displays only the 5 specified columns (Provider, URL, CCM Owner, Username, Password)
- **SC-003**: 100% of displayed records have Status = "Active" and Access Level = "Consultant"
- **SC-004**: View toggle operates in under 100ms (instant visual feedback)
- **SC-005**: Expand All/Collapse All functionality works consistently with other pivot views

## Assumptions

- The "SA Resources" toggle button already exists in the UI but currently has no functionality (placeholder)
- Access Level Required field uses exact string matching for "Consultant" value
- The view does not require grouping - it displays a flat list of matching records
- URL column maps to the existing "link" field in the subscription data
