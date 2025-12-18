# Feature Specification: Software Inventory Tracking

**Feature Branch**: `003-software-tracking`
**Created**: 2025-12-16
**Status**: Planning
**Input**: User request: "Add another tab or page to the current app to track software."

## Software Fields

The software inventory tracks the following fields:

| Field | Description |
|-------|-------------|
| Software ID | Auto-generated unique identifier (SW-0001, SW-0002, etc.) |
| Category | Software category (e.g., Office, Security, Development) |
| Name | Software product name |
| Version | Version string |
| Key | License key or serial number |
| Type | License/software type (e.g., Subscription, Perpetual) |
| Purchase Date | Date of acquisition |
| Purchaser | Person who purchased |
| Vendor | Software vendor/supplier |
| Cost | Purchase cost |
| Deployment | Where/how software is deployed |
| Installation File Location | File path or URL to installation files |
| Status | Current status (e.g., Active, Inactive, Expired) |
| Comments | Additional notes |

## User Scenarios & Testing

### User Story 1 - View Software Inventory (Priority: P1)

As a staff member, I want to view a list of all software in our organization so that I can see what software licenses we have.

**Acceptance Scenarios**:

1. **Given** I navigate to the Software tab, **When** the page loads, **Then** I see a list of all software with columns for Software ID, Category, Name, Version, Vendor, and Status.

2. **Given** the software list is displayed, **When** I click on a software entry, **Then** a detail panel/modal opens showing all fields while remaining on the list page.

3. **Given** the software list is displayed, **When** I search for "Microsoft", **Then** all software containing "Microsoft" in any field is displayed.

---

### User Story 2 - Add New Software (Priority: P1)

As a staff member, I want to add new software entries so that I can track our software inventory.

**Acceptance Scenarios**:

1. **Given** I am on the Software page, **When** I click "Add Software", **Then** a form appears with fields for Category, Name, Version, Key, Type, Purchase Date, Purchaser, Vendor, Cost, Deployment, Status, and Comments.

2. **Given** I fill in the required software name and click Save, **Then** a new software entry is created with an auto-generated ID (SW-0001).

3. **Given** I enter all software details, **Then** the system saves all fields correctly.

---

### User Story 3 - Edit Software (Priority: P1)

As a staff member, I want to edit software entries so that I can keep information up to date.

**Acceptance Scenarios**:

1. **Given** I am viewing a software entry, **When** I click Edit, **Then** I can modify all software fields.

2. **Given** I update the version number, **When** I save, **Then** the software entry reflects the new version.

---

### User Story 4 - Delete and Recover Software (Priority: P2)

As a staff member, I want to delete software entries that are no longer relevant, and as an admin I want to recover accidentally deleted entries.

**Acceptance Scenarios**:

1. **Given** I am viewing a software entry, **When** I click Delete and confirm, **Then** the software is removed from the main list.

2. **Given** I am on the Admin page, **When** I view deleted software, **Then** I can see previously deleted software entries.

3. **Given** I see a deleted software entry, **When** I click Restore, **Then** the software reappears in the main software list.

---

### User Story 5 - Filter Software (Priority: P2)

As a staff member, I want to filter software by various fields so that I can find specific software quickly.

**Acceptance Scenarios**:

1. **Given** the software list is displayed, **When** I filter by Category, **Then** only software in that category is shown.

2. **Given** the software list is displayed, **When** I filter by Vendor, **Then** only software from that vendor is shown.

3. **Given** the software list is displayed, **When** I filter by Status, **Then** only software with that status is shown.

---

### User Story 6 - Import/Export Software CSV (Priority: P3)

As a staff member, I want to import software from CSV and export to CSV for bulk operations.

**Acceptance Scenarios**:

1. **Given** I have a CSV file with software data, **When** I import it, **Then** new software entries are created.

2. **Given** I want to backup or share software data, **When** I export to CSV, **Then** I receive a downloadable CSV file with all fields.

---

### Edge Cases

- What happens when importing duplicate software names? → Create new entries (different versions may have same name)
- How to handle invalid data in CSV import? → Report error, skip row
- What happens with empty optional fields? → Store as null, display as blank

## Requirements

### Functional Requirements

#### Software Management
- **FR-001**: System MUST provide a "Software" tab in the navigation.
- **FR-002**: System MUST display a list of software with sortable columns.
- **FR-003**: System MUST auto-generate software IDs in format SW-NNNN.
- **FR-004**: System MUST allow creating, editing, and soft-deleting software entries.

#### Column View Groups
- **FR-004a**: System MUST display always-visible fields: Software ID, Name, Category, Status.
- **FR-004b**: System MUST provide "License View" group containing: Type, Key, Version.
- **FR-004c**: System MUST provide "Purchase View" group containing: Purchase Date, Purchaser, Vendor, Cost.
- **FR-004d**: System MUST provide "Details View" group containing: Deployment, Installation File Location, Comments.
- **FR-004e**: System MUST allow toggling view groups via buttons/chips above the table.
- **FR-004f**: System MUST persist view group preferences in browser local storage.

#### Software Fields
- **FR-005**: System MUST track Category field as a dropdown with predefined values (Office, Security, Development, Business, Utilities) plus "Other" option for custom entry.
- **FR-006**: System MUST track Name field (required).
- **FR-007**: System MUST track Version field.
- **FR-008**: System MUST track Key (license key) field.
- **FR-009**: System MUST track Type field as a dropdown with predefined values (Subscription, Perpetual, Volume, OEM, Freeware, Open Source) plus "Other" option for custom entry.
- **FR-010**: System MUST track Purchase Date field.
- **FR-011**: System MUST track Purchaser field.
- **FR-012**: System MUST track Vendor field.
- **FR-013**: System MUST track Cost field.
- **FR-014**: System MUST track Deployment field.
- **FR-015**: System MUST track Installation File Location field.
- **FR-016**: System MUST track Status field as a dropdown with predefined values (Active, Inactive, Expired, Retired) plus "Other" option for custom entry.
- **FR-017**: System MUST track Comments field.

#### Data Operations
- **FR-018**: System MUST support CSV import for bulk software entry.
- **FR-019**: System MUST support CSV export for backup/reporting.
- **FR-020**: System MUST support universal search across all software fields.

#### Admin
- **FR-021**: System MUST show deleted software in Admin panel with restore capability.

### Key Entities

- **Software**: A software product with tracking information. Fields:
  - `software_id` (auto-generated, e.g., SW-0001)
  - `category`
  - `name` (required)
  - `version`
  - `key`
  - `type`
  - `purchase_date`
  - `purchaser`
  - `vendor`
  - `cost`
  - `deployment`
  - `install_location`
  - `status`
  - `comments`

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add, view, edit, and delete software within the new Software tab.
- **SC-002**: Software ID auto-generation produces unique IDs in SW-NNNN format.
- **SC-003**: All 14 specified fields are tracked and displayed correctly.
- **SC-004**: CSV import/export maintains data integrity for all software fields.
- **SC-005**: Soft-deleted software appears in Admin panel and can be restored.

## Clarifications

### Session 2025-12-16

- Q: Should Category and Status values be predefined or free-text? → A: Predefined dropdowns with "Other" option allowing custom entry
- Q: What should happen when a user clicks on a software entry? → A: Show detail view in a side panel or modal (stay on list page)
- Q: Should software list support column visibility toggles like equipment? → A: Yes, implement view groups (License View, Purchase View, Details View)

## Assumptions

1. Software tracking follows similar patterns to equipment tracking.
2. No authentication required (same as equipment).
3. Soft delete pattern applies (same as equipment).
4. Single-user environment (last-write-wins for concurrent edits).
5. All fields except Name are optional.
