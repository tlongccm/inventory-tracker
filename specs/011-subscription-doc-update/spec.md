# Feature Specification: Subscription Documentation Update

**Feature Branch**: `011-subscription-doc-update`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: "Update documents to reflect the current code behavior."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Documentation Accuracy (Priority: P1)

As a developer or maintainer, I want the specification documents to accurately reflect the current implementation so that I can understand how the system works without reading the code.

**Why this priority**: Accurate documentation prevents confusion and reduces onboarding time for new team members.

**Independent Test**: Compare each field in the spec with the actual code implementation and verify they match.

**Acceptance Scenarios**:

1. **Given** the spec document lists field names, **When** compared with the backend model and frontend display, **Then** all field names match exactly.

2. **Given** the spec document describes display behavior, **When** compared with the UI implementation, **Then** all display behaviors match (alignment, formatting, labels).

3. **Given** the spec document lists CSV column mappings, **When** compared with the import code, **Then** all mappings are documented correctly.

---

### Edge Cases

- What happens when code changes but spec isn't updated? → Spec becomes stale and misleading.
- How to ensure spec stays in sync with code? → Review spec after each significant code change.

## Requirements *(mandatory)*

### Functional Requirements

The following documents the **current implemented behavior** as of 2025-12-23:

#### Subscription Fields (Current Implementation)

| Display Header | Data Model Field | Type | Notes |
|----------------|------------------|------|-------|
| ID | subscription_id | text | Auto-generated (SUB-0001, etc.) |
| Provider | provider | text | Required |
| Category | category_name | text | Dropdown, auto-created on import |
| Sector / Subject | subcategory_name | text | Category-dependent, auto-created on import |
| URL | link | URL | Clickable in table |
| Username | username | text | |
| Password | password | text | Stored obfuscated, shown masked with Show/Hide toggle |
| In LastPass | in_lastpass | boolean | Displays 'Y' or blank |
| Auth Method | authentication | text | Maps from CSV "Authentication Method" |
| Status | status | enum | Active/Inactive |
| Description & Value to CCM | description_value | text | Supports markdown |
| Value | value_level | enum | H/M/L, center-aligned |
| CCM Owner | ccm_owner | text | |
| Subscription Log | subscription_log | text | Supports markdown |
| Payment Method | payment_method | text | |
| Payment Amount | cost | currency | Right-aligned, formatted as USD |
| Payment Frequency | payment_frequency | enum | Monthly/Annual/Other |
| Annual Cost | annual_cost | currency | Right-aligned, formatted as USD |
| Renewal Date | renewal_date | text | Center-aligned, displayed as-is (not formatted) |
| Last confirmed alive | last_confirmed_alive | text | Center-aligned, displayed as-is |
| Main contact | main_vendor_contact | text | |
| Destination email | subscriber_email | text | |
| Forward to | forward_to | text | |
| RR email routing | email_routing | text | |
| Email volume / week | email_volume_per_week | text | Right-aligned |
| Notes | notes | text | |
| Actions | actions_todos | text | |
| Access Level Required | access_level_required | text | |

#### Display Formatting (Current Implementation)

- **FR-001**: All columns MUST be sortable.
- **FR-002**: Numerical fields (Payment Amount, Annual Cost, Email volume / week) MUST be right-aligned.
- **FR-003**: Date fields (Renewal Date, Last confirmed alive) MUST be center-aligned.
- **FR-004**: Boolean field (In LastPass) MUST display 'Y' for true, blank for false/null.
- **FR-005**: Currency fields MUST be formatted as USD (e.g., $29.99).
- **FR-006**: Date fields MUST display as text (no date formatting applied).

#### CSV Import Mapping (Current Implementation)

The following CSV column headers are supported during import:

| CSV Header | Maps To |
|------------|---------|
| Provider | provider |
| Category | category_name |
| Sector / Subject | subcategory_name |
| Sector /Subject | subcategory_name (variant) |
| URL | link |
| Username | username |
| Password | password |
| In LastPass | in_lastpass |
| In Lastpass? | in_lastpass (variant) |
| Authentication Method | authentication |
| Status | status |
| Description & Value to CCM | description_value |
| Value | value_level |
| CCM Owner | ccm_owner |
| Subscription Log | subscription_log |
| Payment Method | payment_method |
| Payment Amount | cost |
| Payment Frequency | payment_frequency |
| Notes | notes |
| Annual Cost | annual_cost |
| Renewal Frequency | renewal_frequency |
| Renewal Date | renewal_date |
| Renew Date | renewal_date (variant) |
| Last confirmed alive | last_confirmed_alive |
| Main contact | main_vendor_contact |
| Destination email | subscriber_email |
| Forward to | forward_to |
| RR email routing | email_routing |
| Email volume / week | email_volume_per_week |
| Actions | actions_todos |
| Access Level Required | access_level_required |

#### Category/Subcategory Auto-Creation (Current Implementation)

- **FR-007**: System MUST auto-create Category entries during CSV import if they don't exist.
- **FR-008**: System MUST auto-create Subcategory entries during CSV import if they don't exist (linked to the parent category).
- **FR-009**: The edit form MUST label the subcategory field as "Sector / Subject" (not "Subcategory").

#### In LastPass Field Behavior

- **FR-010**: CSV import accepts: 'Y', 'y', 'yes', 'true', '1' → true
- **FR-011**: CSV import accepts: 'N', 'n', 'no', 'false', '0' → false
- **FR-012**: CSV import treats blank/empty → null
- **FR-013**: Table display shows 'Y' for true, blank otherwise.
- **FR-014**: Detail view shows 'Y' for true, blank otherwise.

### Key Entities

- **Category**: Subscription classification. Auto-created during import. Fields: id, name, display_order, is_active, created_at, updated_at.

- **Subcategory**: Sector/Subject linked to a Category. Auto-created during import. Fields: id, category_id, name, display_order, is_active, created_at, updated_at.

- **Subscription**: A subscription service entry. See field table above for all tracked fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All field names in spec match the actual code implementation.
- **SC-002**: All display behaviors (alignment, formatting) in spec match the UI implementation.
- **SC-003**: All CSV column mappings in spec match the import code.
- **SC-004**: The spec can be used as an accurate reference for understanding the system without reading code.

## Changes from Previous Spec (008-subscription-tracking)

The following changes document the delta between the original spec and current implementation:

### Field Name Changes
- `google_authentication` field removed → replaced with `authentication` (general "Auth Method")
- `payment_amount` → renamed to `cost` in data model (display still "Payment Amount")

### Display Behavior Changes
- All columns now sortable (previously some were not)
- In LastPass displays 'Y' or blank (not 'Yes'/'No')
- Renewal Date displayed as text (not formatted date)
- Payment Amount formatted as currency (not raw float)

### Import Behavior Changes
- Categories auto-created on import (previously required manual creation)
- Subcategories auto-created on import (previously required manual creation)
- Added variant column header support for CSV flexibility

### Form Label Changes
- Edit form subcategory field labeled "Sector / Subject" (not "Subcategory")
