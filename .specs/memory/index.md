# Specs Memory Index

This folder is the single source of persistent TLC memory for the project.

## Gotchas

- `gotchas/next-distdir-next-env-churn.md` - `next-env.d.ts` path can switch between `.next` and `.next-dev`.
- `gotchas/next-rsc-ui-barrel-imports.md` - avoid `@job-tracker/ui` barrel imports in Next server component contexts when utility-only imports are needed.
- `gotchas/playwright-auth-and-port.md` - Playwright auth expectations and `E2E_PORT` guidance.
- `gotchas/radix-overlay-testing-jsdom.md` - Radix overlay testing pitfalls in Vitest/JSDOM.
- `gotchas/storybook-test-runner-tokens.md` - intermittent Storybook token story issue context.
- `gotchas/web-app-design-system-global-css.md` - app-level global CSS import requirement for token utility classes.

## Patterns

- `patterns/component-local-defaults-with-semantic-tokens.md` - keep component defaults local while using semantic tokens.

## Feedback

- `feedback-language.md` - TLC docs must stay in English.
- `feedback-review-before-commit.md` - always show changes before committing.
- `feedback-use-components-by-behavior.md` - prefer DS behavioral components (for example `Stack`) over raw layout divs.
