---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

# Product Scope: dashboard-and-search

## Objective

- [P-25] Give users a dashboard that summarizes pipeline status and supports fast retrieval of relevant applications.

## In Scope

- [P-26] Provide stage distribution cards and totals for active owned applications.
- [P-27] Provide filtering by stage, company, and recency windows for owned applications.
- [P-28] Provide text search across title, company, and selected note content.
- [P-62] Provide aggregated query paths that keep dashboard cards and list views aligned under the same owner-scoped filters.
- [P-63] Ensure search and filtering performance through indexes tuned for owner-scoped and case-insensitive retrieval.

## Out of Scope

- [P-29] Predictive ranking or recommendation of next best applications to prioritize.
- [P-30] Team-level dashboards or cross-user aggregated reporting.

## Acceptance Criteria

- [P-31] A user can apply dashboard filters and see result counts and lists update accordingly.
- [P-32] A user can search by keyword and retrieve matching owned applications with consistent pagination.
- [P-33] Dashboard metrics reconcile with list query totals for the same filter set.
- [P-64] Dashboard aggregate and list retrieval behavior remain consistent under the same canonical filter contract and expected latency targets.
