---
status: planned
created: "2026-05-02"
priority: medium
tags:
  - migrated
---

# Roadmap

## Sequence

- [R-31] Deliver `typeorm-data-layer` by replacing Drizzle with TypeORM in `apps/api`, including Nest module wiring, entity definitions, migration runner, and Drizzle cutover notes for existing databases.
- [R-15] Establish Beta2 planning baseline by separating implemented Beta1 scope from pending product expansion work.
- [R-16] Deliver `application-stages-and-notes` as the canonical tracking scope, including workflow integrity and timeline consistency.
- [R-17] Deliver `dashboard-and-search` as the canonical discovery scope, including aggregate query consistency and indexed retrieval.
- [R-19] Deliver `ai-assistance` as the canonical AI scope, including deterministic enrichment contracts and approval-gated persistence.
- [R-20] Deliver `import-and-onboarding-expansion` as the canonical import scope, including connector safeguards and guest migration integrity; Chrome extension-assisted capture is tracked in **`specs/023-product-chrome-extension/README.md`** alongside that scope.
- [R-18] Deliver `multilingual-experience` as the canonical i18n scope, including locale routing, dictionary governance, and EN/PT-BR quality checks.
- [R-28] Deliver `application-salary` as the optional structured pay and tags scope on the canonical application record, including list and details UI parity.
- [R-33] Deliver `salary-calculator` as a standalone tools page with hourly/monthly/yearly rate conversion and multi-currency support (USD, EUR, BRL, GBP, CHF) using a free public exchange rate API.
- [R-34] Establish a first-party web/API topology by serving the API at `api.newjobtracker.app` or through a same-origin proxy at `newjobtracker.app/api`; preserve HTTPS and explicit origin policy, and define a separate authentication transport for the Chrome extension.

## Dependencies

- [R-32] [R-31] should complete before adding new ORM-specific patterns in `apps/api` so dashboard, multilingual, AI, and import scopes share a single migration and entity workflow.
- [R-21] [R-17] depends on [R-16] because dashboard views require normalized stage and note data.
- [R-22] [R-18] depends on [R-16] and [R-17] so multilingual coverage targets concrete user-facing surfaces.
- [R-23] [R-19] depends on [R-16] and [R-17] because AI assistance consumes tracked application context and searchable content.
- [R-24] [R-20] depends on [R-16] and [R-19] because imported data must map to the same tracking model and enrichment pipeline.
- [R-29] [R-28] depends on [R-16] because salary fields extend the same `applications` entity and must remain consistent with stage and note ownership rules.

## Milestones

- [R-25] Milestone B2-M1: tracking and dashboard canonical scopes (`application-stages-and-notes`, `dashboard-and-search`) are operational behind stable ownership boundaries.
- [R-26] Milestone B2-M2: multilingual and AI canonical scopes (`multilingual-experience`, `ai-assistance`) are production-ready with quality and review controls.
- [R-27] Milestone B2-M3: import canonical scope (`import-and-onboarding-expansion`) and companion Chrome extension spec (`chrome-extension`) are validated with explicit guardrails and rollout strategy.
- [R-30] Milestone B2-M1b: `application-salary` ships optional pay metadata on applications so owners can compare opportunities without cross-user analytics in Beta2.

## Completion status

Execution status above reflects **Beta2** planning identifiers. Completed **prior-phase roadmap** (**R-1**–**R-7**) and milestones **R-12**–**R-14** below were folded from the duplicated legacy roadmap snapshot.

### Prior-phase sequence ([R-1]–[R-7])

- [R-1] Finalize authenticated user access foundation and stable session handling for protected workflows.
- [R-2] Deliver and maintain owner-scoped application CRUD as the core user value stream.
- [R-3] Consolidate product and technical planning artifacts under strict SDD structure and governance.
- [R-4] Harden environment safety, validation paths, and runtime configuration consistency.
- [R-5] Improve reliability and observability through instrumentation, resilience checks, and profiling standards.
- [R-6] Strengthen developer workflow quality gates for linting, testing, build, and coverage enforcement.
- [R-7] Evolve platform foundation for scalable operation modes without sacrificing architecture portability.

### Dependencies (prior-phase)

- [R-8] [R-2] depends on [R-1] for authenticated access and user identity context.
- [R-9] [R-3] depends on [R-2] artifacts and [F-11] architecture definitions for complete migration coverage.
- [R-10] [R-4], [R-5], and [R-6] depend on [R-3] so documentation and governance rules are canonical first.
- [R-11] [R-7] depends on [R-4], [R-5], and [R-6] to scale from a validated and observable baseline.

### Milestones (prior-phase)

- [R-12] Milestone M1: authenticated application core delivered with owner isolation and verified user flows.
- [R-13] Milestone M2: SDD documentation model established with deterministic IDs, state tracking, and history logging.
- [R-14] Milestone M3: reliability, tooling, and platform hardening baselines verified for ongoing feature delivery.

### Prior-phase completion note

As of 2026-04-22 the sequence **[R-1]** through **[R-7]** was treated complete in-repository (quality gates, e2e, Docker docs, **`specs:validate`**-era CI). That closure is superseded by the **Beta2** sequence (**[R-15]** onward) tracked in sections above.

Beta2 execution has completed **[R-16]** (`application-stages-and-notes`), **[R-28]** (`application-salary`), and **[R-31]** (`typeorm-data-layer`). Active execution advances on **[R-17]** (`dashboard-and-search`), with rich company descriptions and unified management UI as baseline.
