# Implementation Plan: Subscription Tracking Field Update

**Branch**: `008-subscription-tracking` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification updated from `subscription_fields.csv` with field definition changes

**Note**: This plan addresses the field definition updates from the 2025-12-22 spec revision.

## Summary

Update the Subscription tracking feature to align with the revised field definitions from `subscription_fields.csv`. The changes include renaming fields, adding new fields (`google_authentication`, `renewal_frequency`, `notes`), and adjusting data types (`cost` renamed to `payment_amount` as float, `email_volume_per_week` to float). The subscription feature already has a working implementation; this plan addresses the delta between the current implementation and the updated specification.

## Technical Context

**Language/Version**: Python 3.11
**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, React, TypeScript
**Storage**: SQLite (development), MySQL 8.0+ (production)
**Testing**: pytest (backend), manual testing (frontend per constitution)
**Target Platform**: Web application (internal network)
**Project Type**: web (frontend + backend separation)
**Performance Goals**: Standard web app responsiveness (follows equipment tracker patterns)
**Constraints**: Internal network only, no authentication
**Scale/Scope**: Single-user environment, ~100s of subscriptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Adding fields to existing model, no new abstractions |
| II. Web Application Structure | ✅ PASS | Following existing backend/frontend separation |
| III. Data Integrity | ✅ PASS | Validation at API boundaries, database constraints |
| IV. Pragmatic Testing | ✅ PASS | Manual testing acceptable for CRUD operations |
| V. Incremental Delivery | ✅ PASS | Field updates can be delivered incrementally |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/008-subscription-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (schema changes)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API updates)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── subscriptions.py    # API routes (update field handling)
│   ├── models/
│   │   └── subscription.py     # SQLAlchemy model (add/rename fields)
│   ├── schemas/
│   │   └── subscription.py     # Pydantic schemas (add/rename fields)
│   └── services/
│       └── subscription.py     # Business logic (update CSV handling)
├── alembic/
│   └── versions/               # Database migrations for new fields
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── SubscriptionForm.tsx      # Update form fields
│   │   ├── SubscriptionList.tsx      # Update column display
│   │   ├── SubscriptionDetail.tsx    # Update detail view
│   │   ├── SubscriptionFilterBar.tsx # Update filters if needed
│   │   └── SubscriptionImportModal.tsx # Update CSV import mapping
│   ├── pages/
│   │   └── SubscriptionsPage.tsx     # Page orchestration
│   ├── types/
│   │   └── subscription.ts           # TypeScript types
│   └── services/
│       └── api.ts                    # API client (if field changes needed)
```

**Structure Decision**: Web application structure with existing frontend/backend separation. Updates will modify existing files to add new fields and update field names/types.

## Field Change Summary

| Action | Field | Change Details |
|--------|-------|----------------|
| REMOVE | `authentication` | Replaced by `google_authentication` |
| ADD | `google_authentication` | Email type for Google Auth |
| ADD | `renewal_frequency` | Text enum (Monthly/Yearly/Ad Hoc) |
| ADD | `notes` | Text field |
| RENAME+TYPE | `cost` → `payment_amount` | String → Float (display: "Payment Amount") |
| CHANGE | `email_volume_per_week` | String → Float |
| RENAME | `category` display | To "Category" (data field: `category_name`) |
| RENAME | `subcategory` display | To "Sector / Subject" (data field: `subcategory_name`) |
| RENAME | `subscriber_email` display | To "Destination email" |
| RENAME | `forward_to` display | To "Forward to" |
| RENAME | `value_level` display | To "Value" |
| RENAME | `subscription_log` display | To "Subscription Log" |
| RENAME | `actions_todos` display | To "Actions" |
| RENAME | `main_vendor_contact` display | To "Main contact" |
| RENAME | `last_confirmed_alive` display | To "Last confirmed alive" |

## Complexity Tracking

> No violations to justify - implementation follows existing patterns.

