# Project Specification

## Functional Requirements

- [F-1] Users must authenticate with Google OAuth before accessing protected application management features.
- [F-2] Authenticated users must create, list, update, and delete their own job application records.
- [F-3] Access control must enforce ownership isolation so users cannot access other users' application data.
- [F-4] The product must support application tracking workflows that improve update consistency over time.
- [F-5] Future product expansion may include extension-based import and guided automation capabilities.

## Non-Functional Requirements

- [F-6] API latency target is p95 under 500ms for primary request paths.
- [F-7] Web experience target includes LCP under 2.5 seconds on core user pages.
- [F-8] Security controls must include HTTPS, validated input boundaries, and protected token handling practices.
- [F-9] Minimum line coverage target in CI is 80 percent across main workspaces.
- [F-10] Baseline accessibility target is WCAG 2.1 Level A for user-facing experiences.
- [F-21] Local development performance must be tracked with `pnpm perf:web:login-compile`; cold compile for `/login` should stay at or below 8 seconds and 14,000 modules.

## High-Level Architecture

- [F-11] The system uses a pnpm monorepo with `apps/web`, `apps/api`, and shared `packages/ui`.
- [F-12] `apps/web` is a Next.js UI client that consumes GraphQL APIs and shared UI components.
- [F-13] `apps/api` is a NestJS GraphQL service backed by PostgreSQL and Drizzle ORM.
- [F-14] Shared UI and tokenized visual standards are managed in `packages/ui` with Storybook support.
- [F-15] Observability and analytics rely on service telemetry tooling across frontend and backend paths.

## Constraints

- [F-16] The project is optimized for single-developer execution and pragmatic iteration speed.
- [F-17] Architecture must avoid lock-in to Vercel-specific runtime services and vendor-only platform features.
- [F-18] Refresh and session handling must avoid exposing sensitive token data in browser localStorage.
- [F-19] Integration tests that require a real database must run with explicit environment preconditions.
- [F-20] Deployment and infrastructure choices must preserve a migration path from low-traffic to scaled operation modes.
