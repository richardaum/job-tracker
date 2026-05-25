---
status: completed
title: "Web client (paste, remove query param)"
type: frontend
complexity: medium
dependencies: [task_03]
completed: 2026-05-24
---

# Task 04: Web client (paste, remove query param)

## Overview

Wire web clients to pass `autoFill` on draft create, default paste checkbox from settings, remove `?autoConvert=true` flow.

<requirements>
- MUST pass `autoFill` from paste dialog checkbox in `createDraftCaptureJob` mutation
- MUST default checkbox to `settings.autoFillEnabled` via `useSettingsQuery`
- MUST navigate to `/jobs/{id}` without query param
- MUST delete `useJobAutoFillFromQuery.ts` and remove usage from `JobDetailsLayout`
- MUST update related unit tests (`PasteDestinationDialog`, `JobDetailsLayout`, `PasteListenerProvider`)
</requirements>

## Success Criteria

- No references to `autoConvert` or `useJobAutoFillFromQuery` in web app
- Manual "Fill automatically" button still works
