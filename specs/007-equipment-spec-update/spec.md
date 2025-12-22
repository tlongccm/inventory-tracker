# Feature Specification: Equipment Specification Update

**Feature Branch**: `007-equipment-spec-update`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Update spec document to reflect current implementation. Specifically, I added fields to equipment data model. There are also other changes to frontend, such as element placement, organization of fields in detail view, etc."

## Overview

This specification documents the current implementation state of the Equipment Inventory Tracker, consolidating recent changes including:
- Addition of the Ownership field to the equipment data model
- Reorganization of the Equipment Detail view into logical sections
- Split of MAC Address into MAC (LAN) and MAC (WLAN) fields
- Column configuration for table views

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Equipment Details in Organized Sections (Priority: P1)

As an IT administrator, I want to view equipment details organized into logical sections, so that I can quickly find the information I need without scrolling through an unstructured list of fields.

**Why this priority**: The detail view is the primary interface for reviewing equipment information. Proper organization improves usability and reduces time spent searching for specific data.

**Independent Test**: Can be fully tested by opening any equipment record and verifying fields appear in the correct sections.

**Acceptance Scenarios**:

1. **Given** I am viewing an equipment record, **When** I open the detail view, **Then** I see fields organized into these sections: Core Information, Specifications, Performance (PC only), Assignment, History, and Metadata
2. **Given** I am viewing a PC record, **When** I look at the Core Information section, **Then** I see Equipment ID, Type, Status, Location, Purpose, and Ownership
3. **Given** I am viewing a PC record, **When** I look at the Specifications section, **Then** I see Serial Number, Model, Manufacturer, Manufacturing Date, and PC-specific fields (Subtype, CPU, RAM, Storage, etc.)
4. **Given** I am viewing any equipment record, **When** I look at the History section, **Then** I see Acquisition Date, Cost, and Notes (with markdown rendering)

---

### User Story 2 - Track Equipment Ownership (Priority: P1)

As an IT administrator, I want to record the ownership status of each piece of equipment, so that I can track whether equipment is company-owned, leased, or personal.

**Why this priority**: Ownership tracking is essential for asset management, financial reporting, and compliance purposes.

**Independent Test**: Can be fully tested by creating equipment with an ownership value and verifying it is saved and displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am creating or editing equipment, **When** I fill in the Ownership field, **Then** the value is saved and displayed in the Core Information section of the detail view
2. **Given** I am viewing the equipment table, **When** I select the Summary or Full view, **Then** I see the Ownership column displayed
3. **Given** I am importing equipment via CSV, **When** the CSV contains an Ownership column, **Then** the value is imported correctly

---

### User Story 3 - Record Separate Network MAC Addresses (Priority: P2)

As an IT administrator, I want to record both wired (LAN) and wireless (WLAN) MAC addresses separately for PC equipment, so that I can accurately track network connectivity options.

**Why this priority**: Modern PCs often have both wired and wireless network interfaces. Tracking them separately supports network management and troubleshooting.

**Independent Test**: Can be fully tested by creating a PC record with both MAC addresses and verifying both are saved and displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a PC record, **When** I view the form, **Then** I see two separate MAC address fields: MAC (LAN) and MAC (WLAN)
2. **Given** I am viewing a PC detail, **When** I look at the Specifications section, **Then** I see both MAC (LAN) and MAC (WLAN) fields
3. **Given** equipment has only a wired connection, **When** I leave MAC (WLAN) empty, **Then** the system accepts the record

---

### User Story 4 - View Equipment Table with Configurable Columns (Priority: P2)

As an IT administrator, I want to select different view modes for the equipment table, so that I can focus on relevant information for my current task.

**Why this priority**: Different tasks require different information. View modes reduce clutter and improve efficiency.

**Independent Test**: Can be fully tested by switching between view modes and verifying the appropriate columns appear.

**Acceptance Scenarios**:

1. **Given** I am viewing the equipment table, **When** I select "Summary" view, **Then** I see Category, Manufacturer, Model, Purpose, Ownership, IP Address, and Overall Rating columns
2. **Given** I am viewing the equipment table, **When** I select "Spec" view, **Then** I see CPU Model, CPU Base Speed, Operating System, RAM, Storage, Video Card, Display Resolution, MAC (LAN), and MAC (WLAN) columns
3. **Given** I am viewing the equipment table, **When** I select "Performance" view, **Then** I see CPU Score, 2D Score, 3D Score, Memory Score, Disk Score, and Overall Rating columns
4. **Given** I am viewing the equipment table, **When** I select "History" view, **Then** I see Manufacturing Date, Acquisition Date, Assignment Date, Cost, and Notes columns
5. **Given** I am viewing the equipment table, **When** I select "Full" view, **Then** I see all columns from all view modes

---

### Edge Cases

- What happens when Ownership field is empty? System displays a dash (-) in detail view and table.
- What happens when both MAC fields are empty? System accepts the record; both fields are optional.
- What happens when Notes field is empty? The Notes section is hidden in the detail view.
- What happens when viewing non-PC equipment? PC-specific fields (Subtype, CPU, MAC addresses, Performance section) are hidden.

## Requirements *(mandatory)*

### Functional Requirements

#### Equipment Data Model

- **FR-001**: System MUST support an Ownership field for all equipment types (free-text, max 100 characters)
- **FR-002**: System MUST store MAC addresses as two separate fields: mac_lan and mac_wlan
- **FR-003**: System MUST support the following equipment fields: Equipment ID, Equipment Type, Serial Number, Model, Manufacturer, Manufacturing Date, Acquisition Date, Location, Cost, Purpose, Ownership, Notes, Status
- **FR-004**: System MUST support PC-specific fields: Computer Subtype, CPU Model, CPU Speed, Operating System, RAM, Storage, Video Card, Display Resolution, MAC (LAN), MAC (WLAN)
- **FR-005**: System MUST support PC-specific performance fields: CPU Score, 2D Score, 3D Score, Memory Score, Disk Score, Overall Rating
- **FR-006**: System MUST support assignment fields: Equipment Name, IP Address, Assignment Date, Primary User, Usage Type

#### Equipment Detail View

- **FR-007**: System MUST organize equipment detail view into the following sections: Core Information, Specifications, Performance (PC only), Assignment, History, Metadata
- **FR-008**: Core Information section MUST display: Equipment ID, Type, Status, Location, Purpose, Ownership
- **FR-009**: Specifications section MUST display: Serial Number, Model, Manufacturer, Manufacturing Date, and PC-specific fields when applicable
- **FR-010**: History section MUST display: Acquisition Date, Cost, and Notes (with markdown rendering)
- **FR-011**: Assignment section MUST display: Equipment Name, IP Address, Primary User, Usage Type, Assignment Date
- **FR-012**: Metadata section MUST display: Created date, Last Updated date

#### Equipment Table Views

- **FR-013**: System MUST display these columns in all views: Equipment ID, Subcategory, User, Name, and Status
- **FR-014**: Summary view MUST display: Category, Manufacturer, Model, Purpose, Ownership, IP Address, Overall Rating
- **FR-015**: Spec view MUST display: CPU Model, CPU Base Speed, Operating System, RAM, Storage, Video Card, Display Resolution, MAC (LAN), MAC (WLAN)
- **FR-016**: Performance view MUST display: CPU Score, 2D Score, 3D Score, Memory Score, Disk Score, Overall Rating
- **FR-017**: History view MUST display: Manufacturing Date, Acquisition Date, Assignment Date, Cost, Notes
- **FR-018**: Full view MUST display all columns from all view modes

#### Equipment Form

- **FR-019**: System MUST include Ownership field in the equipment creation and edit form
- **FR-020**: System MUST include separate MAC (LAN) and MAC (WLAN) fields in the form for PC equipment
- **FR-021**: Ownership field MUST be placed in the Core Information section of the form

### Key Entities

- **Equipment**: Core entity with all equipment tracking fields including the new Ownership field and split MAC address fields (mac_lan, mac_wlan)
- **View Configuration**: Column definitions organized by view mode (Summary, Spec, Performance, History, Full)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All equipment records display the Ownership field in the Core Information section of the detail view
- **SC-002**: All PC equipment records display separate MAC (LAN) and MAC (WLAN) fields in the Specifications section
- **SC-003**: Equipment detail view displays fields in the specified section organization
- **SC-004**: Equipment table displays correct columns for each view mode selection
- **SC-005**: Users can create and edit equipment with the Ownership field in under 30 seconds
- **SC-006**: Ownership column appears in table when Summary or Full view is selected

## Assumptions

- The Ownership field is a free-text field allowing any value (e.g., "Company", "Leased", "Personal", or organization-specific values)
- MAC address fields remain specific to PC-type equipment
- The section organization in detail view follows the logical grouping: identification/status first, technical specs second, performance metrics third, assignment info fourth, historical/financial fifth, system metadata last
- The History section in detail view combines Acquisition Date, Cost, and Notes as these represent the equipment's acquisition history and related documentation
