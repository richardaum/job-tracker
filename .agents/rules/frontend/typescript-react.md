# TypeScript and React

## Imports

- Prefer `@/…` (or package root alias) over `../` traversals
- Avoid inline type-only imports like `Foo<import("@/path").Bar>`. Use top-of-file `import type { Bar } from "@/path"`.
- Inline `import("...")` types are harder to read, grep, and refactor.

## Async errors

Prefer `tryRun(...)` from `@job-tracker/try-run` over wrapping async flows in `try/catch` when behavior is equivalent:
```ts
const [error, data] = await tryRun(promise)
```

Keep `try/catch` where language-level control flow is required (finally, synchronous exceptions, framework boundaries).

## Reexports

Avoid files that only forward symbols (`export { x } from './x'`, barrel files). Import from the module that declares the export. Exception: deliberate public entrypoints (package `index.ts`, module boundary façades).

## Named types

Prefer a top-level `type` or `interface` over inline anonymous shapes in parameters, props, and return types when the object is non-trivial or reused. Primitives, simple utilities (`Record<string, string>`), and one-off literals can stay inline.

## Prop naming

Name component props after the behavior they control or report, not the caller's reason for using that behavior. This keeps component APIs reusable and decoupled from a specific product flow.

```tsx
// ✗ BAD — describes why this caller wants the dialog closed
<Dialog shouldCloseAfterApplication={isSubmitted} />

// ✓ GOOD — describes the dialog behavior
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
```

For callbacks, use the same rule: prefer an outcome such as `onOpenChange`, `onDismiss`, or `onValueChange` over a flow-specific intent such as `onApplicationSubmitted` when the component only needs to react to the outcome.

## Nova convention

Module-level regular functions belong in the lower part of the file: below imports, top-level types, constants, and the primary exported surface (components, hooks, classes, etc.).

## cn() / className

Use `cn()` for className construction. No raw string concatenation.

## Type assertions

Avoid using `as` (type assertions / casting) to work around type mismatches. Prefer adjusting the actual types at the source (interfaces, zod schemas, AI prompts, database enums) so the whole chain stays consistent. When a type mismatch reveals a design decision (e.g. changing an AI prompt contract), ask the user before proceeding.

```ts
// ✗ BAD — hides the mismatch, causes runtime errors, breaks refactoring
verdict: i.verdict as MatchVerdictEnum,

// ✓ GOOD — fix the zod schema + AI prompt so output type matches enum
verdict: z.nativeEnum(MatchVerdictEnum),
```

- Avoid unnecessary `useMemo` and `useCallback`. Prefer plain `const` derivations and direct closures. Add memoization only for expensive work, documented reference-stability contracts, or lint/compiler requirements.
- Do not use `forwardRef`. Pass `ref` as a normal prop; UI components use `ref?: React.Ref<T>` on the props type.
