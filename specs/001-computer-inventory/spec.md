# Feature Specification: Equipment Inventory Tracker

**Feature Branch**: `001-computer-inventory`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "Design a simple equipment inventory tracking app that allows staff to manage and audit all equipment (PCs, monitors, scanners, printers) used within the organization."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Inventory List (Priority: P1)

As a staff member, I want to view all equipment in the organization's inventory so that I can quickly see what equipment exists, who it is assigned to, and its current status.

**Why this priority**: The ability to view inventory is the foundational capability. Without it, no other features provide value. This delivers immediate visibility into organizational equipment.

**Independent Test**: Can be fully tested by loading the inventory list page and verifying that all equipment records display with their key attributes (equipment ID, name, model, user, status).

**Acceptance Scenarios**:

1. **Given** the inventory contains equipment records, **When** a user accesses the inventory list, **Then** all equipment is displayed showing Equipment ID, Equipment Name, Model, Equipment Type, Primary User, and Status.
2. **Given** the inventory is empty, **When** a user accesses the inventory list, **Then** a message indicates no equipment is currently tracked with an option to add the first record.
3. **Given** equipment exists in the inventory, **When** a user clicks on an equipment row, **Then** the full details are displayed including all specification and assignment fields.
4. **Given** the inventory contains multiple equipment types, **When** I filter by Equipment Type = "PC," **Then** only PCs are displayed.

---

### User Story 2 - Add and Edit Computer Records (Priority: P2)

As a staff member, I want to add new computers to the inventory and edit existing records so that the inventory stays accurate as equipment is acquired, reassigned, or changes state.

**Why this priority**: After viewing, the ability to maintain accurate records is essential. An inventory that cannot be updated becomes stale and loses value.

**Independent Test**: Can be fully tested by adding a new computer record with all fields, then editing that record to change the primary user and status.

**Acceptance Scenarios**:

1. **Given** I am on the inventory list, **When** I click "Add Computer," **Then** a form appears with all required fields organized by category (Specifications, Performance, Assignment).
2. **Given** I am adding a new computer, **When** I fill in all required fields and save, **Then** the computer appears in the inventory list with all entered data.
3. **Given** a computer exists in the inventory, **When** I edit its Primary User and Assignment Date, **Then** the changes are saved and reflected in both the list and detail views.
4. **Given** I am editing a computer record, **When** I change the Status to "Decommissioned," **Then** the record is updated and the computer appears with the new status in the inventory list.

---

### User Story 3 - Filter and Sort Inventory (Priority: P3)

As a staff member, I want to filter and sort the inventory list so that I can quickly find specific equipment or identify computers that meet certain criteria.

**Why this priority**: With a growing inventory, finding specific equipment becomes difficult. Filtering and sorting enable efficient auditing and equipment lookup.

**Independent Test**: Can be fully tested by applying filters (e.g., show only laptops with Usage Type = Work) and sorting (e.g., by Overall Performance Rating ascending) to verify results.

**Acceptance Scenarios**:

1. **Given** the inventory contains computers of different types, **When** I filter by Type = "Laptop," **Then** only laptops are displayed.
2. **Given** the inventory contains computers with various statuses, **When** I filter by Status = "Active," **Then** only active computers are shown.
3. **Given** I have filtered results displayed, **When** I sort by Overall Performance Rating (ascending), **Then** computers are reordered from lowest to highest rating.
4. **Given** I have applied filters, **When** I click "Clear Filters," **Then** all computers are displayed again without any filter applied.
5. **Given** the inventory list is displayed, **When** I filter by Primary User = "John Smith," **Then** only computers assigned to John Smith are shown.
6. **Given** the inventory list is displayed, **When** I filter by Usage Type = "Work," **Then** only computers designated for work use are shown.

---

### User Story 4 - Import and Export CSV (Priority: P4)

As a staff member, I want to import and export inventory data as CSV files so that I can back up the inventory, perform bulk edits in spreadsheet software, or integrate with other systems.

**Why this priority**: Data portability is important but less critical than core CRUD and filtering. Once basic inventory management works, import/export enables integration and backup workflows.

**Independent Test**: Can be fully tested by exporting current inventory to CSV, modifying the file, and re-importing to verify changes are applied.

**Acceptance Scenarios**:

1. **Given** the inventory contains records, **When** I click "Export to CSV," **Then** a CSV file is downloaded containing all equipment records with all fields as columns.
2. **Given** the inventory is empty, **When** I click "Export to CSV," **Then** a CSV file is downloaded containing column headers only (no data rows), allowing users to see the expected format for import.
3. **Given** I have a valid CSV file with equipment data, **When** I import it, **Then** new equipment is added and existing equipment (matched by Equipment ID first, then Serial Number if no Equipment ID) is updated.
4. **Given** I import a CSV with a new equipment record, **When** neither Equipment ID nor Serial Number matches existing records, **Then** a new record is created with an auto-generated Equipment ID.
5. **Given** I import a CSV with an existing Equipment ID or Serial Number, **When** fields differ from the current record, **Then** the existing record is updated with the CSV values.
6. **Given** I import a CSV with invalid data (e.g., missing Equipment Type), **When** the import is processed, **Then** an error report is displayed listing which rows failed and why.

---

### User Story 5 - View Assignment History (Priority: P5)

As a staff member, I want to view the assignment history of a computer so that I can see who has used the equipment over time and when it was reassigned.

**Why this priority**: Assignment history provides audit capability and helps track equipment lifecycle, but core CRUD and filtering are more essential for day-to-day operations.

**Independent Test**: Can be fully tested by reassigning a computer multiple times and verifying that the history view shows all previous assignments with dates.

**Acceptance Scenarios**:

1. **Given** a computer has been assigned to multiple users over time, **When** I view the computer's assignment history, **Then** I see a chronological list of all past assignments including user name, usage type, computer name, and assignment dates.
2. **Given** a computer is newly added with no reassignments, **When** I view its assignment history, **Then** I see only the initial assignment (or empty if never assigned).
3. **Given** I am viewing a computer's details, **When** I click "View History," **Then** the assignment history panel/section is displayed.
4. **Given** the assignment history is displayed, **When** I look at each entry, **Then** I can see: Previous User, Previous Usage Type, Previous Computer Name, Start Date, and End Date.

---

### Edge Cases

- What happens when a user tries to add equipment with a Serial Number that already exists? The system displays an error indicating the serial number is already in use.
- What happens when a user adds equipment without a Serial Number? The system creates the record using only the auto-generated Equipment ID as the identifier.
- What happens when a CSV import contains duplicate Serial Numbers? The system processes the last occurrence and logs a warning about duplicates.
- What happens when filtering returns no results? The system displays a message indicating no computers match the current filters.
- What happens when required fields are left empty during add/edit? The system prevents saving and highlights which fields are required.
- What happens when performance benchmark scores are not available for a computer? The fields display as empty/null and the computer can still be saved.
- What happens when a user deletes a computer record? The record is soft-deleted (hidden from normal views) and can be restored by an admin.
- What happens when importing a CSV with a Serial Number matching a soft-deleted record? The soft-deleted record is restored and updated with the imported data.
- What happens when importing a CSV with an Equipment ID matching an existing record? The existing record is updated with the imported data (Equipment ID takes precedence over Serial Number for matching).
- What happens when two users edit the same record simultaneously? Last write wins; no conflict detection or warning is provided.

## Requirements *(mandatory)*

### Functional Requirements

**Data Management**
- **FR-001**: System MUST store equipment records with all specified field groups (Specifications, Assignment, and type-specific fields).
- **FR-002**: System MUST persist all data in a durable database that survives application restarts.
- **FR-003**: System MUST use Equipment ID (auto-generated) as the unique identifier for each equipment record.
- **FR-003a**: System MUST auto-generate a unique Equipment ID with prefix based on Equipment Type: PC-NNNN (computers), MON-NNNN (monitors), SCN-NNNN (scanners), PRN-NNNN (printers).
- **FR-003b**: Equipment ID MUST be assigned automatically when equipment is created and MUST NOT be editable.
- **FR-003c**: Equipment ID MUST be displayed in list view and detail view alongside Serial Number.
- **FR-003d**: System MUST support the following Equipment Type values: PC, Monitor, Scanner, Printer.
- **FR-003e**: Equipment Type MUST be required when creating equipment and determines the ID prefix.
- **FR-003f**: Serial Number is optional; when provided, it MUST be unique across all records.
- **FR-004**: System MUST support the following Status values: Active, Inactive, Decommissioned, In Repair, In Storage.

**Performance Fields (Passmark Benchmarks) - PC Only**
- **FR-005**: System MUST store performance benchmark scores for PCs: CPU Score, 2D Score, 3D Score, Memory Score, Disk Score, and Overall Rating.
- **FR-006**: System MUST allow performance fields to be empty (benchmarks not yet run or not applicable to equipment type).

**Common Equipment Fields**
- **FR-007**: System MUST store for all equipment: Model, Serial Number (optional), Equipment Type (required), Manufacturer, Manufacturing Date, Acquisition Date, Location, Cost, and Notes.
- **FR-007a**: Location field MUST store the physical location of equipment (e.g., office name, building, room number). Location is optional.
- **FR-007b**: Acquisition Date field MUST store the date when the equipment was acquired by the organization. Acquisition Date is optional.
- **FR-008**: System MUST require Equipment Type when creating a new record. Serial Number is optional.

**PC-Specific Fields**
- **FR-009**: For PC equipment type, system MUST store: Computer Subtype (Desktop/Laptop), CPU Type, CPU Speed, CPU Generation, Operating System, RAM, Storage Capacity, Video Card, Display Resolution, and MAC Address.
- **FR-009a**: System MUST validate that Computer Subtype is one of: Desktop, Laptop (only for PC equipment type).

**User Assignment Fields**
- **FR-010**: System MUST store: Equipment Name, IP Address (where applicable), Assignment Date, Primary User, and Usage Type.
- **FR-011**: System MUST support updating Equipment Name, Primary User, and Assignment Date when equipment is reassigned.
- **FR-012**: System MUST support the following Usage Type values: Personal, Work.
- **FR-012a**: Usage Type indicates whether equipment is for personal use or work use.

**Viewing and Navigation**
- **FR-013**: System MUST display a list view showing all equipment with key fields (Equipment ID, Equipment Name, Model, Equipment Type, Primary User, Status).
- **FR-013a**: System MUST allow filtering by Equipment Type to show only specific types (PC, Monitor, Scanner, Printer).
- **FR-014**: System MUST provide a detail view showing all fields for a selected computer.

**Filtering and Sorting**
- **FR-015**: System MUST allow filtering by: Model, Primary User, Status, Type, Usage Type, Location, and Performance Rating range.
- **FR-016**: System MUST allow sorting by any displayed column in ascending or descending order.
- **FR-017**: System MUST allow combining multiple filters simultaneously.
- **FR-018**: System MUST provide a "Clear Filters" action to reset all filters.

**Import/Export**
- **FR-019**: System MUST export all inventory records to a CSV file with all fields as columns.
- **FR-020**: System MUST import equipment records from a CSV file.
- **FR-021**: System MUST match existing records by Equipment ID first, then Serial Number if Equipment ID not provided, during import and update them.
- **FR-022**: System MUST create new records with auto-generated Equipment ID when neither Equipment ID nor Serial Number matches existing records.
- **FR-022a**: Equipment ID column is NOT required in CSV import files; system MUST auto-generate Equipment IDs for new records.
- **FR-023**: System MUST report import errors without stopping the entire import (partial success allowed).

**Notes**
- **FR-024**: System MUST support a free-text Notes field for each computer record.

**Record Deletion**
- **FR-025**: System MUST support soft delete - deleted records are hidden from normal views but retained in the database.
- **FR-026**: System MUST provide an admin section where users can view and restore soft-deleted records.
- **FR-027**: System MUST exclude soft-deleted records from CSV exports by default.

**Access Control**
- **FR-028**: System MUST NOT require authentication; all features accessible on internal network.
- **FR-029**: System MUST provide an admin section accessible via navigation for soft-delete recovery.

**Assignment History**
- **FR-030**: System MUST automatically create a history record when a computer's assignment fields change (Primary User, Usage Type, or Computer Name).
- **FR-031**: System MUST store assignment history including: previous user, previous usage type, previous computer name, start date, and end date.
- **FR-032**: System MUST display assignment history in chronological order (newest first) on the computer detail view.
- **FR-033**: System MUST retain assignment history even when a computer is soft-deleted.

### Key Entities

- **Equipment**: The primary entity representing a physical piece of equipment (PC, Monitor, Scanner, Printer) in the organization. Contains all specification, performance, and assignment data. Uniquely identified by auto-generated Equipment ID (e.g., PC-0001). Serial Number is optional but unique when provided.

- **Performance Metrics**: A logical grouping of Passmark benchmark scores (CPU, 2D, 3D, Memory, Disk, Overall) associated with PC equipment. All fields are optional and only applicable to PC type.

- **Assignment**: A logical grouping of user assignment data (Equipment Name, IP Address, Assignment Date, Primary User, Usage Type) associated with each Equipment record. Tracks who currently uses the equipment and whether it's for personal or work use.

- **AssignmentHistory**: A record of past assignments for equipment. Created automatically when assignment fields change. Contains previous user, usage type, equipment name, start date, and end date. Linked to Equipment by internal ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Staff can view the complete inventory list within 3 seconds of accessing the application.
- **SC-002**: Staff can add a new computer record with all fields in under 5 minutes.
- **SC-003**: Staff can find a specific computer using filters within 30 seconds.
- **SC-004**: Staff can export the entire inventory and re-import it without data loss.
- **SC-005**: 90% of staff can successfully add, edit, and find computer records on their first attempt without training.
- **SC-006**: The system accurately reflects all computers owned by the organization (100% data accuracy when properly maintained).
- **SC-007**: Bulk updates via CSV import process at least 100 records within 1 minute.

## Clarifications

### Session 2025-12-15

- Q: Can computer records be deleted? → A: Soft delete - records hidden but recoverable by admin
- Q: Is authentication required? → A: No authentication - open access on internal network
- Q: How are concurrent edits handled? → A: Last write wins - no conflict detection
- Q: Should the app track assignment history? → A: Yes - automatically track when assignment fields change
- Q: Should the app assign a unique Equipment ID? → A: Yes - auto-generate with type-based prefix: PC-NNNN, MON-NNNN, SCN-NNNN, PRN-NNNN
- Q: Should Equipment ID prefix reflect equipment type? → A: Yes - PC (computers), MON (monitors), SCN (scanners), PRN (printers)
- Q: Should different equipment types have different fields? → A: Shared fields for all types; PC-specific fields optional for other types
- Q: What is the "Function" field for? → A: Renamed to "Usage Type" - records whether equipment is for Personal or Work use
- Q: Should Location and Acquisition Date be tracked? → A: Yes - Location (physical location) and Acquisition Date (when acquired) are optional fields
- Q: Is Equipment ID required in CSV imports? → A: No - Equipment ID is auto-generated; not required in import files

## Assumptions

The following assumptions were made based on the feature description:

1. **Single organization scope**: The system tracks equipment for one organization; multi-tenant support is not required.
2. **Multi-equipment types**: The system supports PCs, monitors, scanners, and printers with shared and type-specific fields.
3. **Assignment history tracked**: The system tracks assignment history (who used the equipment and when) automatically when assignment fields change.
4. **Standard status values**: Five status values (Active, Inactive, Decommissioned, In Repair, In Storage) cover typical equipment lifecycle states.
5. **Standard usage type values**: Two usage type values (Personal, Work) distinguish between equipment for personal use vs. work use.
6. **Serial Number optional**: Serial number is optional; some equipment may only have model or configuration recorded. When provided, serial numbers must be unique. Equipment ID (auto-generated) serves as the primary identifier.
7. **No authentication**: Open access on internal network; admin functions (soft-delete recovery) available via separate admin section, not role-based.
8. **Web-based interface**: The application is accessed via web browser (aligned with constitution's FastAPI + React stack).
