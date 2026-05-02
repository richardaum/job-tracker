---
status: planned
created: "2026-05-02"
priority: low
tags:
  - technical
  - development-only
---

# Technical scope: API dev authentication bypass

**Retroactive spec:** behaviour below is already implemented in **`apps/api`**; this document records intent and boundaries for ongoing maintenance.

## TL;DR

- **`AUTH_BYPASS_ENABLED`** (**[T-139]**) on the API (**`apps/api`**) skips the interactive **Google OAuth** dance for **`GET /auth/google`** / **`GET /auth/google/callback`** by resolving a fixed **development user** keyed by **`DEV_AUTH_BYPASS_EMAIL`** (**[T-140]**).
- After that shortcut, the API still issues **normal HTTP-only JWT cookies** via **`finishLogin`** (same cookie contract as production Google sign-in).
- **Protected GraphQL** and **GraphQL-over-SSE** attach the session **only from a validated `access_token` cookie** ( **`JwtStrategy`** / **`JwtAuthGuard`** , **`GraphqlSseAuthService`** ) — **no** implicit bypass there — so **`POST /auth/logout`** (**[T-141]**) clears cookies and yields an anonymous client for **`me`** and other guarded operations.

## Problem

Local development depends on Google OAuth configuration and interactive consent. Engineers need a voluntary, explicit escape hatch **without changing production auth semantics** once cookies exist.

Previously, widening bypass to JWT-protected surfaces broke **logout**: the web shell cleared cookies while GraphQL still behaved as authenticated.

## Objectives

- [P-125] Optionally accelerate **local-only** login by skipping Google when **`AUTH_BYPASS_ENABLED=true`**, while keeping **JWT session** and **logout** behavior faithful to production.

## Requirements

### Product / UX (developer ergonomics)

- [P-125] With bypass enabled, a developer may complete “login” via **`GET /auth/google`** (and callback path) **without** an external OAuth round-trip, landing on the configured web **`/login`** redirect with **`returnTo`** unchanged from existing **`getSafeReturnTo`** rules (**`apps/api`** **`AuthController`**).

### Technical

- [T-139] Expose typed server env **`AUTH_BYPASS_ENABLED`** (boolean, default **false**) and **`DEV_AUTH_BYPASS_EMAIL`** (email, configurable default) in **`apps/api/src/env/server.ts`** (Zod-validated **`serverEnvSchema`**).
- [T-140] When **[T-139]** is true, **`DevAuthBypassService`** resolves **or provisions** the bypass user (**`findByEmail`** → else **`findOrCreateFromGoogle`** with a deterministic dev **`googleId`**) and logs a **one-shot** **`Logger.warn`** on first enable observation. **`GoogleAuthGuard`** substitutes **`passport-google`** activation for attaching that user to **`request.user`** (`{ id }` shape consumed by **`AuthController.finishLogin`**).
- [T-141] **`JwtAuthGuard`** must **always** authenticate via Passport **JWT** (cookie **`access_token`** and/or Bearer), independent of **[T-139]**. **`GraphqlSseAuthService.attachUser`** must verify **`access_token`** with **`AuthService.verifyAccessToken`** and **must not** impersonate bypass user without a token. **`POST /auth/logout`** clearing **`access_token`** and **`refresh_token`** therefore yields **unauthenticated** GraphQL **`me`** and SSE until the developer signs in again (including via bypassed **`/auth/google`**).

## Operational guardrails

- **`AUTH_BYPASS_ENABLED`** MUST remain **false** in staging and production deployments; **`AUTH_BYPASS_ENABLED=true`** MUST NOT ship in externally reachable environments. Operational enforcement lives outside this spec (infra, CI policy, `.env.example` discipline); typed env intentionally allows the flag everywhere so local dotenv overrides stay simple.

## Related specs

- **`specs/001-product-auth-and-application-core/README.md`** — product auth journeys and core session story (production path).
- **`specs/023-product-chrome-extension/README.md`** — extension relies on **`access_token`** (and **`[P-119]`**) for API calls; dev bypass semantics align with **[T-141]** (SSE and GraphQL need real cookies).

## Implementation map (authoritative detail in code)

| Area                   | Primary files                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Env                    | **`apps/api/src/env/server.ts`**                                                                                                                       |
| Bypass user resolution | **`apps/api/src/domains/auth/dev-auth-bypass.service.ts`**                                                                                             |
| Google route shortcut  | **`apps/api/src/domains/auth/google-auth.guard.ts`**, **`apps/api/src/domains/auth/auth.controller.ts`**                                               |
| JWT cookies / logout   | **`apps/api/src/domains/auth/auth.controller.ts`**, **`apps/api/src/domains/auth/jwt.strategy.ts`**, **`apps/api/src/domains/auth/jwt-auth.guard.ts`** |
| SSE session            | **`apps/api/src/domains/extension-channel/graphql-sse-auth.service.ts`**                                                                               |

## Verification (against current **`apps/api`**)

- Bypass **off**: unchanged Google OAuth + JWT behavior.
- Bypass **on**: **`GET /auth/google`** issues cookies via **`finishLogin`** without Google UI; **`POST /auth/logout`** removes cookies and subsequent **`me`** (and SSE using only cookie auth) behaves as **unauthenticated** until login repeats.

Traceability: **[P-125]**, **[T-139]**, **[T-140]**, **[T-141]**.
