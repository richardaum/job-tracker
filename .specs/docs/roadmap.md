# Roadmap

## Sequence

- [R-15] Establish Beta2 planning baseline by separating implemented Beta1 scope from pending product expansion work.
- [R-16] Deliver `application-stages-and-notes` as the canonical tracking scope, including workflow integrity and timeline consistency.
- [R-17] Deliver `dashboard-and-search` as the canonical discovery scope, including aggregate query consistency and indexed retrieval.
- [R-19] Deliver `ai-assistance` as the canonical AI scope, including deterministic enrichment contracts and approval-gated persistence.
- [R-20] Deliver `import-and-onboarding-expansion` as the canonical import scope, including connector safeguards and guest migration integrity.
- [R-18] Deliver `multilingual-experience` as the canonical i18n scope, including locale routing, dictionary governance, and EN/PT-BR quality checks.

## Dependencies

- [R-21] [R-17] depends on [R-16] because dashboard views require normalized stage and note data.
- [R-22] [R-18] depends on [R-16] and [R-17] so multilingual coverage targets concrete user-facing surfaces.
- [R-23] [R-19] depends on [R-16] and [R-17] because AI assistance consumes tracked application context and searchable content.
- [R-24] [R-20] depends on [R-16] and [R-19] because imported data must map to the same tracking model and enrichment pipeline.

## Milestones

- [R-25] Milestone B2-M1: tracking and dashboard canonical scopes (`application-stages-and-notes`, `dashboard-and-search`) are operational behind stable ownership boundaries.
- [R-26] Milestone B2-M2: multilingual and AI canonical scopes (`multilingual-experience`, `ai-assistance`) are production-ready with quality and review controls.
- [R-27] Milestone B2-M3: import canonical scope (`import-and-onboarding-expansion`) is validated with explicit guardrails and rollout strategy.

## Completion status

Beta1 is complete and archived under `.specs/beta1`; Beta2 execution has completed [R-16] (`application-stages-and-notes`) and is now advancing to [R-17] (`dashboard-and-search`) using one canonical scope file per product topic.
