# JT-SPECS Workflow

This file defines the canonical TLC documentation contract for this repository.

## Keyword

`JT-SPECS`

When this keyword appears in a prompt, it means all rules in this document are mandatory.

## Canonical `.specs` Structure

Only these top-level folders are allowed:

- `project/`
- `features/`
- `tech/`
- `memory/`

## Classification Rules

- Use `features/` for user-facing application capabilities.
- Use `tech/` for technical/codebase concerns (design system, architecture, infrastructure, security, testing, libraries, tooling, reliability).
- Use `project/` for product scope, roadmap, and active state.
- Use `memory/` for persistent learnings (gotchas, patterns, feedback).

## Forbidden Structures

- No legacy `quick` root inside `.specs`.
- No root-level `codebase` folder inside `.specs` (it must live under `tech/`).
- No separate TLC memory root outside `.specs/memory`.

## Naming Policy

All directories and files under `.specs/` must use lowercase kebab-case.

Examples:

- `state.md`
- `platform-reliability-hardening`
- `env-validation-zod-server-only`

## Execution Checklist

Before implementation:

1. Declare whether the work is `feature` or `tech`.
2. Show the final target path(s) for new/moved files.

After implementation:

1. Confirm no legacy roots were introduced (`quick`, root `codebase`, external memory root).
2. Confirm lowercase kebab-case compliance.
3. Confirm internal links point to current paths.
