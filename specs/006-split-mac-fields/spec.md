# Feature Specification: Split MAC Address Fields

**Feature Branch**: `006-split-mac-fields`
**Created**: 2025-12-21
**Status**: Draft
**Input**: User description: "Split MAC Address to two fields: MAC (LAN), MAC (WLAN)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Separate Network Addresses (Priority: P1)

As an IT administrator, I want to record both the wired (LAN) and wireless (WLAN) MAC addresses separately for each piece of equipment, so that I can accurately track network connectivity options and troubleshoot network issues.

**Why this priority**: This is the core functionality requested. Equipment often has both wired and wireless network interfaces, and tracking them separately is essential for network management, security auditing, and troubleshooting.

**Independent Test**: Can be fully tested by creating or editing a PC record with both MAC addresses populated, then verifying both values are stored and displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am creating a new PC record, **When** I view the equipment form, **Then** I see two separate MAC address fields labeled "MAC (LAN)" and "MAC (WLAN)"
2. **Given** I am editing an existing PC record, **When** I enter values in both MAC fields, **Then** both values are saved independently and displayed on the equipment detail page
3. **Given** equipment has only a wired connection, **When** I leave the WLAN field empty, **Then** the system accepts the record with only the LAN MAC address populated

---

### User Story 2 - Migrate Existing MAC Addresses (Priority: P2)

As an IT administrator, I want existing MAC address data to be preserved when this feature is implemented, so that I don't lose previously recorded network information.

**Why this priority**: Data preservation is critical for existing users. The migration must ensure no data loss while transitioning to the new two-field structure.

**Independent Test**: Can be tested by verifying that after the database migration, all existing MAC addresses appear in the MAC (LAN) field, with MAC (WLAN) empty but available for future entry.

**Acceptance Scenarios**:

1. **Given** existing equipment records have MAC addresses, **When** the database migration runs, **Then** the existing MAC address value is migrated to the MAC (LAN) field
2. **Given** existing equipment records have MAC addresses, **When** I view a previously saved record after migration, **Then** the old MAC address appears in the MAC (LAN) field
3. **Given** the migration has completed, **When** I edit a migrated record, **Then** I can add a MAC (WLAN) value without affecting the migrated MAC (LAN) value

---

### User Story 3 - Import/Export with Dual MAC Fields (Priority: P3)

As an IT administrator, I want to import and export equipment data with both MAC address fields, so that I can bulk update network information and maintain accurate records.

**Why this priority**: CSV import/export is a key feature for bulk operations. Supporting both MAC fields in import/export ensures data integrity across bulk operations.

**Independent Test**: Can be tested by exporting equipment records to CSV, verifying both MAC columns exist, modifying the CSV, and re-importing to confirm both fields are updated correctly.

**Acceptance Scenarios**:

1. **Given** I export equipment data to CSV, **When** I open the CSV file, **Then** I see separate columns for "MAC (LAN)" and "MAC (WLAN)"
2. **Given** I have a CSV with both MAC columns populated, **When** I import the CSV, **Then** both MAC values are correctly stored for each record
3. **Given** I import a CSV with the legacy single "MAC Address" column, **When** the import completes, **Then** the legacy value is mapped to the MAC (LAN) field (backward compatibility)

---

### Edge Cases

- What happens when both MAC fields are left empty? System accepts the record (both fields are optional).
- How does the system handle invalid MAC address formats? Validation warns the user but allows saving (consistent with current behavior for other optional fields).
- What happens if a user tries to import a CSV with the old single "MAC Address" column? System maps it to MAC (LAN) for backward compatibility.
- What if both the old "MAC Address" column AND new columns exist in an import? New columns take precedence; old column is ignored if new columns have values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display two separate MAC address fields labeled "MAC (LAN)" and "MAC (WLAN)" on the equipment form for PC-type equipment
- **FR-002**: System MUST store MAC (LAN) and MAC (WLAN) as independent values in the equipment record
- **FR-003**: System MUST display both MAC addresses on the equipment detail view for PC-type equipment
- **FR-004**: System MUST allow either or both MAC fields to be empty (optional fields)
- **FR-005**: System MUST migrate existing MAC address data to the MAC (LAN) field during database migration
- **FR-006**: System MUST include both MAC columns in CSV export with headers "MAC (LAN)" and "MAC (WLAN)"
- **FR-007**: System MUST support importing both MAC columns from CSV files
- **FR-008**: System MUST support backward-compatible import of legacy "MAC Address" column, mapping it to MAC (LAN)
- **FR-009**: System MUST validate MAC address format (if provided) using standard XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX notation

### Key Entities

- **Equipment**: Extended to include two MAC address attributes:
  - **mac_lan**: MAC address for wired LAN connection (replaces existing mac_address)
  - **mac_wlan**: MAC address for wireless LAN connection (new field)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can enter and save both MAC addresses in under 30 seconds per record
- **SC-002**: 100% of existing MAC address data is preserved after migration (no data loss)
- **SC-003**: CSV export includes both MAC columns for all PC-type equipment records
- **SC-004**: CSV import correctly processes files with single (legacy) or dual MAC columns
- **SC-005**: Both MAC fields display correctly on equipment list and detail views

## Assumptions

- The MAC address format validation uses the same rules as the current implementation (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX, case-insensitive)
- Existing MAC addresses in the database represent LAN (wired) connections, which is the most common scenario for desktop equipment
- The MAC fields remain specific to PC-type equipment (not applicable to Monitors, Scanners, or Printers)
- Users may have equipment with only wired, only wireless, or both connection types
