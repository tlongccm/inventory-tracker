# Feature Specification: AI Tool Pivot View

**Feature Branch**: `012-ai-tool-pivot`
**Created**: 2025-12-23
**Updated**: 2025-12-27
**Status**: Implemented
**Input**: User description: "For the subscription tab, I want to build four pivot table views. I already have the placeholder buttons implemented. First, I want to build out the AI Tool pivot view. In this view, the following columns are shown: Access Level Required, Provider, Username, Password, Description & Value to CCM, Monthly Cost, Annual Cost. For this pivot view, completely replace the main table with the pivoted table."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View AI Tools Grouped Table (Priority: P1)

A user wants to see a focused view of all AI tool subscriptions with credential and cost information, organized by access level. When the user clicks the "AI Tools" toggle button, the main subscription table is replaced with a grouped view where rows are organized by Access Level Required, with collapsible group headers showing item counts and aggregated cost totals.

**Why this priority**: This is the core functionality - without this working, there is no feature. Users need to see AI-specific data organized by access level for easy navigation.

**Independent Test**: Can be fully tested by clicking the "AI Tools" button and verifying rows are grouped by Access Level, group headers show counts and cost totals, and data columns display correctly.

**Acceptance Scenarios**:

1. **Given** the subscription list is displayed with the main table, **When** the user clicks the "AI Tools" button, **Then** the main table is replaced with a grouped view showing only subscriptions with category "AI Tool" AND status "Active", where rows are organized by Access Level Required (as collapsible group headers), with 6 data columns: Provider, Username, Password, Description & Value to CCM, Monthly Cost, Annual Cost.

2. **Given** the AI Tools grouped view is active (button shows selected state), **When** the user clicks the "AI Tools" button again, **Then** the view returns to the default view.

3. **Given** the AI Tools grouped view is active, **When** the user clicks a different view button (e.g., "SA Resources"), **Then** the AI Tools grouped view is deactivated and the new view is shown.

4. **Given** the AI Tools grouped view is displayed, **When** the user views a group header (e.g., "Basic"), **Then** the group header shows the item count (e.g., "(5)") and aggregated Monthly Cost and Annual Cost totals for that group.

5. **Given** the AI Tools grouped view is displayed, **When** the user clicks the expand/collapse arrow on a group header, **Then** the group expands or collapses to show/hide its child rows.

---

### User Story 2 - Maintain Interactivity in Grouped View (Priority: P2)

While viewing the AI Tools grouped view, users need to retain core table functionality including row selection to view subscription details, sorting by any column, and maintaining current filter/search state.

**Why this priority**: Without interactivity, the grouped view would be read-only and less useful than the default view.

**Independent Test**: Can be tested by activating AI Tools view, clicking a data row to verify detail modal opens, and clicking column headers to verify sorting works.

**Acceptance Scenarios**:

1. **Given** the AI Tools grouped view is displayed, **When** the user clicks on a data row, **Then** the subscription detail modal opens showing full subscription information.

2. **Given** the AI Tools grouped view is displayed, **When** the user clicks a column header, **Then** the table sorts by that column (ascending on first click, descending on second click).

3. **Given** a search term is active in the search box, **When** the user activates the AI Tools grouped view, **Then** only subscriptions matching the search are displayed in the grouped view.

---

### User Story 3 - Monthly Cost Calculation Display (Priority: P3)

Users need to see a calculated Monthly Cost column in the AI Tools grouped view. This value is derived from the existing cost data and payment frequency to normalize all subscriptions to a monthly rate for easy comparison.

**Why this priority**: Monthly cost is specified in the column requirements but doesn't exist as a direct field - it needs calculation logic. Core viewing functionality (P1, P2) should work first.

**Independent Test**: Can be tested by verifying the Monthly Cost column displays calculated values based on payment frequency (Annual costs divided by 12, Monthly costs shown as-is).

**Acceptance Scenarios**:

1. **Given** a subscription has an Annual payment frequency with a cost value, **When** displayed in the AI Tools grouped view, **Then** the Monthly Cost column shows the cost divided by 12.

2. **Given** a subscription has a Monthly payment frequency with a cost value, **When** displayed in the AI Tools grouped view, **Then** the Monthly Cost column shows the cost as-is.

3. **Given** a subscription has no cost data or "Other" payment frequency, **When** displayed in the AI Tools grouped view, **Then** the Monthly Cost column displays a dash or appropriate placeholder.

---

### User Story 4 - Cell Selection Statistics in Status Bar (Priority: P4)

Users need to quickly see aggregate statistics (count, sum, average) when selecting cells in the grid. This helps with ad-hoc analysis without requiring external tools.

**Why this priority**: This is an enhancement that adds value to both the default and AI Tools views, but the core grouped view functionality (P1-P3) should work first.

**Independent Test**: Can be tested by selecting cells in the grid and verifying the status bar at the bottom displays accurate statistics.

**Acceptance Scenarios**:

1. **Given** the subscription grid is displayed (default or AI Tools view), **When** the user views the bottom of the grid, **Then** a status bar is visible showing the total row count.

2. **Given** the subscription grid is displayed, **When** the user selects multiple cells by clicking and dragging, **Then** the status bar displays the count of selected cells.

3. **Given** the user has selected cells containing numeric values (e.g., cost columns), **When** viewing the status bar, **Then** it displays sum and average of the selected numeric values.

4. **Given** the user changes their cell selection, **When** adding or removing cells from the selection, **Then** the status bar statistics update in real-time.

---

### Edge Cases

- What happens when a subscription has null/empty values for grouped view columns? Display empty cells or dashes consistently.
- What happens when Annual Cost exists but payment frequency is null? Use Annual Cost divided by 12 for Monthly Cost estimate.
- What happens when the password field is empty? Display empty cell (do not mask empty values).
- What happens when Access Level Required is null? Display as "(No Access Level)" group or similar placeholder.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace the main subscription table with a grouped table when "AI Tools" button is clicked
- **FR-002**: The AI Tools grouped view MUST use AG Grid row grouping with rows grouped by Access Level Required. The following 6 data columns MUST be displayed: Provider, Username, Password, Description & Value to CCM, Monthly Cost, Annual Cost
- **FR-014**: The AI Tools view MUST filter subscriptions to only show items where category_name equals "AI Tool"
- **FR-015**: The AI Tools view MUST filter subscriptions to only show items where status equals "Active"
- **FR-003**: Clicking the "AI Tools" button when already active MUST return to the default main table view
- **FR-004**: The grouped table MUST support row click to open subscription detail modal (data rows only, not group headers)
- **FR-005**: The grouped table MUST support column sorting (click header to sort ascending/descending)
- **FR-006**: Current search and filter state MUST be preserved when switching between views
- **FR-007**: Monthly Cost MUST be calculated as: (cost / 12) for Annual frequency, (cost) for Monthly frequency, or derived from annual_cost if cost is unavailable
- **FR-008**: The grouped view MUST respect the existing mutually exclusive toggle behavior (only one view active at a time)
- **FR-009**: The active view button MUST maintain its visual selected state while active
- **FR-010**: Group headers MUST display item count and aggregated totals for Monthly Cost and Annual Cost columns
- **FR-011**: All groups MUST be expanded by default when entering the AI Tools view
- **FR-012**: The grid MUST display a Status Bar at the bottom showing total row count
- **FR-013**: When cells are selected, the Status Bar MUST display count, sum, and average of selected numeric values

### Key Entities

- **SubscriptionListItem**: Existing entity containing all subscription fields including access_level_required, provider, username, password, description_value, cost, annual_cost, payment_frequency
- **ColumnDef**: Existing column definition interface used to define pivot table columns
- **SubscriptionViewGroupKey**: Existing type for view group toggles (ai_tools, sa_resources, by_distribution, by_category)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between main table and AI Tools grouped view in under 1 second with no page reload
- **SC-002**: All 6 data columns and group column display correctly for 100% of subscriptions in the dataset
- **SC-003**: Monthly Cost calculation is accurate for all subscriptions with known cost/frequency data
- **SC-004**: Users can complete row selection and sorting actions identically to the main table experience
- **SC-005**: View toggle state persists correctly across search/filter operations (view not reset when filtering)
- **SC-006**: Status Bar displays accurate count, sum, and average when numeric cells are selected

## Assumptions

- The existing "AI Tools" toggle button in SubscriptionsPage.tsx will be wired to activate the grouped view
- Password values will be displayed in plain text (matching current main table behavior - deobfuscated)
- The grouped view uses the same filteredSubscriptions data source as the main table
- No new backend API endpoints are required - all data is already available in SubscriptionListItem
- Monthly Cost will be displayed with currency formatting matching Annual Cost column

## Terminology

The following canonical terms are used throughout this specification:

| Canonical Term | Definition | Avoid Using |
|----------------|------------|-------------|
| **Grouped View** | The AI Tools view using AG Grid row grouping by Access Level | "pivot view", "pivot table" |
| **Group Header** | The collapsible row showing Access Level value with item count and aggregated totals | "group row", "parent row" |
| **Data Row** | An individual subscription row within a group | "child row", "detail row" |
| **Default View** | The standard flat table view (all columns, no grouping) | "main table", "normal view" |
| **Status Bar** | The AG Grid footer showing row count and cell selection statistics | "footer", "aggregation bar" |

**Note**: Historical references to "pivot view" or "pivot table" in code comments or UI labels may persist but refer to the Grouped View described above.

## Accessibility

This feature relies on AG Grid Enterprise's built-in accessibility support:

- **Keyboard Navigation**: AG Grid provides full keyboard support for navigating cells, expanding/collapsing groups, and sorting columns
- **Screen Reader**: AG Grid generates appropriate ARIA attributes for grid structure, group headers, and cell content
- **Focus Management**: Focus is preserved when switching between Default View and Grouped View
- **No Custom Accessibility Requirements**: This feature does not introduce custom UI components requiring additional accessibility implementation

## Observability

**Not Applicable**: This is a frontend display feature with no server-side processing. No custom logging, metrics, or tracing is required beyond AG Grid's built-in console warnings for configuration issues during development.
