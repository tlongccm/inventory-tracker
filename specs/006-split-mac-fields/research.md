# Research: Split MAC Address Fields

**Branch**: `006-split-mac-fields` | **Date**: 2025-12-21

## Overview

This feature has no unknowns requiring research. The implementation follows established patterns in the existing codebase.

## Decisions

### 1. Field Naming Convention

**Decision**: Use `mac_lan` and `mac_wlan` as database field names

**Rationale**:
- Matches existing snake_case convention in the codebase (e.g., `mac_address`, `ip_address`, `cpu_model`)
- Clear distinction between wired (LAN) and wireless (WLAN) interfaces
- Concise names that work well in both database columns and API responses

**Alternatives Considered**:
- `mac_address_wired` / `mac_address_wireless`: More verbose, breaks from existing naming patterns
- `mac_ethernet` / `mac_wifi`: Less technical, "WiFi" is brand-specific terminology

### 2. Migration Strategy

**Decision**: Rename existing `mac_address` column to `mac_lan`, add new `mac_wlan` column

**Rationale**:
- Preserves existing data (most common use case is wired LAN MAC)
- No data loss during migration
- Simple single-step migration

**Alternatives Considered**:
- Keep `mac_address` and add `mac_wlan`: Creates confusion about which is wired
- Drop and recreate: Unnecessary complexity, data loss risk

### 3. CSV Backward Compatibility

**Decision**: Legacy "MAC Address" column maps to `mac_lan`; new exports use "MAC (LAN)" and "MAC (WLAN)"

**Rationale**:
- Existing CSV files continue to work (mapped to LAN field)
- Clear distinction in new exports
- No breaking change for users with existing CSV templates

**Alternatives Considered**:
- Break backward compatibility: Rejected per constitution principle of incremental delivery
- Support both column names indefinitely: Acceptable, implemented

### 4. Validation Reuse

**Decision**: Reuse existing `validate_mac_address` and `normalize_mac_address` functions for both fields

**Rationale**:
- Same format (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
- Same normalization rules apply
- No new validation code needed

**Alternatives Considered**: None - clear reuse case

## Dependencies

No new dependencies required. Feature uses:
- SQLAlchemy (existing)
- Alembic (existing)
- Pydantic (existing)
- React (existing)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration fails on production | Low | High | Test migration on copy of production DB first |
| CSV import breaks | Low | Medium | Backward compatibility for legacy column names |
| UI layout issues | Low | Low | Two fields same size as one; test responsive layout |

## Conclusion

No research phase blockers. Proceed to Phase 1 design.
