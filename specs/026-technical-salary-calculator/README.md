---
status: planned
created: 2026-05-06
priority: low
tags:
  - web
  - tools
created_at: 2026-05-06T14:18:07.339055Z
updated_at: 2026-05-06T14:18:07.339055Z
---

# Technical Scope: salary-calculator

> **Status**: planned · **Priority**: low · **Created**: 2026-05-06

## Architecture Impact

- [T-5] New route `apps/web/src/app/(authenticated)/tools/salary-calculator/page.tsx` and page component in `apps/web/src/modules/tools/salary-calculator/`.
- [T-6] New UI components in `packages/ui` or local to the module: `RateInput`, `CurrencySelector`, `ConversionCard`.
- [T-7] New GraphQL domain `currency-converter` in `apps/api/src/domains/currency-converter/` with service, resolver, module, and types for fetching exchange rates from free public APIs.
- [T-8] Frontend `useExchangeRates` hook consumes the `exchangeRates` GraphQL query with Apollo Client instead of direct fetch calls.

## Design Decisions

- [T-9] Exchange rate API calls move to the backend (`apps/api`) to avoid CORS issues, centralize caching, and hide API details. The frontend queries `exchangeRates(base, currencies)` via GraphQL.
- [T-10] Backend uses `frankfurter.app` as primary (no key required) with `exchangerate-api.com` as fallback for unsupported currencies. In-memory LRU cache with 1-hour TTL per base currency.
- [T-11] Salary period conversion math stays client-side: yearly = hourly _ 40 _ 52, monthly = yearly / 12, hourly = yearly / (40 \* 52); all results rounded to 2 decimal places for display.
- [T-12] Currency combobox reuses existing `CurrencyCombobox` from `@job-tracker/ui`.

## Risks and Mitigations

- [T-13] Free API rate limits or downtime -> Backend caches rates in memory with 1-hour TTL; frontend caches in sessionStorage as fallback; shows graceful degradation UI if fetch fails; allows manual retry.
- [T-14] BRL not supported by frankfurter.app -> Backend uses dual-API strategy: frankfurter.app as primary, exchangerate-api.com as fallback for unsupported currencies.
- [T-15] Floating point precision issues in currency math -> Use integer-cent arithmetic internally; round only at display time with `Intl.NumberFormat`.

## Validation

- [T-16] Unit tests for salary period conversion math (hourly<->monthly<->yearly) covering edge cases (zero, negative, large numbers).
- [T-17] Integration test mocking the exchange rate API to verify loading, success, and error states in the GraphQL resolver.
- [T-18] Manual smoke test: load page at `/tools/salary-calculator`, enter 100 USD/hr, verify yearly shows ~208,000 USD, convert to EUR/GBP/BRL/CHF with plausible rates.
