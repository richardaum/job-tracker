# Project Specification

## Functional Requirements

- [F-22] Users must track each application through explicit stages with history and interview-oriented notes.
- [F-23] Users must visualize pipeline health with stage-level dashboard metrics, filtering, and text search.
- [F-24] Users must use the product in English and Portuguese (Brazil) with consistent locale behavior.
- [F-25] Users must receive AI-generated job insights and AI-assisted note structuring before saving updates.
- [F-26] Users must import opportunities from extension flows and generic board URLs without manual retyping.
- [F-27] Users may explore the product through a guest onboarding path before creating an authenticated account.
- [F-41] Users may record optional structured compensation on each application: minimum and/or maximum amount in integer minor units, ISO-4217 currency code, pay period (year, month, or hour), and a bounded list of free-form compensation tags.

## Non-Functional Requirements

- [F-28] API latency target remains p95 under 500ms for core CRUD and dashboard query paths after Beta2 changes.
- [F-29] AI enrichment requests must return a first response within 10 seconds for p95 successful calls.
- [F-30] Beta2 user-facing flows must preserve WCAG 2.1 Level A baseline in all supported locales.
- [F-31] CI line coverage target remains at least 80 percent across impacted workspaces and new modules.
- [F-32] Imported and AI-generated fields must preserve provenance metadata for user review and auditability.
- [F-42] Compensation tag normalization, deduplication, and per-request bounds must run in the API so the web client cannot bypass storage limits.

## High-Level Architecture

- [F-33] The system remains a pnpm monorepo with `apps/web`, `apps/api`, shared `packages/ui`, and optional extension workspace integration.
- [F-34] `apps/web` remains a UI-only Next.js client that consumes GraphQL and never embeds direct board automation logic.
- [F-35] `apps/api` remains the orchestration layer for stages, notes, AI enrichment, import processing, and guest-to-user migration, using TypeORM for PostgreSQL access.
- [F-36] Async workloads for AI and import processing must be isolated behind internal API boundaries and observable job execution paths.
- [F-43] Optional compensation data remains first-class columns on the `applications` table and travels through the existing application GraphQL read and write paths.

## Constraints

- [F-37] Autonomous job submission to third-party boards remains out of scope for Beta2 even when import is available.
- [F-38] AI suggestions must require explicit user confirmation before persisted changes become final application data.
- [F-39] Architecture must continue to avoid vendor lock-in and preserve migration paths from low-traffic to scaled operation modes.
- [F-40] Integration tests requiring real services must keep explicit environment preconditions and deterministic fallback behavior.
- [F-44] Company-wide or market-wide compensation analytics, payroll system integrations, and third-party pay APIs remain out of scope for the compensation feature slice.
- [F-45] The API persists relational data through TypeORM integrated with NestJS, not through Drizzle, while preserving existing ownership, revision, and timeline rules.
- [F-46] Schema changes ship as reviewed TypeORM migration classes; using TypeORM `synchronize` against shared or production-like databases is forbidden.
