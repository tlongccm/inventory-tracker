# Data Model: Subscription Tracking

**Feature**: 008-subscription-tracking
**Date**: 2025-12-18

## Entities

### Category

A subscription category for classification. Stored in database as single source of truth.

#### Fields

| Field | Column Name | Type | Nullable | Default | Notes |
|-------|-------------|------|----------|---------|-------|
| ID | `id` | Integer | No | Auto | Primary key |
| Name | `name` | String(100) | No | - | Unique, required |
| Display Order | `display_order` | Integer | No | 0 | For sorting in dropdowns |
| Is Active | `is_active` | Boolean | No | True | Soft delete flag |
| Created At | `created_at` | DateTime | No | now() | Server default |
| Updated At | `updated_at` | DateTime | No | now() | Auto-update |

#### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `ix_category_name` | `name` | Quick lookup, uniqueness |
| `ix_category_active` | `is_active` | Filter active categories |

#### Default Seed Data

```
1. Market Data & Investment Research
2. Sell-Side / Buy-Side Research & Deal Flow
3. News, Media & Publications
4. Alternative Data & Analytics
5. AI, Automation & Productivity Tools
6. Trading, Execution & Portfolio Infrastructure
7. Corporate, Compliance & Filings
8. Recruiting, Networking & Services
9. Connectivity, IT & Utilities
```

---

### Subcategory

A subcategory linked to a parent Category.

#### Fields

| Field | Column Name | Type | Nullable | Default | Notes |
|-------|-------------|------|----------|---------|-------|
| ID | `id` | Integer | No | Auto | Primary key |
| Category ID | `category_id` | Integer | No | - | FK to categories.id |
| Name | `name` | String(100) | No | - | Unique within category |
| Display Order | `display_order` | Integer | No | 0 | For sorting in dropdowns |
| Is Active | `is_active` | Boolean | No | True | Soft delete flag |
| Created At | `created_at` | DateTime | No | now() | Server default |
| Updated At | `updated_at` | DateTime | No | now() | Auto-update |

#### Relationships

| Relationship | Type | Target | On Delete |
|--------------|------|--------|-----------|
| category | Many-to-One | Category | RESTRICT |

#### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `ix_subcategory_category` | `category_id` | FK lookup |
| `ix_subcategory_active` | `is_active` | Filter active |
| `uq_subcategory_name_category` | `category_id`, `name` | Unique name per category |

#### Default Seed Data (by Category)

**Market Data & Investment Research:**
- Terminal Platforms
- Fundamental Data & Valuation
- Screening & Portfolio Analytics
- Factor / Quant Data

**Sell-Side / Buy-Side Research & Deal Flow:**
- Bulge Bracket Research
- Middle-Market & Boutique Research
- Independent Research
- Activist / Short Research
- Deal Marketing & Access

**News, Media & Publications:**
- Financial News
- General News
- Sector Trade Publications
- News Aggregators & Commentary

**Alternative Data & Analytics:**
- Web Traffic & App Usage
- Sentiment & Attention
- Corporate Behavior & Filings Analytics
- Commodity / Industry Data
- Market Microstructure / Flow

**AI, Automation & Productivity Tools:**
- General-Purpose LLMs
- Research Assistants
- Coding & Technical Learning
- Workflow Automation

**Trading, Execution & Portfolio Infrastructure:**
- Brokerage & Execution
- OMS / EMS / Portfolio Systems
- Investor Communications & Data Rooms

**Corporate, Compliance & Filings:**
- Regulatory Filings
- Ownership & Control Analysis
- Governance & Risk Monitoring

**Recruiting, Networking & Services:**
- Recruiting & Talent Intelligence
- Expert Networks
- Professional Services Platforms

**Connectivity, IT & Utilities:**
- Connectivity & Access
- Security & Privacy
- General IT Utilities

---

### Subscription

A subscription service entry with tracking information for credentials, payments, and communication.

#### Fields

| Field | Column Name | Type | Nullable | Default | Notes |
|-------|-------------|------|----------|---------|-------|
| ID | `id` | Integer | No | Auto | Primary key |
| Subscription ID | `subscription_id` | String(10) | No | Auto | Format: SUB-NNNN |
| Subscription ID Num | `subscription_id_num` | Integer | No | Auto | Sequence number |
| Provider | `provider` | String(200) | No | - | Required field |
| Category ID | `category_id` | Integer | Yes | NULL | FK to categories.id |
| Subcategory ID | `subcategory_id` | Integer | Yes | NULL | FK to subcategories.id |
| Link | `link` | String(500) | Yes | NULL | URL to service |
| Google Auth | `google_authentication` | String(200) | Yes | NULL | Google auth email *(was `authentication`)* |
| Username | `username` | String(200) | Yes | NULL | |
| Password | `password` | String(500) | Yes | NULL | Obfuscated storage |
| In Lastpass? | `in_lastpass` | Boolean | Yes | NULL | Y/N |
| Status | `status` | Enum | No | Active | Active/Inactive |
| Description & Value | `description_value` | Text | Yes | NULL | Long text |
| Value Level | `value_level` | Enum | Yes | NULL | H/M/L |
| CCM Owner | `ccm_owner` | String(200) | Yes | NULL | |
| Subscription Log | `subscription_log` | Text | Yes | NULL | Long text |
| Payment Method | `payment_method` | String(200) | Yes | NULL | |
| Payment Amount | `payment_amount` | Numeric(12,2) | Yes | NULL | Dollar amount *(was `cost` String)* |
| Annual Cost | `annual_cost` | Numeric(12,2) | Yes | NULL | Dollar amount |
| Payment Frequency | `payment_frequency` | Enum | Yes | NULL | Monthly/Yearly/Ad Hoc *(was Monthly/Annual/Other)* |
| Renewal Frequency | `renewal_frequency` | Enum | Yes | NULL | Monthly/Yearly/Ad Hoc *(new field)* |
| Renewal Date | `renewal_date` | Date | Yes | NULL | |
| Last Confirmed Alive | `last_confirmed_alive` | Date | Yes | NULL | |
| Main Contact | `main_vendor_contact` | String(500) | Yes | NULL | |
| Destination Email | `subscriber_email` | String(200) | Yes | NULL | |
| Forward To | `forward_to` | String(200) | Yes | NULL | |
| RR Email Routing | `email_routing` | String(100) | Yes | NULL | Inbox/News/Archive |
| Email Volume / Week | `email_volume_per_week` | Numeric(10,2) | Yes | NULL | *(was String)* |
| Actions | `actions_todos` | Text | Yes | NULL | Long text |
| Access Level Required | `access_level_required` | String(200) | Yes | NULL | |
| Notes | `notes` | Text | Yes | NULL | *(new field)* |
| Created At | `created_at` | DateTime | No | now() | Server default |
| Updated At | `updated_at` | DateTime | No | now() | Auto-update |
| Is Deleted | `is_deleted` | Boolean | No | False | Soft delete flag |
| Deleted At | `deleted_at` | DateTime | Yes | NULL | When deleted |

#### Enums

**SubscriptionStatus**
```python
class SubscriptionStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
```

**ValueLevel**
```python
class ValueLevel(str, Enum):
    HIGH = "H"
    MEDIUM = "M"
    LOW = "L"
```

**PaymentFrequency** *(updated 2025-12-22)*
```python
class PaymentFrequency(str, Enum):
    MONTHLY = "Monthly"
    YEARLY = "Yearly"      # was ANNUAL = "Annual"
    AD_HOC = "Ad Hoc"      # was OTHER = "Other"
```

**RenewalFrequency** *(new 2025-12-22)*
```python
class RenewalFrequency(str, Enum):
    MONTHLY = "Monthly"
    YEARLY = "Yearly"
    AD_HOC = "Ad Hoc"
```

#### Relationships

| Relationship | Type | Target | On Delete |
|--------------|------|--------|-----------|
| category | Many-to-One | Category | SET NULL |
| subcategory | Many-to-One | Subcategory | SET NULL |

#### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `ix_subscription_id` | `subscription_id` | Quick lookup by ID |
| `ix_subscription_status` | `status`, `is_deleted` | Filter by status |
| `ix_subscription_provider` | `provider`, `is_deleted` | Filter by provider |
| `ix_subscription_owner` | `ccm_owner`, `is_deleted` | Filter by owner |
| `ix_subscription_category` | `category_id`, `is_deleted` | Filter by category |
| `ix_subscription_value_level` | `value_level`, `is_deleted` | Filter by priority |
| `ix_subscription_renewal` | `renewal_date`, `is_deleted` | Upcoming renewals |

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  Category   │       │ Subcategory  │       │ Subscription │
├─────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)     │◄──────┤ category_id  │       │ id (PK)      │
│ name        │   1:N │ id (PK)      │◄──────┤ category_id  │
│ display_ord │       │ name         │   N:1 │ subcategory_ │
│ is_active   │       │ display_ord  │       │ provider     │
│ created_at  │       │ is_active    │       │ ... (27 fld) │
│ updated_at  │       │ created_at   │       │ is_deleted   │
└─────────────┘       │ updated_at   │       └──────────────┘
                      └──────────────┘
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Category | name | Required, max 100 chars, unique |
| Subcategory | name | Required, max 100 chars, unique within category |
| Subcategory | category_id | Required, must exist in categories |
| Subscription | provider | Required, max 200 chars |
| Subscription | link | Optional, valid URL format if provided |
| Subscription | subscriber_email | Optional, valid email format if provided |
| Subscription | forward_to | Optional, valid email format if provided |
| Subscription | annual_cost | Optional, must be >= 0 if provided |
| Subscription | renewal_date | Optional, valid date |
| Subscription | category_id | Optional, must exist in categories if provided |
| Subscription | subcategory_id | Optional, must match category_id's subcategories |

---

## Password Obfuscation

Passwords are stored using base64 + XOR obfuscation:

```python
import base64

XOR_KEY = 0x42

def obfuscate_password(password: str) -> str:
    if not password:
        return None
    obfuscated = bytes([ord(c) ^ XOR_KEY for c in password])
    return base64.b64encode(obfuscated).decode('utf-8')

def deobfuscate_password(obfuscated: str) -> str:
    if not obfuscated:
        return None
    data = base64.b64decode(obfuscated)
    return ''.join(chr(b ^ XOR_KEY) for b in data)
```

**Security Note**: This is NOT cryptographically secure. It prevents casual plaintext exposure but would not withstand determined attack. Appropriate for internal-network-only tool without authentication.

---

## Migration Strategy

Single Alembic migration creates all three tables:

```python
def upgrade():
    # 1. Create categories table
    op.create_table('categories', ...)

    # 2. Create subcategories table with FK
    op.create_table('subcategories', ...)

    # 3. Create subscriptions table with FKs
    op.create_table('subscriptions', ...)

    # 4. Seed default categories and subcategories
    # (Can be done in migration or via separate seed script)

def downgrade():
    op.drop_table('subscriptions')
    op.drop_table('subcategories')
    op.drop_table('categories')
```

---

## Seeding Strategy

Default categories and subcategories are seeded:
1. On first application startup if tables are empty
2. Via Alembic migration data operations
3. Admin can modify after seeding via Admin UI

Seeding is idempotent - checks for existing data before inserting.

---

## Migration: Field Update (2025-12-22)

### Changes Summary

| Change Type | Field | From | To |
|-------------|-------|------|-----|
| Rename | `authentication` | String(200) | `google_authentication` String(200) |
| Rename + Type | `cost` | String(100) | `payment_amount` Numeric(12,2) |
| Type Change | `email_volume_per_week` | String(100) | Numeric(10,2) |
| Add | `renewal_frequency` | - | Enum (Monthly/Yearly/Ad Hoc) |
| Add | `notes` | - | Text |
| Enum Update | `payment_frequency` | Monthly/Annual/Other | Monthly/Yearly/Ad Hoc |

### Migration Script (Alembic)

```python
def upgrade():
    # 1. Add new columns
    op.add_column('subscriptions', sa.Column('google_authentication', sa.String(200), nullable=True))
    op.add_column('subscriptions', sa.Column('renewal_frequency', sa.String(20), nullable=True))
    op.add_column('subscriptions', sa.Column('notes', sa.Text(), nullable=True))

    # 2. For SQLite: Add new column with renamed field
    op.add_column('subscriptions', sa.Column('payment_amount', sa.Numeric(12, 2), nullable=True))
    op.add_column('subscriptions', sa.Column('email_volume_new', sa.Numeric(10, 2), nullable=True))

    # 3. Data migration
    connection = op.get_bind()

    # Copy authentication to google_authentication
    connection.execute(sa.text(
        "UPDATE subscriptions SET google_authentication = authentication WHERE authentication IS NOT NULL"
    ))

    # Update payment_frequency enum values
    connection.execute(sa.text(
        "UPDATE subscriptions SET payment_frequency = 'Yearly' WHERE payment_frequency = 'Annual'"
    ))
    connection.execute(sa.text(
        "UPDATE subscriptions SET payment_frequency = 'Ad Hoc' WHERE payment_frequency = 'Other'"
    ))

    # Convert cost values to payment_amount (extract numeric, NULL if not parseable)
    # Note: Complex conversion handled in application code during migration

    # 4. Drop old columns (SQLite: requires table recreation)
    with op.batch_alter_table('subscriptions') as batch_op:
        batch_op.drop_column('authentication')
        batch_op.drop_column('cost')  # Replaced by payment_amount
        batch_op.drop_column('email_volume_per_week')
        batch_op.alter_column('email_volume_new', new_column_name='email_volume_per_week')


def downgrade():
    # Reverse the migration
    with op.batch_alter_table('subscriptions') as batch_op:
        batch_op.add_column(sa.Column('authentication', sa.String(200), nullable=True))
        # ... reverse type changes
        batch_op.drop_column('google_authentication')
        batch_op.drop_column('renewal_frequency')
        batch_op.drop_column('notes')
```

### Display Header Mapping

| Data Field | Display Header |
|------------|----------------|
| `subscription_id` | Subscription ID |
| `provider` | Provider |
| `category_name` | Category |
| `subcategory_name` | Sector / Subject |
| `link` | URL |
| `username` | Username |
| `password` | Password |
| `in_lastpass` | In LastPass? |
| `google_authentication` | Google Auth |
| `status` | Status |
| `description_value` | Description & Value to CCM |
| `value_level` | Value |
| `ccm_owner` | CCM Owner |
| `subscription_log` | Subscription Log |
| `payment_method` | Payment Method |
| `payment_amount` | Payment Amount |
| `payment_frequency` | Payment Frequency |
| `annual_cost` | Annual Cost |
| `renewal_frequency` | Renewal Frequency |
| `renewal_date` | Renewal Date |
| `last_confirmed_alive` | Last confirmed alive |
| `main_vendor_contact` | Main contact |
| `subscriber_email` | Destination email |
| `forward_to` | Forward to |
| `email_routing` | RR email routing |
| `email_volume_per_week` | Email volume / week |
| `actions_todos` | Actions |
| `access_level_required` | Access Level Required |
| `notes` | Notes |
