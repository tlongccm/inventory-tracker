# Feature Specification: Equipment Fields Update

**Feature Branch**: `005-equipment-fields-update`
**Created**: 2025-12-21
**Status**: Draft
**Input**: User description: "Update equipment tracking fields according to the CSV. For IP Address, enforce IPv4 format. For MAC address, use colon separator. For category, subcategory, status, ownership, allow user to add new enumeration options. However, new enumeration string must use title case. CPU base speed must have a space between number and unit."

## Clarifications

### Session 2025-12-21

- Q: Enumeration Storage Approach → A: Store as validated strings (no separate lookup table for custom values)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Equipment from CSV with Preview and Confirmation (Priority: P1)

An administrator imports equipment data from a CSV file containing computers inventory. The system parses and validates all field formats, then presents a preview showing validated entries and problematic entries separately. The administrator reviews the preview, can fix problematic entries, adjust entries to import, and confirm before the actual import occurs.

**Why this priority**: This is the primary use case driving this feature - the organization needs to bulk import their existing inventory from a spreadsheet with specific field formats, validation rules, and user confirmation before committing changes.

**Independent Test**: Can be fully tested by uploading a CSV file with equipment data and verifying the preview/confirmation workflow works correctly.

**Acceptance Scenarios**:

1. **Given** a CSV file with equipment data, **When** the administrator uploads the file, **Then** the system displays a preview with two sections: validated entries and problematic entries.
2. **Given** a preview showing validated and problematic entries, **When** displayed, **Then** validated entries are pre-selected for import and problematic entries are shown with error details.
3. **Given** a CSV file with an invalid IP address (e.g., "192.168.1.999"), **When** the administrator uploads the file, **Then** that row appears in the problematic entries section with a clear error message.
4. **Given** problematic entries in the preview, **When** the administrator clicks on an entry, **Then** they can manually fix the values before import.
5. **Given** a CSV row with Equipment ID that already exists in the system, **When** previewing, **Then** the system shows those entries separately and prompts that they will be skipped unless the identifier is changed.
6. **Given** a CSV file with a MAC address using dashes, **When** the administrator uploads the file, **Then** the system normalizes the MAC address to use colons in the preview.
7. **Given** the preview screen with selected entries, **When** the administrator clicks "Confirm Import", **Then** only the selected entries are imported.
8. **Given** a CSV file with Equipment ID missing, **When** previewing, **Then** the system auto-generates a unique Equipment ID for that row.
9. **Given** a CSV file with Equipment ID in lowercase (e.g., "pc-0001"), **When** previewing, **Then** the system auto-converts to uppercase (e.g., "PC-0001").

---

### User Story 2 - Add New Enumeration Values (Priority: P2)

An administrator encounters a new equipment category, subcategory, status, or ownership type not currently in the system. They can add the new value directly through the UI or during import, and the system ensures it follows title case formatting.

**Why this priority**: Flexibility to extend enumeration options is essential for accommodating evolving organizational needs without requiring code changes.

**Independent Test**: Can be fully tested by adding a new enumeration value through the equipment form and verifying it appears in dropdown lists for future use.

**Acceptance Scenarios**:

1. **Given** an administrator creating equipment with a new Subcategory "Mini Pc", **When** they submit the form, **Then** the system converts it to title case "Mini PC" and adds it as a valid option.
2. **Given** an existing list of Status values, **When** an administrator adds a new status "under review", **Then** the system stores it as "Under Review" in title case.
3. **Given** an administrator entering a new Ownership value, **When** the value is already in title case, **Then** the system stores it as-is without modification.

---

### User Story 3 - Validate Field Formats on Entry (Priority: P2)

When an administrator manually enters or edits equipment data, the system validates IP address format, MAC address format, and CPU speed format in real-time, providing immediate feedback on any formatting issues.

**Why this priority**: Real-time validation prevents data quality issues and reduces the need for post-entry corrections.

**Independent Test**: Can be fully tested by entering various valid and invalid field values in the equipment form and verifying appropriate validation messages appear.

**Acceptance Scenarios**:

1. **Given** an equipment form, **When** the administrator enters "10.0.1.50" as IP Address, **Then** the system accepts it as valid IPv4 format.
2. **Given** an equipment form, **When** the administrator enters "2001:db8::1" as IP Address, **Then** the system rejects it with a message indicating only IPv4 format is accepted.
3. **Given** an equipment form, **When** the administrator enters "1C:87:2C:59:E3:C9" as MAC Address, **Then** the system accepts it as valid.
4. **Given** an equipment form, **When** the administrator enters "1C-87-2C-59-E3-C9" as MAC Address, **Then** the system normalizes it to use colons before saving.
5. **Given** an equipment form, **When** the administrator enters "2.5GHz" as CPU Base Speed, **Then** the system normalizes it to "2.5 GHz" with a space between number and unit.
6. **Given** an equipment form, **When** the administrator enters "2.5 GHz" as CPU Base Speed, **Then** the system accepts it as-is.

---

### User Story 4 - Add New Equipment Fields (Priority: P1)

The system supports additional equipment fields from the CSV import to capture complete equipment information including Purpose, Category (as Equipment Type), Subcategory (as Computer Subtype), and Ownership (as Usage Type).

**Why this priority**: The CSV contains fields not currently in the system that are needed to capture complete equipment information.

**Independent Test**: Can be fully tested by creating equipment with all new fields populated and verifying they are saved and displayed correctly.

**Acceptance Scenarios**:

1. **Given** the equipment form, **When** the administrator enters a Purpose value (e.g., "CEO", "Trading", "Research"), **Then** the system stores and displays this field.
2. **Given** equipment data with Category "Computer", **When** viewing the equipment, **Then** it displays as Equipment Type "PC".
3. **Given** equipment data with Subcategory "Tower" or "SFF", **When** viewing the equipment, **Then** it displays as Computer Subtype "Desktop".
4. **Given** equipment data with Ownership "CCM", **When** viewing the equipment, **Then** it displays as Usage Type "Work".

---

### User Story 5 - View Notes with Markdown Rendering (Priority: P2)

When viewing equipment, software, or subscription details, the Notes field displays formatted text using markdown rendering. This enables administrators to include structured notes with headers, lists, links, and emphasis.

**Why this priority**: Improves readability of notes which often contain structured information like purchase history, configuration details, or troubleshooting steps.

**Independent Test**: Can be fully tested by entering markdown-formatted text in the Notes field and verifying it renders correctly in the detail view.

**Acceptance Scenarios**:

1. **Given** an equipment record with markdown in Notes (e.g., "**Important**: Check annually"), **When** viewing the equipment detail, **Then** the text "Important" displays in bold.
2. **Given** a software record with a markdown link in Notes (e.g., "[Docs](https://example.com)"), **When** viewing the software detail, **Then** the text "Docs" displays as a clickable link.
3. **Given** a subscription record with a markdown list in Notes, **When** viewing the subscription detail, **Then** the list items display as a formatted bullet list.
4. **Given** Notes containing potentially malicious script tags, **When** viewing any detail page, **Then** the script is not executed (sanitized).

---

### Edge Cases

- What happens when a MAC address has mixed case letters? System normalizes to uppercase (e.g., "1c:87:2C:59:e3:C9" becomes "1C:87:2C:59:E3:C9").
- What happens when CPU speed has no unit? System appends "GHz" as default unit if only a number is provided.
- What happens when IP address field is empty? System allows empty/null IP addresses (field is optional).
- What happens when an enumeration value contains special characters? System rejects values with special characters other than spaces and hyphens.
- What happens when Status value in CSV is "Inactive - In Storage"? System maps it to "In Storage" status.
- What happens when Equipment ID is missing in CSV? System auto-generates a unique ID in format {TYPE}-NNNN.
- What happens when Equipment ID contains lowercase letters? System auto-converts to uppercase (e.g., "pc-0001" becomes "PC-0001").
- What happens when Equipment ID already exists in database? System shows entry in "duplicate" section, prompts user to fix or skip.
- What happens when user fixes a problematic entry in preview? Entry moves from problematic to validated section.
- What happens when user deselects a validated entry? Entry is excluded from import.

## Requirements *(mandatory)*

### Functional Requirements

#### Field Validation

- **FR-001**: System MUST validate IP Address fields to only accept valid IPv4 format (four octets 0-255 separated by dots, e.g., "192.168.1.100").
- **FR-002**: System MUST normalize MAC Address fields to use colon separators and uppercase letters (e.g., "1C:87:2C:59:E3:C9").
- **FR-003**: System MUST accept MAC addresses in various input formats (colons, dashes, or no separator) and normalize them.
- **FR-004**: System MUST validate CPU Base Speed format to include a space between the numeric value and the unit (e.g., "2.5 GHz", "3.20 GHz").
- **FR-005**: System MUST normalize CPU Base Speed values that lack a space (e.g., "2.5GHz" becomes "2.5 GHz").

#### Extensible Enumerations

- **FR-006**: System MUST allow administrators to add new values to Category enumeration.
- **FR-007**: System MUST allow administrators to add new values to Subcategory enumeration.
- **FR-008**: System MUST allow administrators to add new values to Status enumeration.
- **FR-009**: System MUST allow administrators to add new values to Ownership enumeration.
- **FR-010**: System MUST enforce title case formatting for all new enumeration values (first letter of each word capitalized).
- **FR-011**: System MUST automatically convert enumeration values to title case on save.

#### New Fields

- **FR-012**: System MUST support a Purpose field to describe the equipment's function (e.g., "CEO", "Trading", "Research", "Office Management").
- **FR-013**: System MUST support Category field that maps to Equipment Type (e.g., "Computer" maps to "PC").
- **FR-014**: System MUST support Subcategory field for computer form factors (e.g., "Tower", "SFF", "Laptop", "PC").

#### CSV Import Mappings

- **FR-015**: System MUST map CSV column "Category" to Equipment Type field.
- **FR-016**: System MUST map CSV column "Subcategory" to Computer Subtype field.
- **FR-017**: System MUST map CSV column "CPU Base Speed" to CPU Speed field.
- **FR-018**: System MUST map CSV column "Ownership" to Usage Type field.
- **FR-019**: System MUST map Subcategory values "Tower", "SFF", and "PC" to Computer Subtype "Desktop".
- **FR-020**: System MUST map Subcategory value "Laptop" to Computer Subtype "Laptop".
- **FR-021**: System MUST map Ownership value "CCM" to Usage Type "Work".
- **FR-022**: System MUST map Ownership value "Personal" to Usage Type "Personal".
- **FR-023**: System MUST map Status value "Inactive - In Storage" to Status "In Storage".

#### Bulk Upload Workflow

- **FR-024**: System MUST display a preview after CSV upload showing validated entries and problematic entries in separate sections.
- **FR-025**: System MUST pre-select all validated entries for import by default.
- **FR-026**: System MUST allow users to manually fix problematic entries in the preview.
- **FR-027**: System MUST allow users to manually adjust (select/deselect) entries to import.
- **FR-028**: System MUST require user confirmation before executing the import.
- **FR-029**: System MUST show entries with duplicate Equipment IDs separately with a prompt that they will be skipped unless fixed.

#### Equipment Identifier Handling

- **FR-030**: System MUST use the Equipment ID from CSV if present.
- **FR-031**: System MUST auto-generate a unique Equipment ID if missing in CSV (format: {TYPE}-NNNN).
- **FR-032**: System MUST ensure Equipment ID uniqueness before import.
- **FR-033**: System MUST convert Equipment ID to uppercase if lowercase letters are present.
- **FR-034**: System MUST validate Equipment ID format as {TYPE}-NNNN where TYPE is PC/MON/SCN/PRN and NNNN is 4 digits.

#### Notes Field Markdown Rendering

- **FR-035**: System MUST render Notes field content as markdown in Equipment detail view.
- **FR-036**: System MUST render Notes field content as markdown in Software detail view.
- **FR-037**: System MUST render Notes field content as markdown in Subscription detail view.
- **FR-038**: System MUST support common markdown syntax including headers, bold, italic, links, and lists.
- **FR-039**: System MUST sanitize markdown content to prevent XSS attacks.

### Key Entities

- **Equipment**: Extended with new Purpose field; existing fields updated with enhanced validation rules. Enumeration fields (Category, Subcategory, Status, Ownership) are stored as validated strings directly on the Equipment entity—no separate lookup tables required.
- **Field Mapping Configuration**: Mapping rules for CSV column names to database fields and value transformations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of imported IP addresses conform to valid IPv4 format or are rejected with clear error messages.
- **SC-002**: 100% of MAC addresses are stored in normalized format (uppercase with colon separators).
- **SC-003**: All CPU speed values display with consistent formatting (space between number and unit).
- **SC-004**: Administrators can add new enumeration values without requiring system changes or restarts.
- **SC-005**: All enumeration values display in consistent title case format.
- **SC-006**: CSV import successfully processes all 54 valid equipment records from the source spreadsheet.
- **SC-007**: Field validation errors are reported within 1 second of user input.
- **SC-008**: Existing equipment data remains accessible and unchanged after the update.

## Assumptions

- IPv4 format is sufficient for the organization's needs; IPv6 support is not required.
- The source CSV file has been cleaned to have proper date formats (ISO 8601) and numeric values (no currency symbols or thousand separators).
- MAC address field accepts both 48-bit (EUI-48) format commonly used for network interfaces.
- CPU speed unit is assumed to be GHz if not specified.
- Title case conversion handles common abbreviations appropriately (e.g., "CEO" remains "CEO", "SFF" remains "SFF").
- The Purpose field is a free-text field, not an enumeration.
