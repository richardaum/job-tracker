# Job Tracker

**Vision:** An assistant to help candidates manage their applications and track each application's stage without needing a spreadsheet.
**For:** Everyone applying for jobs who needs to track applications from multiple sources.
**Solves:** Forgetting interview details, lack of overview across applications, reliance on single-purpose alternatives.

---

## Versioning & Phasing

| Concept | What it means |
| --- | --- |
| **v1 / v2** | Product versions — what features ship and when |
| **M1 → M3** | Milestones within v1 — implementation order (see ROADMAP.md) |
| **IP1 / IP2** | Infrastructure scaling tiers — driven by traffic, not features (see COSTS.md) |

---

## Goals

- **Search Completion Rate:** % of users who reach the final stage of their application pipeline. Target: > 30%.
- **Application Update Frequency:** Median time between consecutive status updates on a job application. Baseline: < 14 days — to be revisited after first 30 days of real usage.
- **Note Completion Density:** % of note fields filled after an interview. Target: > 70%.
- **Weekly Active Tracking Rate:** % of users who return and update at least one application within 7 days. Target: > 40%.

---

## Scope

**v1 — current version:**

- Google OAuth (multi-user support)
- Role-based authorization (extensible; `user` role only in v1)
- CRUD operations for applications, stages and notes
- AI-powered insights: job summary, fit assessment, skills gap, interview tips (OpenAI)
- AI note structuring: enriches raw notes using job description and resume as context
- Mobile-first design
- Multi-language support (EN + PT-BR)

**v2 — future version:**

- Chrome extension to import applications from job boards (LinkedIn, Jack, RemoteYeah)
- Guest onboarding: try before you sign up
- Automatic job import from generic job boards
- Guided auto-apply

---

## Tech Stack

**Architecture (v1):** Web (Next.js 15) + API (NestJS) — two separate services

**Architecture (v2 addition):** + Chrome Extension

**Web:**

- Framework: Next.js 15 (UI only — no API routes or Server Actions)
- Language: TypeScript
- Apollo Client (GraphQL client + cache)
- Zustand (local UI state only — not for server data)
- GraphQL Code Generator (typed hooks from schema)
- Consumes `packages/ui` design system

**API:**

- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- Drizzle ORM (database access)
- @nestjs/graphql + Apollo Server (GraphQL, code-first)
- @nestjs/passport + passport-google-oauth20 (Google OAuth)
- OpenAI SDK (AI features — consumed via internal `AiService` facade, never called directly)
- @nestjs/throttler (rate limiting — in-memory in IP1, Redis adapter via ElastiCache in IP2)
- Docker (containerized deployment)

**Design System (`packages/ui`):**

- Shared component library — consumed by Web (v1) and Chrome Extension (v2)
- Tailwind CSS + Radix UI
- Storybook (component development & documentation — DS only)

**Chrome Extension (v2):**

- Language: TypeScript
- Build tool: Vite + @crxjs/vite-plugin (auto-reload in dev mode)
- UI: React (popup) — consumes `packages/ui` design system
- Supported job boards: LinkedIn, Jack, RemoteYeah

**Testing:**

- Vitest (unit and integration tests across all services)

**Observability & Analytics:**

- Sentry.io (error tracking — all services)
- Grafana (unified dashboards — goals from RDS, infrastructure metrics from CloudWatch)
- AWS CloudWatch (infrastructure monitoring — EC2 CPU/RAM, RDS metrics, request volume)
- PostHog (event tracking & user behavior — UI interactions, funnels, session replay, retention, feature flags; Web in v1, Chrome Extension in v2)

**Infrastructure (IP1 — low traffic):**

- Vercel (Next.js hosting)
- EC2 t3.micro (NestJS via Docker)
- RDS PostgreSQL db.t3.micro
- CloudFront (CDN + SSL)
- ACM (SSL certificates)
- SSM Parameter Store (secrets & env vars)
- AWS Budgets (cost alerts)
- Cloudflare DNS

**Infrastructure (IP2 — scale):**

- ECS Fargate (Next.js + NestJS — replaces Vercel + EC2)
- ALB (load balancing)
- RDS PostgreSQL db.t3.small Multi-AZ
- ElastiCache Redis
- CloudFront
- Cloudflare DNS

---

## Non-Functional Requirements

**Performance**
- API response time: p95 < 500ms
- Web page load: LCP < 2.5s (Core Web Vitals standard)
- GraphQL queries must avoid N+1 patterns (use DataLoader where applicable)

**Security**
- Security review mandatory before closing any feature — no exceptions
- HTTPS enforced in all environments
- JWT access token expiry: 15 minutes; refresh token expiry: 7 days
- No sensitive data stored in localStorage — use httpOnly cookies for refresh token
- Input validation on all API endpoints (NestJS class-validator)

**Accessibility**
- WCAG 2.1 Level A compliance — Web (v1), Chrome Extension (v2)

**Availability**
- Best-effort uptime on single EC2 instance — no redundancy, planned downtime acceptable
- Availability is secondary to cost and simplicity at current scale

**Browser Support**
- Primary: Chrome (latest 2 major versions)
- Secondary: Safari (latest 2 major versions)

**Database Backup**
- Automated daily backups via RDS (7-day retention)
- Manual snapshot required before every production migration

**Test Coverage**
- Minimum: 70% across all services (enforced in CI)

---

## Constraints

- Single-developer project
- **Vercel lock-in prevention** — must not be used to keep Next.js portable for future ECS migration:
  - `runtime: 'edge'` — Vercel-specific
  - Vercel KV, Vercel Blob, Vercel Postgres — use RDS and SSM instead
  - Vercel Analytics — use PostHog instead
  - Vercel AI SDK — use provider SDKs directly (e.g. OpenAI SDK)
  - API Routes and Server Actions — excluded by architecture (UI only)
