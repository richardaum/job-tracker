# Playwright auth flow and local port gotcha

## Why tests failed

- `apps/web/src/app/page.tsx` redirects `/` to `/applications`.
- Unauthenticated users are then redirected by `apps/web/src/app/(authenticated)/layout.tsx` to `/login`.
- A homepage e2e that expects a dashboard heading will fail unless auth is mocked.

## Do instead

- For anonymous baseline tests, assert `/login` and the `Login` heading.
- For authenticated flows, intercept GraphQL (`Me`, CRUD operations) in the e2e spec and return a mocked user/session.

## Local runner gotcha

- `apps/web/playwright.config.ts` defaults `E2E_PORT` to `3000`.
- If another process is already bound to `3000`, Playwright webServer boot fails with `EADDRINUSE`.

## Do instead

- Run Playwright with an isolated port, e.g. `E2E_PORT=3110 pnpm --filter @job-tracker/web exec playwright test`.
