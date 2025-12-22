# Tasks: Subscription Tracking Field Update (2025-12-22)

**Input**: Design documents from `/specs/008-subscription-tracking/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Note**: This task list addresses the field definition UPDATE from the 2025-12-22 spec revision. The subscription feature already exists - these tasks update it to match new field definitions from `subscription_fields.csv`.

**Tests**: Manual testing acceptable per constitution (no automated test tasks included)

**Organization**: Tasks are grouped by component layer (database → backend → frontend) for efficient sequential execution.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for Python/FastAPI, `frontend/src/` for React/TypeScript

---

## Phase 1: Database Migration

**Purpose**: Create Alembic migration for field changes

- [ ] T001 Create Alembic migration file in backend/alembic/versions/ for field update 2025-12-22
- [ ] T002 Add `google_authentication` column (String 200) to subscriptions table
- [ ] T003 Add `renewal_frequency` column (String 20) to subscriptions table
- [ ] T004 Add `notes` column (Text) to subscriptions table
- [ ] T005 Migrate data from `authentication` to `google_authentication`
- [ ] T006 Update `payment_frequency` values: 'Annual' → 'Yearly', 'Other' → 'Ad Hoc'
- [ ] T007 Rename `cost` to `payment_amount` and change type: String → Numeric with data conversion (NULL for unparseable)
- [ ] T008 Handle `email_volume_per_week` type change: String → Numeric with data conversion
- [ ] T009 Drop old `authentication` column after data migration
- [ ] T010 Run migration with `alembic upgrade head` and verify database schema

**Checkpoint**: Database schema updated with new fields and data preserved

---

## Phase 2: Backend Model Updates

**Purpose**: Update SQLAlchemy model to match new schema

- [ ] T011 Add RenewalFrequency enum class in backend/app/models/subscription.py
- [ ] T012 Update PaymentFrequency enum: ANNUAL → YEARLY, OTHER → AD_HOC in backend/app/models/subscription.py
- [ ] T013 Add `google_authentication` column (replaces `authentication`) in backend/app/models/subscription.py
- [ ] T014 Add `renewal_frequency` column with RenewalFrequency enum in backend/app/models/subscription.py
- [ ] T015 Add `notes` column (Text) in backend/app/models/subscription.py
- [ ] T016 Rename `cost` to `payment_amount` and change type from String to Numeric(12,2) in backend/app/models/subscription.py
- [ ] T017 Change `email_volume_per_week` column type from String to Numeric(10,2) in backend/app/models/subscription.py
- [ ] T018 Remove `authentication` column from model in backend/app/models/subscription.py

**Checkpoint**: SQLAlchemy model reflects new field definitions

---

## Phase 3: Backend Schema Updates

**Purpose**: Update Pydantic schemas for API validation

- [ ] T019 [P] Add RenewalFrequency enum to backend/app/schemas/subscription.py
- [ ] T020 [P] Update PaymentFrequency enum values in backend/app/schemas/subscription.py
- [ ] T021 Rename `authentication` to `google_authentication` in SubscriptionCreate schema in backend/app/schemas/subscription.py
- [ ] T022 Rename `authentication` to `google_authentication` in SubscriptionUpdate schema in backend/app/schemas/subscription.py
- [ ] T023 Rename `authentication` to `google_authentication` in SubscriptionResponse/ListItem schemas in backend/app/schemas/subscription.py
- [ ] T024 Add `renewal_frequency` field to all subscription schemas in backend/app/schemas/subscription.py
- [ ] T025 Add `notes` field to all subscription schemas in backend/app/schemas/subscription.py
- [ ] T026 Rename `cost` to `payment_amount` and change type to Decimal in all subscription schemas in backend/app/schemas/subscription.py
- [ ] T027 Change `email_volume_per_week` field type to Decimal in all subscription schemas in backend/app/schemas/subscription.py

**Checkpoint**: Pydantic schemas validate new field types correctly

---

## Phase 4: Backend Service Updates

**Purpose**: Update business logic and CSV handling

- [ ] T028 Update CSV export field mapping to use new field names in backend/app/services/subscription.py
- [ ] T029 Update CSV import field mapping to accept both old and new column names in backend/app/services/subscription.py
- [ ] T030 Add backward compatibility aliases: 'authentication' → 'google_authentication', 'Authentication' → 'google_authentication', 'Google Auth' → 'google_authentication' in backend/app/services/subscription.py
- [ ] T031 Update any field references from `authentication` to `google_authentication` in backend/app/services/subscription.py
- [ ] T032 Handle numeric conversion for `cost` → `payment_amount` in CSV import (extract number, NULL if unparseable) in backend/app/services/subscription.py
- [ ] T033 Handle numeric conversion for `email_volume_per_week` in CSV import in backend/app/services/subscription.py

**Checkpoint**: CSV import/export handles new and legacy field formats

---

## Phase 5: Backend API Verification

**Purpose**: Verify API endpoints work with updated schemas

- [ ] T034 Start backend server and verify no startup errors
- [ ] T035 Test GET /subscriptions returns new fields correctly via API docs at localhost:8000/docs
- [ ] T036 Test POST /subscriptions accepts new fields correctly
- [ ] T037 Test PUT /subscriptions/{id} updates new fields correctly
- [ ] T038 Test GET /subscriptions/export returns new field names in CSV
- [ ] T039 Test POST /subscriptions/import accepts new and legacy field names

**Checkpoint**: API endpoints fully support new field definitions

---

## Phase 6: Frontend Type Updates

**Purpose**: Update TypeScript types to match API changes

- [ ] T040 Rename `authentication` to `google_authentication` in Subscription interface in frontend/src/types/subscription.ts
- [ ] T041 Add `renewal_frequency` field to Subscription interface in frontend/src/types/subscription.ts
- [ ] T042 Add `notes` field to Subscription interface in frontend/src/types/subscription.ts
- [ ] T043 Rename `cost` to `payment_amount` and change type to number in frontend/src/types/subscription.ts
- [ ] T044 Change `email_volume_per_week` field type to number in frontend/src/types/subscription.ts
- [ ] T045 Update PaymentFrequency type: 'Annual' → 'Yearly', 'Other' → 'Ad Hoc' in frontend/src/types/subscription.ts
- [ ] T046 Add RenewalFrequency type in frontend/src/types/subscription.ts

**Checkpoint**: TypeScript types match updated API contract

---

## Phase 7: Frontend Form Updates

**Purpose**: Update subscription form with new fields and labels

- [ ] T047 Rename 'Authentication' field label to 'Google Auth' and update field name to `google_authentication` in frontend/src/components/SubscriptionForm.tsx
- [ ] T048 Add 'Renewal Frequency' dropdown field with options Monthly/Yearly/Ad Hoc in frontend/src/components/SubscriptionForm.tsx
- [ ] T049 Add 'Notes' text area field in frontend/src/components/SubscriptionForm.tsx
- [ ] T050 Change 'Cost' field to numeric input (allow decimals) in frontend/src/components/SubscriptionForm.tsx
- [ ] T051 Change 'Email volume / week' field to numeric input in frontend/src/components/SubscriptionForm.tsx
- [ ] T052 Update 'Payment Frequency' dropdown options: Annual → Yearly, Other → Ad Hoc in frontend/src/components/SubscriptionForm.tsx

**Checkpoint**: Subscription form shows all new fields with correct labels

---

## Phase 8: Frontend List/Display Updates

**Purpose**: Update column headers and display components

- [ ] T053 [P] Update column header 'Authentication' to 'Google Auth' in frontend/src/components/SubscriptionList.tsx
- [ ] T054 [P] Update column header 'Cost' to 'Payment Amount' in frontend/src/components/SubscriptionList.tsx
- [ ] T055 [P] Update column header 'Subcategory' to 'Sector / Subject' in frontend/src/components/SubscriptionList.tsx
- [ ] T056 [P] Update column header 'Value Level' to 'Value' in frontend/src/components/SubscriptionList.tsx
- [ ] T057 [P] Update column header 'Subscriber Email' to 'Destination email' in frontend/src/components/SubscriptionList.tsx
- [ ] T058 [P] Update column header 'Main Vendor Contact' to 'Main contact' in frontend/src/components/SubscriptionList.tsx
- [ ] T059 [P] Update column header 'Last Confirmed Alive' to 'Last confirmed alive' in frontend/src/components/SubscriptionList.tsx
- [ ] T060 [P] Update column header 'Actions/To Do' to 'Actions' in frontend/src/components/SubscriptionList.tsx
- [ ] T061 [P] Update column header 'Subscription Log & Workflow' to 'Subscription Log' in frontend/src/components/SubscriptionList.tsx
- [ ] T062 Add 'Renewal Frequency' column to Financial View group in frontend/src/components/SubscriptionList.tsx
- [ ] T063 Add 'Notes' column to Details View group in frontend/src/components/SubscriptionList.tsx
- [ ] T064 Format `payment_amount` as currency/number in list display in frontend/src/components/SubscriptionList.tsx
- [ ] T065 Format `email_volume_per_week` as number in list display in frontend/src/components/SubscriptionList.tsx

**Checkpoint**: List view shows correct column headers and data formatting

---

## Phase 9: Frontend Detail View Updates

**Purpose**: Update detail view with new field names and formatting

- [ ] T066 [P] Update field labels in detail view to match spec display headers in frontend/src/components/SubscriptionDetail.tsx
- [ ] T067 [P] Add 'Renewal Frequency' field to detail view in frontend/src/components/SubscriptionDetail.tsx
- [ ] T068 [P] Add 'Notes' field to detail view in frontend/src/components/SubscriptionDetail.tsx
- [ ] T069 Format numeric fields (payment_amount, email_volume_per_week) in detail view in frontend/src/components/SubscriptionDetail.tsx

**Checkpoint**: Detail view displays all fields with correct labels

---

## Phase 10: CSV Import Modal Updates

**Purpose**: Update CSV import field mapping display

- [ ] T070 Update CSV import field mapping help text with new column names in frontend/src/components/SubscriptionImportModal.tsx
- [ ] T071 Update expected CSV header display to show new field names in frontend/src/components/SubscriptionImportModal.tsx

**Checkpoint**: CSV import guidance reflects new field names

---

## Phase 11: End-to-End Verification

**Purpose**: Full testing and validation

- [ ] T072 Start frontend server and verify no compilation errors
- [ ] T073 Test create subscription with all new fields (google_authentication, renewal_frequency, notes)
- [ ] T074 Test edit subscription updating new fields
- [ ] T075 Test view subscription detail shows new fields correctly with updated labels
- [ ] T076 Test CSV export includes new field names
- [ ] T077 Test CSV import with new column names
- [ ] T078 Test CSV import with legacy column names (backward compatibility: 'authentication', 'Authentication')
- [ ] T079 Test numeric fields accept valid numbers and reject invalid input
- [ ] T080 Verify all display headers match spec in UI (per Display Header Mapping table in data-model.md)

**Checkpoint**: All field updates verified working end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Migration)
    ↓
Phase 2 (Backend Model)
    ↓
Phase 3 (Backend Schema)
    ↓
Phase 4 (Backend Service)
    ↓
Phase 5 (Backend API Verification)
    ↓
Phase 6 (Frontend Types)
    ↓
Phase 7 (Frontend Form)
    ↓
Phase 8 (Frontend List) ─┬─ Phase 9 (Frontend Detail)
                         │
                         └─ Phase 10 (CSV Modal)
    ↓
Phase 11 (E2E Verification)
```

### Sequential Execution (Recommended)

1. **Phase 1**: Database migration first (schema must change before code)
2. **Phase 2-4**: Backend updates (model → schema → service)
3. **Phase 5**: Verify backend works before frontend
4. **Phase 6**: Update types before components
5. **Phase 7-10**: Frontend components can partially parallel
6. **Phase 11**: Final verification

### Parallel Opportunities

**Within Phase 3:**
- T019 and T020 can run in parallel (enum definitions)

**Within Phase 8:**
- T053-T061 can run in parallel (different column updates)

**Within Phase 9:**
- T066-T069 can run in parallel (different detail view updates)

**Phases 8, 9, 10 can partially overlap** after Phase 7 completes

---

## Implementation Strategy

### Incremental Delivery

1. **Backend First**: Complete Phases 1-5, verify backend works
2. **Frontend Second**: Complete Phases 6-10
3. **Verify**: Complete Phase 11

### Rollback Strategy

If issues arise:
1. Alembic downgrade to reverse migration
2. Git revert code changes
3. Old field names preserved via aliases in CSV import

### Quick Win Order

For fastest visible progress:
1. T001-T010 (migration)
2. T011-T018 (model)
3. T019-T027 (schema)
4. T034-T039 (verify backend)
5. T040-T046 (types)
6. T047-T052 (form)
7. T053-T065 (list)
8. T066-T071 (detail/csv)
9. T072-T080 (verify)

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Migration | T001-T010 | Alembic migration for new fields |
| 2. Backend Model | T011-T018 | SQLAlchemy model updates |
| 3. Backend Schema | T019-T027 | Pydantic schema updates |
| 4. Backend Service | T028-T033 | CSV handling updates |
| 5. Backend Verify | T034-T039 | API endpoint testing |
| 6. Frontend Types | T040-T046 | TypeScript type updates |
| 7. Frontend Form | T047-T052 | Form field updates |
| 8. Frontend List | T053-T065 | Column header and display updates |
| 9. Frontend Detail | T066-T069 | Detail view updates |
| 10. CSV Modal | T070-T071 | Import guidance updates |
| 11. E2E Verify | T072-T080 | End-to-end testing |

**Total Tasks**: 80 (T001-T080)
**Parallel Opportunities**: Phase 3 (2 tasks), Phase 8 (9 tasks), Phase 9 (4 tasks)

---

## Field Changes Reference

| Change | Field | Details |
|--------|-------|---------|
| RENAME | `authentication` → `google_authentication` | Email type for Google Auth |
| ADD | `renewal_frequency` | Enum: Monthly/Yearly/Ad Hoc |
| ADD | `notes` | Text field |
| RENAME+TYPE | `cost` → `payment_amount` | String → Numeric (float) |
| TYPE | `email_volume_per_week` | String → Numeric (float) |
| ENUM | `payment_frequency` | Annual→Yearly, Other→Ad Hoc |

---

## Notes

- All tasks update existing files - no new files created
- Backward compatibility maintained for CSV import (old column names still work)
- Display headers change but most data field names stay the same
- Enum value changes require data migration (Annual→Yearly, Other→Ad Hoc)
- Type changes (String→Numeric) require careful data conversion with NULL fallback for unparseable values
- Commit after each phase for easy rollback
