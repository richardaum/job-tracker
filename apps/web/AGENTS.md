<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16 + Apollo Client. Generated hooks in `src/gql/hooks`.

## Dev

- PM2: **web** process
- Codegen: `pnpm --filter @job-tracker/web run codegen` → `src/gql/`

## Tests

Vitest, `src/**/*.test.{ts,tsx}`, jsdom. 80% coverage on `src/app/page.tsx`, `src/hooks/**`, `src/env/client.ts`, `src/lib/make-apollo-client.ts`.

## View models

GraphQL screens use view-model hooks (`apps/web/src/modules/<domain>/<area>/hooks/use<Name>ViewModel.ts`). Keep rendering thin.

## GraphQL

Prefer generated hooks from `@/gql/hooks`. Delete mutations: use `removeDeletedEntityFromListCache`.

## Patterns

- `className` via `cn()` only
- No raw `process.env` — use `src/env/`
