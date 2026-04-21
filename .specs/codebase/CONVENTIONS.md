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

## TLC-SDD Completion Protocol (Mandatory)

- Never mark a task as done based only on green aggregate gates (`pnpm test`, `pnpm build`).
- Before changing any task status to done, verify all `Where` artifacts exist exactly as declared in `tasks.md`.
- A task is done only when all three are true:
  1. **Artifacts**: required files/symbols exist and match the task contract.
  2. **Behavior**: `Done when` conditions are demonstrably satisfied.
  3. **Gate**: task gate command passes in the expected context.
- If any artifact is missing, keep task status as pending/in progress, even if workspace tests pass.
- When a gate depends on a running service (for example Storybook), record the required precondition in the task verification note.
- Update `STATE.md` only after artifact-level verification is complete.
