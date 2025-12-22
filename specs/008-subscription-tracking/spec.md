# Feature Specification: Subscription Tracking

**Feature Branch**: `008-subscription-tracking`
**Created**: 2025-12-18
**Status**: Planning
**Input**: User request: "Add a new tab to track subscriptions."

## Subscription Fields

The subscription tracker tracks the following fields:

| Display Header | Data Model Field | Type | Enum Values |
|----------------|------------------|------|-------------|
| Subscription ID | subscription_id | text | Auto-generated (SUB-0001, etc.) |
| Provider | provider | text | Required |
| Category | category_name | text | Predefined dropdown with "Other" option |
| Sector / Subject | subcategory_name | text | Category-dependent dropdown with "Other" option |
| URL | link | URL | |
| Username | username | text | |
| Password | password | text | Stored securely, displayed masked |
| In LastPass? | in_lastpass | text enum | Y/N |
| Google Auth | google_authentication | email | Google authentication email |
| Status | status | text enum | Active/Inactive |
| Description & Value to CCM | description_value | text | |
| Value | value_level | text enum | H/M/L |
| CCM Owner | ccm_owner | text | |
| Subscription Log | subscription_log | text | |
| Payment Method | payment_method | text | |
| Payment Amount | payment_amount | float | |
| Payment Frequency | payment_frequency | text enum | Monthly/Yearly/Ad Hoc |
| Annual Cost | annual_cost | float | |
| Renewal Frequency | renewal_frequency | text enum | Monthly/Yearly/Ad Hoc |
| Renewal Date | renewal_date | date | |
| Last confirmed alive | last_confirmed_alive | date | |
| Main contact | main_vendor_contact | text | |
| Destination email | subscriber_email | email | |
| Forward to | forward_to | email | |
| RR email routing | email_routing | text | |
| Email volume / week | email_volume_per_week | float | |
| Actions | actions_todos | text | |
| Access Level Required | access_level_required | text | |
| Notes | notes | text | |
| (hidden) | is_deleted | boolean | Soft delete flag |

## User Scenarios & Testing

### User Story 1 - View Subscriptions (Priority: P1)

As a staff member, I want to view a list of all subscriptions so that I can see what services we have.

**Acceptance Scenarios**:

1. **Given** I navigate to the Subscriptions tab, **When** the page loads, **Then** I see a list of all subscriptions with columns for Subscription ID, Provider, Category, Status, and CCM Owner.

2. **Given** the subscription list is displayed, **When** I click on a subscription entry, **Then** a detail panel/modal opens showing all fields while remaining on the list page.

3. **Given** the subscription list is displayed, **When** I search for a provider name, **Then** all subscriptions containing that text in any field are displayed.

---

### User Story 2 - Add New Subscription (Priority: P1)

As a staff member, I want to add new subscription entries so that I can track our services.

**Acceptance Scenarios**:

1. **Given** I am on the Subscriptions page, **When** I click "Add Subscription", **Then** a form appears with all subscription fields.

2. **Given** I fill in the required Provider name and click Save, **Then** a new subscription entry is created with an auto-generated ID (SUB-0001).

3. **Given** I enter a password, **When** viewing the subscription, **Then** the password is displayed as masked (asterisks).

---

### User Story 3 - Edit Subscription (Priority: P1)

As a staff member, I want to edit subscription entries so that I can keep information up to date.

**Acceptance Scenarios**:

1. **Given** I am viewing a subscription entry, **When** I click Edit, **Then** I can modify all subscription fields.

2. **Given** I update the renewal date, **When** I save, **Then** the subscription entry reflects the new date.

---

### User Story 4 - Delete and Recover Subscription (Priority: P2)

As a staff member, I want to delete subscription entries that are no longer relevant, and as an admin I want to recover accidentally deleted entries.

**Acceptance Scenarios**:

1. **Given** I am viewing a subscription entry, **When** I click Delete and confirm, **Then** the subscription is removed from the main list.

2. **Given** I am on the Admin page, **When** I view deleted subscriptions, **Then** I can see previously deleted subscription entries.

3. **Given** I see a deleted subscription entry, **When** I click Restore, **Then** the subscription reappears in the main subscription list.

---

### User Story 5 - Filter Subscriptions (Priority: P2)

As a staff member, I want to filter subscriptions by various fields so that I can find specific subscriptions quickly.

**Acceptance Scenarios**:

1. **Given** the subscription list is displayed, **When** I filter by Category, **Then** only subscriptions in that category are shown.

2. **Given** the subscription list is displayed, **When** I filter by Status (Active/Inactive), **Then** only subscriptions with that status are shown.

3. **Given** the subscription list is displayed, **When** I filter by Value Level, **Then** only subscriptions with that value level are shown.

4. **Given** the subscription list is displayed, **When** I filter by CCM Owner, **Then** only subscriptions with that owner are shown.

---

### User Story 6 - Import/Export Subscriptions CSV (Priority: P3)

As a staff member, I want to import subscriptions from CSV and export to CSV for bulk operations.

**Acceptance Scenarios**:

1. **Given** I have a CSV file with subscription data, **When** I import it, **Then** new subscription entries are created.

2. **Given** I want to backup or share subscription data, **When** I export to CSV, **Then** I receive a downloadable CSV file with all fields (password field included but should be handled carefully).

---

### User Story 7 - Manage Categories and Subcategories (Priority: P2)

As an admin, I want to manage the list of Categories and Subcategories so that the classification options stay relevant to our business needs.

**Acceptance Scenarios**:

1. **Given** I am on the Admin page, **When** I navigate to Category Management, **Then** I see a list of all Categories with options to add, edit, or delete.

2. **Given** I am viewing Categories, **When** I click "Add Category", **Then** I can enter a new category name and it appears in all Category dropdowns.

3. **Given** I am viewing a Category, **When** I click to manage its Subcategories, **Then** I see the list of Subcategories for that Category with options to add, edit, or delete.

4. **Given** a Category is in use by existing subscriptions, **When** I try to delete it, **Then** I see a warning showing how many subscriptions use it and deletion is prevented.

5. **Given** I add a new Subcategory to a Category, **When** I create/edit a subscription with that Category selected, **Then** the new Subcategory appears in the dropdown.

---

### Edge Cases

- What happens when importing duplicate provider names? → Create new entries (same provider may have multiple subscriptions)
- How to handle invalid data in CSV import? → Report error, skip row
- What happens with empty optional fields? → Store as null, display as blank
- How to handle password in CSV export? → Include but warn user about sensitivity
- What happens when a Category with Subcategories is deleted? → Prevent deletion; user must delete or reassign Subcategories first
- What happens when importing a subscription with a Category/Subcategory not in the list? → Create the subscription with the value as-is (treat as "Other"); do not auto-create categories
- What happens when editing a Category name? → All existing subscriptions retain their association (update by reference, not by name)

## Requirements

### Functional Requirements

#### Subscription Management
- **FR-001**: System MUST provide a "Subscriptions" tab in the navigation.
- **FR-002**: System MUST display a list of subscriptions with sortable columns.
- **FR-003**: System MUST auto-generate subscription IDs in format SUB-NNNN.
- **FR-004**: System MUST allow creating, editing, and soft-deleting subscription entries.

#### Column View Groups
- **FR-004a**: System MUST display always-visible fields: Subscription ID, Provider, Category, Status, CCM Owner.
- **FR-004b**: System MUST provide "Access View" group containing: URL (`link`), Username, Password (masked), In LastPass? (`in_lastpass`), Google Auth (`google_authentication`), Access Level Required.
- **FR-004c**: System MUST provide "Financial View" group containing: Payment Method, Payment Amount (`payment_amount`), Annual Cost, Payment Frequency, Renewal Frequency, Renewal Date.
- **FR-004d**: System MUST provide "Communication View" group containing: Destination email (`subscriber_email`), Forward to, RR email routing (`email_routing`), Email volume / week (`email_volume_per_week`), Main contact (`main_vendor_contact`).
- **FR-004e**: System MUST provide "Details View" group containing: Sector / Subject (`subcategory_name`), Description & Value to CCM (`description_value`), Value (`value_level`), Subscription Log, Actions (`actions_todos`), Last confirmed alive, Notes.
- **FR-004f**: System MUST allow toggling view groups via buttons/chips above the table.
- **FR-004g**: System MUST persist view group preferences in browser local storage.

#### Subscription Fields
- **FR-005**: System MUST track `provider` field (text, required).
- **FR-006**: System MUST track `category_name` field as dropdown with predefined values (Market Data & Investment Research, Sell-Side / Buy-Side Research & Deal Flow, News Media & Publications, Alternative Data & Analytics, AI Automation & Productivity Tools, Trading Execution & Portfolio Infrastructure, Corporate Compliance & Filings, Recruiting Networking & Services, Connectivity IT & Utilities) plus "Other" option for custom entry. Display header: "Category".
- **FR-007**: System MUST track `subcategory_name` field as a category-dependent dropdown with predefined values plus "Other" option. Display header: "Sector / Subject". Subcategories by Category:
  - **Market Data & Investment Research**: Terminal Platforms, Fundamental Data & Valuation, Screening & Portfolio Analytics, Factor / Quant Data
  - **Sell-Side / Buy-Side Research & Deal Flow**: Bulge Bracket Research, Middle-Market & Boutique Research, Independent Research, Activist / Short Research, Deal Marketing & Access
  - **News, Media & Publications**: Financial News, General News, Sector Trade Publications, News Aggregators & Commentary
  - **Alternative Data & Analytics**: Web Traffic & App Usage, Sentiment & Attention, Corporate Behavior & Filings Analytics, Commodity / Industry Data, Market Microstructure / Flow
  - **AI, Automation & Productivity Tools**: General-Purpose LLMs, Research Assistants, Coding & Technical Learning, Workflow Automation
  - **Trading, Execution & Portfolio Infrastructure**: Brokerage & Execution, OMS / EMS / Portfolio Systems, Investor Communications & Data Rooms
  - **Corporate, Compliance & Filings**: Regulatory Filings, Ownership & Control Analysis, Governance & Risk Monitoring
  - **Recruiting, Networking & Services**: Recruiting & Talent Intelligence, Expert Networks, Professional Services Platforms
  - **Connectivity, IT & Utilities**: Connectivity & Access, Security & Privacy, General IT Utilities
- **FR-008**: System MUST track `link` field (URL). Display header: "URL".
- **FR-009**: System MUST track `username` field (text). Display header: "Username".
- **FR-010**: System MUST track `password` field (text, stored securely, displayed masked). Display header: "Password".
- **FR-011**: System MUST track `in_lastpass` field as text enum (Y/N). Display header: "In LastPass?".
- **FR-012**: System MUST track `google_authentication` field (email). Display header: "Google Auth".
- **FR-013**: System MUST track `status` field as text enum (Active/Inactive). Display header: "Status".
- **FR-014**: System MUST track `description_value` field (text area). Display header: "Description & Value to CCM".
- **FR-015**: System MUST track `value_level` field as text enum (H/M/L). Display header: "Value".
- **FR-016**: System MUST track `ccm_owner` field (text). Display header: "CCM Owner".
- **FR-017**: System MUST track `subscription_log` field (text area). Display header: "Subscription Log".
- **FR-018**: System MUST track `payment_method` field (text). Display header: "Payment Method".
- **FR-019**: System MUST track `payment_amount` field (float). Display header: "Payment Amount".
- **FR-020**: System MUST track `annual_cost` field (float). Display header: "Annual Cost".
- **FR-021**: System MUST track `payment_frequency` field as text enum (Monthly/Yearly/Ad Hoc). Display header: "Payment Frequency".
- **FR-022**: System MUST track `renewal_frequency` field as text enum (Monthly/Yearly/Ad Hoc). Display header: "Renewal Frequency".
- **FR-023**: System MUST track `renewal_date` field (date). Display header: "Renewal Date".
- **FR-024**: System MUST track `last_confirmed_alive` field (date). Display header: "Last confirmed alive".
- **FR-025**: System MUST track `main_vendor_contact` field (text). Display header: "Main contact".
- **FR-026**: System MUST track `subscriber_email` field (email). Display header: "Destination email".
- **FR-027**: System MUST track `forward_to` field (email). Display header: "Forward to".
- **FR-028**: System MUST track `email_routing` field (text). Display header: "RR email routing".
- **FR-029**: System MUST track `email_volume_per_week` field (float). Display header: "Email volume / week".
- **FR-030**: System MUST track `actions_todos` field (text area). Display header: "Actions".
- **FR-031**: System MUST track `access_level_required` field (text). Display header: "Access Level Required".
- **FR-032**: System MUST track `notes` field (text area). Display header: "Notes".

#### Data Operations
- **FR-033**: System MUST support CSV import for bulk subscription entry.
- **FR-034**: System MUST support CSV export for backup/reporting.
- **FR-035**: System MUST support universal search across all subscription fields.

#### Renewal Indicators
- **FR-036**: System MUST display visual indicator (color or icon) for subscriptions with renewal dates within 30 days.

#### Category/Subcategory Configuration
- **FR-037**: System MUST store Category and Subcategory lists in a single, centralized location that serves both frontend and backend.
- **FR-038**: System MUST provide a user interface in the Admin panel to manage (add, edit, delete) Categories.
- **FR-039**: System MUST provide a user interface in the Admin panel to manage (add, edit, delete) Subcategories, with each Subcategory linked to its parent Category.
- **FR-040**: System MUST automatically update Category and Subcategory dropdowns throughout the application when the configuration changes.
- **FR-041**: System MUST prevent deletion of Categories or Subcategories that are currently in use by existing subscriptions (show warning with count of affected subscriptions).
- **FR-042**: System MUST provide default initial values for Categories and Subcategories as specified in FR-006 and FR-007, which users can then modify.

#### Admin
- **FR-043**: System MUST show deleted subscriptions in Admin panel with restore capability.

### Key Entities

- **Category**: A subscription category for classification. Fields:
  - `id` (auto-generated)
  - `name` (required, unique)
  - `display_order` (for sorting in dropdowns)
  - `is_active` (soft delete flag)

- **Subcategory**: A subcategory linked to a parent Category. Fields:
  - `id` (auto-generated)
  - `category_id` (required, foreign key to Category)
  - `name` (required, unique within category)
  - `display_order` (for sorting in dropdowns)
  - `is_active` (soft delete flag)

- **Subscription**: A subscription service with tracking information. Fields:
  - `subscription_id` (text, auto-generated, e.g., SUB-0001)
  - `provider` (text, required)
  - `category_name` (text, dropdown)
  - `subcategory_name` (text, category-dependent dropdown)
  - `link` (URL)
  - `username` (text)
  - `password` (text, stored securely, displayed masked)
  - `in_lastpass` (text enum: Y/N)
  - `google_authentication` (email)
  - `status` (text enum: Active/Inactive)
  - `description_value` (text)
  - `value_level` (text enum: H/M/L)
  - `ccm_owner` (text)
  - `subscription_log` (text)
  - `payment_method` (text)
  - `payment_amount` (float)
  - `annual_cost` (float)
  - `payment_frequency` (text enum: Monthly/Yearly/Ad Hoc)
  - `renewal_frequency` (text enum: Monthly/Yearly/Ad Hoc)
  - `renewal_date` (date)
  - `last_confirmed_alive` (date)
  - `main_vendor_contact` (text)
  - `subscriber_email` (email)
  - `forward_to` (email)
  - `email_routing` (text)
  - `email_volume_per_week` (float)
  - `actions_todos` (text)
  - `access_level_required` (text)
  - `notes` (text)
  - `is_deleted` (boolean, soft delete flag)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add, view, edit, and delete subscriptions within the new Subscriptions tab.
- **SC-002**: Subscription ID auto-generation produces unique IDs in SUB-NNNN format.
- **SC-003**: All 30 specified fields are tracked and displayed correctly (including subscription_id, is_deleted, and new notes, renewal_frequency, google_authentication fields).
- **SC-004**: CSV import/export maintains data integrity for all subscription fields.
- **SC-005**: Soft-deleted subscriptions appear in Admin panel and can be restored.
- **SC-006**: Password field is masked when displayed (not shown in plaintext).
- **SC-007**: Categories and Subcategories can be added, edited, and deleted through Admin interface.
- **SC-008**: Category/Subcategory changes are immediately reflected in all subscription forms and filters without application restart.

## Security Considerations

### Password Storage
- Passwords MUST be stored with basic obfuscation using XOR+base64 encoding (not plaintext in database)
- Password display MUST be masked (asterisks or bullets)
- Consider using environment-based encryption key for password field
- CSV export with passwords should include warning

### Note on Security Model
This is an internal-network-only application with no authentication. Password storage is for convenience (tracking credentials), not high-security use. The obfuscation is a defense-in-depth measure, not a security guarantee.

## Clarifications

### Session 2025-12-18

- Q: Should the system provide notification or visual indication for upcoming renewals? → A: Visual indicator only (color/icon for renewals within 30 days)
- Q: Should Category be free-text or predefined dropdown? → A: Predefined dropdown with "Other" option. Categories: Market Data & Investment Research, Sell-Side / Buy-Side Research & Deal Flow, News Media & Publications, Alternative Data & Analytics, AI Automation & Productivity Tools, Trading Execution & Portfolio Infrastructure, Corporate Compliance & Filings, Recruiting Networking & Services, Connectivity IT & Utilities
- Q: Field rename and Subcategory structure? → A: Renamed "Sector/Scope" to "Subcategory". Subcategory is a category-dependent dropdown with predefined values per category plus "Other" option. See FR-007 for complete subcategory list by category.
- Q: Should Category/Subcategory lists be user-editable? → A: Yes. Categories and Subcategories MUST be stored in a single centralized location (database) that both frontend and backend source from. Admin UI provided to manage them. See FR-037 through FR-042.

### Session 2025-12-22

- Field definitions updated from `subscription_fields.csv` with explicit display headers and data model field names
- Key changes from previous spec:
  - `authentication` field removed, replaced with `google_authentication` (email type) for "Google Auth"
  - Added `renewal_frequency` field (text enum: Monthly/Yearly/Ad Hoc)
  - Added `notes` field (text)
  - `category` renamed to `category_name`
  - `subcategory` renamed to `subcategory_name`, display header is "Sector / Subject"
  - `cost` renamed to `payment_amount` (float type), display header is "Payment Amount"
  - `email_volume_per_week` is now float type (was text)
  - `subscriber_email` display header is "Destination email"
  - `forward_to` and `subscriber_email` are now email type
  - `value_level` display header is "Value" (was "Value Level")
  - `subscription_log` display header is "Subscription Log" (was "Subscription Log & Workflow")
  - `actions_todos` display header is "Actions" (was "Actions/To Do/Opinions/Renewal Plans")
  - `main_vendor_contact` display header is "Main contact"
  - `last_confirmed_alive` display header is "Last confirmed alive"

## Assumptions

1. Subscription tracking follows similar patterns to equipment tracking.
2. No authentication required (same as equipment).
3. Soft delete pattern applies (same as equipment).
4. Single-user environment (last-write-wins for concurrent edits).
5. Only Provider field is required; all other fields are optional.
6. Password obfuscation is sufficient for internal use (not encryption-grade security).
