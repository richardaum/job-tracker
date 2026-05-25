---
status: completed
title: "E2E + FEATURE_MAP"
type: qa
complexity: low
dependencies: [task_04, task_05]
completed: 2026-05-24
---

# Task 06: E2E + FEATURE_MAP

## Overview

Update e2e and docs to reflect server-side auto-fill; remove auto-convert query param references.

<requirements>
- MUST update `apps/web/e2e/draft-conversion.spec.ts` for server-side fill (no `?autoConvert`)
- MUST update `docs/FEATURE_MAP.md` auto-convert entry
- SHOULD verify profile settings e2e still passes
</requirements>

## Success Criteria

- E2E draft conversion passes with backend-gated fill
- FEATURE_MAP describes server-side auto-fill on create
