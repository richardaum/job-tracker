# Conventions

## 1) Controllable component state

Use `apps/web/src/modules/applications/shared/hooks/useControllableState.ts` whenever a component can be used in both controlled and uncontrolled modes (i.e., it supports `value` + `onChange` and also a local `defaultValue` fallback).

## 2) Dialogs in dedicated files

Implement dialogs in dedicated component files instead of inline definitions inside page/panel components. This keeps dialog context isolated and allows reuse when the same flow is needed in other screens.
