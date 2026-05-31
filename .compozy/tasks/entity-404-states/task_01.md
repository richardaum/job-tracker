---
id: T-01
title: Create EntityNotFound component
status: pending
type: frontend
depends_on: []
---

# T-01: Create EntityNotFound component

## Scope

Create the reusable `EntityNotFound` component and barrel export under `apps/web/src/components/entity-not-found/`.

## Implementation

### 1. Create `EntityNotFound.tsx`

**Path:** `apps/web/src/components/entity-not-found/EntityNotFound.tsx`

```tsx
import Link from "next/link";

import type { HeadingProps } from "@job-tracker/ui";
import { Heading } from "@job-tracker/ui";
import { cn } from "@/lib/utils";

type EntityNotFoundProps = {
  resource: string;
  backHref: string;
  backLabel: string;
};

export function EntityNotFound({ resource, backHref, backLabel }: EntityNotFoundProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12")}>
      <Heading level="h2">{resource} not found</Heading>
      <p className={cn("max-w-md text-center text-sm text-text-secondary")}>
        The {resource} was not found or you don&apos;t have access to it. Please try again or
        contact support.
      </p>
      <Link
        href={backHref}
        className={cn("text-sm text-text-secondary underline-offset-2 hover:underline")}
      >
        {backLabel}
      </Link>
    </div>
  );
}
```

### 2. Create barrel export

**Path:** `apps/web/src/components/entity-not-found/index.ts`

```ts
export { EntityNotFound } from "./EntityNotFound";
```

## Verification

- [ ] `pnpm typecheck` passes
- [ ] Component renders without errors in isolation
