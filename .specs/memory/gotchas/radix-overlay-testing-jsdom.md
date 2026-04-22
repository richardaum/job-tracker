# Radix overlay tests in JSDOM need ResizeObserver + role-based assertions

## Context

- Scope: `packages/ui` T07 overlay primitives (`Dialog`, `DropdownMenu`, `Tooltip`, `Toast`).
- Command: `pnpm --filter @job-tracker/ui test`.

## Symptom

- `Tooltip` tests can fail in Vitest/JSDOM with `ReferenceError: ResizeObserver is not defined`.
- Radix tooltip content may appear twice for text queries because it renders visible content and an internal accessible node.
- Some Radix interactions are not triggered by plain `click` in tests (menu open is more reliable with pointer events).

## Fix

- Add a `ResizeObserver` mock in `packages/ui/vitest.setup.ts`.
- Prefer role-based assertions for tooltip (`role="tooltip"`) instead of raw text uniqueness.
- For dropdown interactions, use pointer events in tests to mirror Radix open behavior.

## Relevant pointers

- `packages/ui/vitest.setup.ts`
- `packages/ui/src/components/Tooltip/Tooltip.test.tsx`
- `packages/ui/src/components/DropdownMenu/DropdownMenu.test.tsx`
