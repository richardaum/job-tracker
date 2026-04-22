---
name: Project Stack & Architecture
description: Tech stack, monorepo structure, and architectural decisions for job-tracker
type: project
originSessionId: f020755f-42ad-4ffd-aa8a-04d8651f02e6
---

Monorepo pnpm com três workspaces principais:

- `apps/web` — Next.js 15, UI only (sem API routes/Server Actions), Apollo Client, Zustand, GraphQL Code Generator
- `apps/api` — NestJS, PostgreSQL, Drizzle ORM, Apollo Server (GraphQL code-first), Google OAuth, OpenAI SDK
- `packages/ui` — Design system compartilhado, Tailwind + Radix UI, Storybook

**Why:** Separação clara entre web e api permite migração futura de Vercel para ECS sem lock-in.

**How to apply:** Nunca usar API Routes ou Server Actions no Next.js. OpenAI só via `AiService` facade. Vitest para todos os testes. Evitar qualquer dependência de Vercel-specific (KV, Blob, Analytics, Edge runtime).
