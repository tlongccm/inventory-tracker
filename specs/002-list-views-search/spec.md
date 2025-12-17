# Feature Specification: Configurable List Views and Universal Search

**Feature Branch**: `002-list-views-search`
**Created**: 2025-12-16
**Status**: ✅ Implemented
**Input**: User description: "The main list should be able to display/hide some or all fields in a grouped manner. Always visible fields: equipment id, sub type, user, equipment name, status. Summary view: make, model, location, notes. Machine spec view: all spec related fields and serial number. Machine performance view. Assignment view. The status column should always be displayed as the last field in column ordering. When user view assignment history, the current assignment should be included. The sortable columns should have a visual indicator at the column header. Implement a universal search box with regex support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Column Group Views (Priority: P1)

As a staff member reviewing equipment inventory, I want to toggle different column groups on/off so that I can focus on the specific information I need without visual clutter.

**Why this priority**: This is the core functionality that enables users to customize their view based on their current task. Without this, the list becomes overwhelming with too many columns.

**Independent Test**: Can be fully tested by toggling each view group and verifying the correct columns appear/disappear while always-visible columns remain constant.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I load the page, **Then** I see the always-visible fields (Equipment ID, Sub Type, User, Equipment Name, Status) with Status as the last column.

2. **Given** the inventory list is displayed, **When** I enable the "Summary" view group, **Then** Make, Model, Location, and Notes columns appear between the always-visible fields and the Status column.

3. **Given** the inventory list with Summary view enabled, **When** I disable the "Summary" view group, **Then** Make, Model, Location, and Notes columns are hidden, leaving only the always-visible fields.

4. **Given** multiple view groups are enabled, **When** I view the column order, **Then** Status remains the last column regardless of which groups are active.

---

### User Story 2 - Universal Search Across All Fields (Priority: P1)

As a staff member, I want to search across all equipment fields using a single search box so that I can quickly find equipment regardless of which field contains my search term.

**Why this priority**: Search is essential for quickly locating equipment in a large inventory. Users often don't know which specific field contains the information they're looking for.

**Independent Test**: Can be fully tested by entering search terms and verifying matching records are returned based on any field match.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I type "Dell" in the search box, **Then** all equipment records containing "Dell" in any field are displayed.

2. **Given** the inventory list is displayed, **When** I search for a user name, **Then** all equipment assigned to that user appears in the results.

3. **Given** the inventory list is displayed, **When** I clear the search box, **Then** all equipment records are displayed again.

4. **Given** the inventory list is displayed, **When** I search for a term that matches no records, **Then** an appropriate "no results" message is displayed.

---

### User Story 3 - Regex Search Mode (Priority: P2)

As a power user, I want to use regular expressions in my search queries so that I can perform complex pattern matching to find equipment.

**Why this priority**: Regex support is a power-user feature that provides advanced filtering capabilities but is not essential for basic usage.

**Independent Test**: Can be fully tested by enabling regex mode and executing pattern-based searches.

**Acceptance Scenarios**:

1. **Given** the search box is displayed, **When** I enable regex mode, **Then** a visual indicator shows regex mode is active.

2. **Given** regex mode is enabled, **When** I enter `PC-00[0-9]{2}`, **Then** equipment with IDs matching that pattern (PC-0001 through PC-0099) are displayed.

3. **Given** regex mode is enabled, **When** I enter an invalid regex pattern, **Then** an error message indicates the pattern is invalid and no filtering occurs.

4. **Given** regex mode is disabled, **When** I enter a search term with special characters, **Then** the search treats them as literal characters, not regex operators.

---

### User Story 4 - Visual Sortable Column Indicators (Priority: P2)

As a staff member viewing the equipment list, I want to see which columns are sortable so that I can easily identify how to reorder the data.

**Why this priority**: Visual indicators improve discoverability but sorting itself already exists; this enhances the user experience.

**Independent Test**: Can be fully tested by viewing column headers and identifying sortable indicators.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I view the column headers, **Then** sortable columns have a visual indicator (icon or symbol) distinguishing them from non-sortable columns.

2. **Given** a sortable column header is displayed, **When** I hover over it, **Then** the cursor changes to indicate the column is interactive.

3. **Given** a column is sorted ascending, **When** I view its header, **Then** an upward arrow indicator shows the current sort direction.

4. **Given** a column is sorted descending, **When** I view its header, **Then** a downward arrow indicator shows the current sort direction.

---

### User Story 5 - Assignment History Includes Current Assignment (Priority: P2)

As a staff member reviewing equipment assignment history, I want the current assignment to appear as the first record in the history so that I have a complete picture of the equipment's assignment timeline.

**Why this priority**: Ensures data completeness in the assignment history view. Users need to see the full timeline including current state.

**Independent Test**: Can be fully tested by viewing assignment history for equipment with a current assignment.

**Acceptance Scenarios**:

1. **Given** equipment has been assigned to User A (current), **When** I view the assignment history, **Then** at least one record exists showing User A as the current assignment.

2. **Given** equipment was previously assigned to User A, then reassigned to User B (current), **When** I view assignment history, **Then** I see both assignments with User B's record marked or positioned as current.

3. **Given** equipment has never been assigned, **When** I view assignment history, **Then** the history shows an appropriate indication that no assignments exist.

---

### User Story 6 - Machine Specification View Group (Priority: P3)

As a technical staff member, I want to enable a Machine Specification view that shows all hardware spec fields and serial number so that I can review technical details.

**Why this priority**: Specialized view for technical users; not needed for day-to-day inventory management.

**Independent Test**: Can be fully tested by enabling the Machine Spec view group and verifying all specification-related fields appear.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I enable the "Machine Spec" view group, **Then** all specification-related fields (CPU, RAM, Storage, Serial Number, etc.) appear in the list.

2. **Given** the Machine Spec view is enabled, **When** I disable it, **Then** the specification fields are hidden.

---

### User Story 7 - Machine Performance View Group (Priority: P3)

As a technical staff member, I want to enable a Machine Performance view that shows PassMark benchmark scores so that I can assess equipment capabilities.

**Why this priority**: Specialized view for performance assessment; useful for capacity planning but not essential for basic inventory.

**Independent Test**: Can be fully tested by enabling the Machine Performance view group and verifying performance-related fields appear.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I enable the "Machine Performance" view group, **Then** PassMark CPU Score, PassMark RAM Score, PassMark Disk Score, and PassMark Overall Rating columns appear in the list.

2. **Given** the Machine Performance view is enabled, **When** I disable it, **Then** the PassMark score columns are hidden.

---

### User Story 8 - Assignment View Group (Priority: P3)

As a staff member managing equipment assignments, I want to enable an Assignment view that shows assignment-related details so that I can review who has what equipment.

**Why this priority**: Provides focused view for assignment management tasks.

**Independent Test**: Can be fully tested by enabling the Assignment view group and verifying assignment-related fields appear.

**Acceptance Scenarios**:

1. **Given** the inventory list is displayed, **When** I enable the "Assignment" view group, **Then** assignment-related fields (assigned user, assignment date, department, etc.) appear in the list.

2. **Given** the Assignment view is enabled, **When** I disable it, **Then** the assignment fields are hidden.

---

### Edge Cases

- What happens when a user enables all view groups simultaneously? The system displays all columns in a logical order with Status last.
- How does the system handle search when special regex characters are entered without regex mode? They are treated as literal characters.
- What happens when sorting is applied and then a search filter is executed? Both sort and filter are applied together.
- How does the system behave when no columns from a view group exist for a particular equipment type? The view group toggle has no visible effect for that equipment type.
- What happens when the user's view preferences are saved but the data model changes? Gracefully handle missing fields by ignoring them.

## Requirements *(mandatory)*

### Functional Requirements

#### Column View Management

- **FR-001**: System MUST display the following fields at all times: Equipment ID, Sub Type, User, Equipment Name, and Status.
- **FR-002**: System MUST position the Status column as the last (rightmost) column regardless of which view groups are enabled.
- **FR-003**: System MUST provide a "Summary" view group containing: Make, Model, Location, and Notes fields.
- **FR-004**: System MUST provide a "Machine Spec" view group containing: all specification-related fields and Serial Number.
- **FR-005**: System MUST provide a "Machine Performance" view group containing: PassMark CPU Score, PassMark RAM Score, PassMark Disk Score, and PassMark Overall Rating.
- **FR-006**: System MUST provide an "Assignment" view group containing: assignment-related fields (assigned user details, assignment date, department).
- **FR-007**: System MUST allow users to enable or disable each view group independently via toggle buttons/chips displayed above the table.
- **FR-008**: System MUST allow multiple view groups to be enabled simultaneously.
- **FR-008a**: Toggle buttons/chips MUST be always visible without requiring additional clicks to access.
- **FR-008b**: System MUST persist view group preferences in browser local storage so they survive browser close and restart.

#### Universal Search

- **FR-009**: System MUST provide a single search input box that searches across all equipment fields.
- **FR-010**: System MUST filter the equipment list in real-time as the user types (with reasonable debouncing for performance).
- **FR-011**: System MUST search across both visible and hidden fields.
- **FR-012**: System MUST provide a regex toggle to enable pattern-based searching.
- **FR-013**: System MUST display clear error feedback when an invalid regex pattern is entered.
- **FR-014**: System MUST treat special characters as literals when regex mode is disabled.

#### Sortable Column Indicators

- **FR-015**: System MUST display a visual indicator on column headers that support sorting.
- **FR-016**: System MUST show directional indicators (ascending/descending) on actively sorted columns.
- **FR-017**: System MUST change cursor style on hover for sortable column headers to indicate interactivity.

#### Assignment History

- **FR-018**: System MUST include the current assignment as a record when displaying assignment history.
- **FR-019**: System MUST display at least one record in assignment history for equipment with an active assignment.
- **FR-020**: System MUST clearly indicate which record represents the current assignment in the history view.

### Key Entities

- **View Group**: A named collection of related columns that can be toggled on/off together. Attributes: name, display order, list of included fields, enabled state.
- **Column Configuration**: Settings for each column including visibility, sortable flag, and display order. Linked to view groups.
- **Search Filter**: The active search criteria including search term, regex mode flag, and validation status.
- **Assignment History Record**: A record of equipment assignment including user, assignment date, end date (null for current), and status indicator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle any view group on/off within 1 second of clicking.
- **SC-002**: Search results update within 500 milliseconds of user input (after debounce delay).
- **SC-003**: 100% of sortable columns display a visual indicator distinguishing them from non-sortable columns.
- **SC-004**: Assignment history displays current assignment as a record 100% of the time when equipment has an active assignment.
- **SC-005**: Users can identify sortable columns without clicking them (visual indicator is sufficient).
- **SC-006**: Regex search correctly identifies pattern matches with 100% accuracy for valid patterns.
- **SC-007**: Invalid regex patterns display clear error feedback within 200 milliseconds.
- **SC-008**: The Status column remains in the last position regardless of view configuration 100% of the time.

## Clarifications

### Session 2025-12-16

- Q: What UI mechanism should be used for view group toggles? → A: Toggle buttons/chips above the table (visible, one-click access)
- Q: What fields belong in the Machine Performance view group? → A: PassMark test scores for CPU, RAM, Disk, and Overall rating
- Q: Should view preferences persist across browser sessions? → A: Yes, persist in browser local storage (survives browser close)
- Q: How should the main layout behave when columns expand? → A: Left-aligned layout. The centered layout causes columns to expand rightward while leaving unused space on the left, which feels unnatural. Change to left-aligned.

## Assumptions

1. The existing inventory list already supports column-level sorting functionality; this feature adds visual indicators.
2. Equipment fields are consistent across equipment types, though some fields may be empty for certain types.
3. View group preferences will be persisted in browser local storage, surviving browser close and restart.
4. The current assignment is determined by the most recent assignment record with no end date.
5. PassMark benchmark scores (CPU, RAM, Disk, Overall) already exist in the equipment data model.
6. Debounce delay for search will be approximately 300ms to balance responsiveness with performance.

## Implementation Status

**Last Updated**: 2025-12-16

### ✅ Fully Implemented (17/20 Functional Requirements)

| Requirement | Implementation Location |
|-------------|------------------------|
| FR-001: Always-visible fields | `frontend/src/utils/columns.ts` |
| FR-002: Status last column | `frontend/src/utils/columns.ts` |
| FR-003: Summary view group | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-004: Machine Spec view group | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-005: Machine Performance view group | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-006: Assignment view group | `frontend/src/components/ViewGroupToggle.tsx` |
| FR-007: Toggle buttons above table | `frontend/src/pages/InventoryPage.tsx` |
| FR-008: Multiple view groups simultaneously | `frontend/src/hooks/useViewPreferences.ts` |
| FR-008a: Always visible toggles | `frontend/src/pages/InventoryPage.tsx` |
| FR-008b: Persist preferences (localStorage) | `frontend/src/hooks/useViewPreferences.ts` |
| FR-009: Universal search box | `frontend/src/components/SearchBox.tsx` |
| FR-010: Real-time filtering (300ms debounce) | `frontend/src/components/SearchBox.tsx` |
| FR-011: Search hidden fields | `frontend/src/utils/search.ts` |
| FR-012: Regex toggle | `frontend/src/components/SearchBox.tsx` |
| FR-013: Invalid regex error feedback | `frontend/src/components/SearchBox.tsx` |
| FR-014: Literal characters when regex off | `frontend/src/utils/search.ts` |
| FR-015: Sortable column indicators (⇅ ▲ ▼) | `frontend/src/components/EquipmentList.tsx` |
| FR-016: Directional sort indicators | `frontend/src/components/EquipmentList.tsx` |
| FR-017: Cursor change on hover | `frontend/src/components/EquipmentList.tsx` |

### ⚠️ Needs Verification (3 Requirements)

| Requirement | Verification Method |
|-------------|---------------------|
| FR-018: Current assignment in history | Manual test: view history for assigned equipment |
| FR-019: At least one record for assigned equipment | Manual test: view history for newly assigned equipment |
| FR-020: Current assignment indicator | Manual test: check history UI for "current" marker |

### Additional Features Implemented

- **Resizable columns**: Users can drag column borders to resize (persisted to localStorage)
- **Left-aligned layout**: Container left-aligned to prevent unnatural column expansion
- **Column width persistence**: Custom hook `useColumnWidths.ts` saves column widths
