# Conventions

## 1) Controllable component state

Use `apps/web/src/modules/applications/shared/hooks/useControllableState.ts` whenever a component can be used in both controlled and uncontrolled modes (i.e., it supports `value` + `onChange` and also a local `defaultValue` fallback).

## 2) Dialogs in dedicated files

Implement dialogs in dedicated component files instead of inline definitions inside page/panel components. This keeps dialog context isolated and allows reuse when the same flow is needed in other screens.

## 3) `aiActions` should be inline literals

When passing `aiActions` to `TipTapEditor`, prefer a literal array directly in props (for example, `aiActions={[actionA, actionB]}`) instead of creating a separate `const` variable used only for that prop.

## 4) Refresh list views after create/delete mutations

When a mutation creates or deletes list-backed entities (for example, applications or companies), always refetch the corresponding list query and set `awaitRefetchQueries: true` so the list is updated before success flows continue (toast, dialog close, or redirect).
