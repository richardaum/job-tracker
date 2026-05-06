---
status: planned
created: 2026-05-06
priority: low
tags:
  - tools
  - productivity
created_at: 2026-05-06T14:17:50.478408Z
updated_at: 2026-05-06T14:17:50.478408Z
---

# Product Scope: salary-calculator

> **Status**: planned · **Priority**: low · **Created**: 2026-05-06

## Objective

- [P-94] Users can convert between hourly, monthly, and yearly salary rates to quickly compare compensation offers across different pay cadences.

## In Scope

- [P-95] Standalone page accessible from the main navigation that provides bidirectional conversion between hourly, monthly, and yearly rates based on standard work assumptions (40h/week, 52 weeks/year, ~4.33 weeks/month).
- [P-96] Currency converter supporting USD, EUR, BRL, GBP, and CHF with real-time or cached exchange rates from a free public API.
- [P-97] Users can enter a rate in any cadence field and see the equivalent values in the other two cadences instantly.
- [P-98] Users can select source and target currencies and see converted amounts for all three cadences simultaneously.
- [P-99] Clear visual indication when exchange rates are stale (older than 1 hour) with a refresh option.

## Out of Scope

- [P-100] Tax calculations, deductions, or net-vs-gross computations.
- [P-101] Historical exchange rate tracking or rate alerts.
- [P-102] Saving or persisting calculator inputs to the database.

## Acceptance Criteria

- [P-103] A user can enter an hourly rate and immediately see correct monthly and yearly equivalents.
- [P-104] A user can convert a salary from USD to EUR and see all three cadences (hourly/monthly/yearly) in the target currency.
- [P-105] Exchange rates load within 3 seconds on page load with a visible loading state.
- [P-106] If the currency API fails, the page shows a clear error message with a retry button and still allows cadence-only conversions.
- [P-107] The page is accessible at `/tools/salary-calculator` from the authenticated navigation.
