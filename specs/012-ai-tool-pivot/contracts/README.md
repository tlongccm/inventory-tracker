# API Contracts: AI Tool Pivot View

**Feature**: 012-ai-tool-pivot
**Date**: 2025-12-23

## No API Changes Required

This feature is a frontend-only change. The existing subscription API endpoints provide all required data.

### Existing Endpoint Used

**GET /api/v1/subscriptions**

Returns `SubscriptionListItem[]` which includes all fields needed for the AI Tools pivot view:
- `access_level_required`
- `provider`
- `username`
- `password`
- `description_value`
- `cost`
- `annual_cost`
- `payment_frequency`

No modifications to request parameters or response schema are needed.
