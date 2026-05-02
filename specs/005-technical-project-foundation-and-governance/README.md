---
status: archived
created: "2026-05-02"
priority: low
tags:
  - migrated
---

# Technical Scope: project-foundation-and-governance

## Architecture Impact

- [T-42] Maintain a pnpm monorepo foundation with separated web, API, and shared UI workspaces orchestrated by Turborepo.
- [T-43] Preserve service separation (Next.js UI and NestJS API) to keep deployment portability and avoid platform lock-in.
- [T-44] Keep containerization and infrastructure profiles documented for low-traffic and scale-up operating modes.

## Design Decisions

- [T-45] Initialize project scaffolding with explicit workspace roles, CI orchestration, and reproducible build pipelines.
- [T-46] Use Dockerized API build patterns that avoid workspace binary resolution pitfalls in container contexts.
- [T-47] Add baseline observability integrations in web and API runtimes to support operational diagnostics.
- [T-48] Document governance constraints that prohibit Vercel-specific runtime dependencies in application architecture.

## Risks and Mitigations

- [T-49] Environment drift between local and CI pipelines -> keep monorepo build/test/typecheck gates centralized and deterministic.
- [T-50] Infrastructure coupling to a single provider path -> enforce portability constraints in architecture and dependency choices.
- [T-51] Build failures from workspace tooling assumptions in containers -> use deterministic compile commands and validated Docker gates.

## Validation

- [T-52] Verify monorepo bootstrap requirements through successful workspace build, test, and CI workflow execution.
- [T-53] Verify API container image builds successfully with the documented root-context Docker command.
- [T-55] Keep root `README.md` deployment notes and `pnpm docker:build:api` aligned with the Dockerfile and [T-44] infrastructure profiles.
- [T-56] Keep GitHub Actions aligned with local gates by running specs validation, Playwright end-to-end tests, and the root-context API Docker build alongside lint, typecheck, coverage-enforced tests, and production builds.
