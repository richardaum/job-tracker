# State

**Last Updated:** 2026-04-19
**Current Work:** M1 - Foundation (Planning)

---

## Recent Decisions (Last 60 days)

### AD-001: Tailwind CSS + Radix UI instead of a pre-styled component library (2026-04-19)

**Decision:** Tailwind CSS for styling + Radix UI for behavior/accessibility primitives

**Reason:**
- Pre-styled libraries (Chakra UI, shadcn/ui) impose a recognizable visual language that's hard to override
- Goal is a distinctive UI — requires full style control with zero imposed visual opinions

**Trade-off:**
- More CSS to write
- No out-of-the-box visual defaults

**Impact:**
- Style everything from scratch with Tailwind utility classes
- Use Radix only for interactive behavior (dialogs, dropdowns, tooltips, etc.)
- Every visual decision is explicit and intentional

### AD-002: Drizzle ORM instead of Prisma (2026-04-19)

**Decision:** Use Drizzle ORM as the database access layer
**Reason:** Wanted hands-on experience with Drizzle; its SQL-like syntax gives more explicit control over queries
**Trade-off:** Smaller ecosystem, less reference material than Prisma; more manual migrations
**Impact:** Schema defined in TypeScript with SQL-like API; prefer explicit queries over magic abstractions

### AD-003: Next.js 15 (frontend only) + NestJS (API backend) (2026-04-19)

**Decision:** Split into two services — Next.js 15 handles UI, NestJS handles all API logic
**Reason:** Goal is to gain experience with NestJS as a robust, market-standard backend framework; Next.js is kept only for the frontend layer
**Trade-off:** More complexity in deployment and local dev (two processes); CORS configuration required; no Server Actions or API routes in Next.js
**Impact:** All data fetching goes through NestJS GraphQL endpoints; Next.js is a pure frontend — no backend logic lives there

### AD-004: GraphQL code-first with codegen (2026-04-19)

**Decision:** Use NestJS code-first approach for GraphQL schema + GraphQL Code Generator on the frontend
**Reason:** Code-first keeps schema and resolvers co-located in TypeScript — single source of truth; codegen generates typed hooks/operations for the frontend, eliminating manual type duplication between backend and frontend
**Trade-off:** Codegen adds a build step; schema must be introspected or exported before frontend types can be generated
**Impact:** Backend defines resolvers with decorators → schema auto-generated; frontend runs codegen against the schema to produce typed Apollo hooks

### AD-005: Extensible role-based authorization, user role only in v1 (2026-04-19)

**Decision:** Design authorization with extensible RBAC from the start; ship v1 with only the `user` role
**Reason:** Retrofitting RBAC later is costly — guards and decorators should be in place even before more roles exist
**Trade-off:** Slightly more upfront setup for a feature that won't be exercised in v1
**Impact:** Use NestJS `@Roles()` guard on all endpoints from day one; roles stored on the user entity; adding new roles in the future requires no structural changes

### AD-006: Guest onboarding deferred to v2 (2026-04-19)

**Decision:** Guest onboarding (try before you sign up) was considered and deferred to v2 — v1 requires authentication to create any application
**Reason:** Adds migration logic complexity (localStorage → backend after auth) that is not justified at v1 scale; better to ship the core product first and validate demand before investing in conversion optimization
**Trade-off:** Higher friction for new users in v1 — login required before any action
**Impact:** No guest state management needed in v1; all creation endpoints require authentication

### AD-007: Sentry.io for error tracking and observability (2026-04-19)

**Decision:** Use Sentry.io as the observability solution across both services
**Reason:** Centralized error tracking with full stack traces, breadcrumbs, and performance monitoring; native SDKs for both Next.js and NestJS
**Trade-off:** External dependency; free tier has event limits — may need a paid plan at scale
**Impact:** Both services instrumented independently: `@sentry/nextjs` on the frontend, `@sentry/node` (with NestJS integration) on the backend; errors from both surfaces visible in a single Sentry project

### AD-008: pnpm workspaces as monorepo tooling (2026-04-19)

**Decision:** Use pnpm workspaces to manage the monorepo (Web + API + Extension + packages/ui)
**Reason:** Lightweight, native to pnpm, no additional tooling required; Turborepo layered on top for task orchestration
**Trade-off:** Less opinionated than Nx — team conventions need to be explicit
**Impact:** Each service lives in its own workspace package; `turbo dev` runs all services in parallel locally

### AD-009: JWT for authentication only; authorization via NestJS guards (2026-04-19)

**Decision:** JWT carries user identity (who the user is); all authorization decisions (what the user can do) are enforced server-side via NestJS guards
**Reason:** Clean separation of concerns — JWT is stateless and portable; authorization logic stays centralized in the backend and can evolve independently
**Trade-off:** Every request hits the guard logic on the API; no client-side permission shortcuts
**Impact:** JWT payload contains user ID and role; NestJS `@Roles()` guard validates permissions on every protected resolver/endpoint

### AD-010: Local dev with turbo dev + local PostgreSQL; Docker for production (2026-04-19)

**Decision:** No Docker for local development; use `turbo dev` to run all services in parallel and a local PostgreSQL instance for the database; Docker runs NestJS in production on EC2
**Reason:** Docker adds unnecessary overhead for local dev workflow; in production, Docker provides consistent environment, automatic restarts, and aligns with IP2 (ECS Fargate uses the same Dockerfile)
**Trade-off:** Local environment diverges slightly from production; no container isolation in dev
**Impact:** `turbo dev` is the single command to start the full stack locally; production EC2 runs NestJS via Docker with `--restart unless-stopped`

### AD-011: CORS configured in NestJS via app.enableCors(); no Nginx (2026-04-19)

**Decision:** Handle CORS at the application layer using NestJS `app.enableCors()` with an explicit origin allowlist
**Reason:** CORS headers are returned by the application itself — works regardless of hosting provider; no additional infrastructure needed
**Trade-off:** CORS config lives in code, not at the infra level — requires a redeploy to update allowed origins
**Impact:** Allowlist includes Web domain and `chrome-extension://` origin; `credentials: true` for cookie/auth header support

### AD-012: GitHub Actions for CI/CD (2026-04-19)

**Decision:** Use GitHub Actions as the CI/CD pipeline across all services
**Reason:** Free, integrated with the repository, no external service to manage; Turborepo ensures only affected services are rebuilt and redeployed on each push
**Trade-off:** Build minutes are limited on the free tier for private repos (2000 min/month)
**Impact:** Pipeline: lint → test → build → migrate (API only) → deploy; each service deploys independently based on what changed

### AD-013: AWS infrastructure — Vercel + EC2 + CloudFront + RDS (2026-04-19)

**Decision:** Next.js hosted on Vercel (free); NestJS on EC2 t3.micro via Docker; CloudFront as CDN + SSL in front of EC2; RDS PostgreSQL db.t3.micro for database; Cloudflare DNS (free, replaces Route53)
**Reason:** Vercel eliminates RAM pressure on EC2 (t3.micro has 1GB — too tight for two services); EC2 dedicated to NestJS only is comfortable; Docker on EC2 aligns with IP2 (ECS Fargate uses same Dockerfile); RDS is industry standard; Route53 removed to cut $0.50/mo with negligible learning loss
**Trade-off:** ~$23/mo after 12-month free tier (EC2 ~$8 + RDS ~$15); Vercel introduces potential cost at scale (mitigated by IP2 migration to ECS before Vercel limits are hit)
**Impact:** EC2, CloudFront, ACM, RDS, IAM, SSM, Docker all learned through the project; IP2 migrates Next.js from Vercel to ECS Fargate + ALB when traffic demands it

### AD-015: AI provider abstracted behind a facade (2026-04-19)

**Decision:** All AI features go through an internal `AiService` facade — no code calls the OpenAI SDK directly
**Reason:** Decouples the application from the AI provider; swapping to Anthropic, Gemini, or any other provider requires changes only inside the facade, not across the codebase
**Trade-off:** One extra abstraction layer; facade must be kept up to date as AI features grow
**Impact:** NestJS resolvers call `AiService` methods (e.g. `generateSummary()`, `assessFit()`); the facade owns all OpenAI SDK interactions and prompt logic

### AD-016: Rate limiting via @nestjs/throttler + Redis adapter (2026-04-19)

**Decision:** Use `@nestjs/throttler` for per-user/IP rate limiting; in IP1 (single instance) use in-memory storage; in IP2 (multiple ECS Fargate instances) switch to `@nestjs-throttler-storage-redis` backed by ElastiCache
**Reason:** Kong rejected as overkill for a single API — adds RAM overhead, a new service to operate, and complexity not justified at this scale; NestJS throttler with Redis is production-grade distributed rate limiting with no new infrastructure (ElastiCache is already present in IP2)
**Trade-off:** In-memory throttler in IP1 is per-instance (no cross-instance state), but with a single EC2 that's fine; Redis adapter must be configured in IP2 or rate limits become per-instance again
**Impact:** No Kong, no AWS API Gateway for rate limiting; CloudFront + ALB handle volumetric DDoS at infra level; throttler handles application-level per-user limits

### AD-014: Stale flag pattern for AI summary refresh — no WebSockets (2026-04-19)

**Decision:** When a job application is edited, mark its AI summary as stale in the database; the frontend detects the stale state on load and prompts the user to refresh insights
**Reason:** True real-time streaming is not needed — the trigger is user-initiated edits, not continuous data changes; stale flag is simpler, cheaper, and sufficient
**Trade-off:** User must manually trigger the refresh; summary is not automatically regenerated
**Impact:** Job entity has a `summaryStale: boolean` field; no GraphQL subscriptions or WebSockets required for this feature

---

## Active Blockers

_No active blockers._

---

## Lessons Learned

_No lessons recorded yet._

---

## Quick Tasks Completed

| #   | Description | Date | Commit | Status |
| --- | ----------- | ---- | ------ | ------ |

---

## Deferred Ideas

Ideas captured during work that belong in future features or phases. Prevents scope creep while preserving good ideas.

- [ ] Guest onboarding (try before you sign up) - Deferred to v2 during: Project Planning
- [ ] AI note structuring (enrich raw notes using job + resume context) - Captured during: Project Planning → moved to M3
- [ ] Automatic job import from generic job boards - Captured during: Project Planning
- [ ] Guided auto-apply - Captured during: Project Planning

---

## Todos

Capture in-progress thoughts and action items that don't fit in active tasks.

- [ ] Initialize Next.js 15 (frontend) and NestJS (backend) projects
- [ ] Set up local PostgreSQL and Drizzle connection
- [ ] Configure Google OAuth via @nestjs/passport + passport-google-oauth20

---

## Preferences

**Model Guidance Shown:** never
