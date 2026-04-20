# Codebase Conventions

## Environment Variables

- **Never access `process.env` directly** in application code.
- All env vars must be declared and validated in the app's `env/server.ts` (or `env/client.ts` for public vars) using Zod, then imported from there.
- `server-only` is applied to server env modules to prevent accidental use in Client Components.

**Wrong:**

```ts
const url = process.env.DATABASE_URL;
```

**Right:**

```ts
import { serverEnv } from "@/env/server";
const url = serverEnv.DATABASE_URL;
```

> See `.specs/quick/002-env-validation-zod-server-only/SUMMARY.md` for the full rationale and setup.
