---
status: completed
title: "Extension client update"
type: extension
complexity: low
dependencies: [task_03]
completed: 2026-05-24
---

# Task 05: Extension client update

## Overview

Extension import passes `autoFill: true` on draft create and opens job detail without query param.

<requirements>
- MUST update `createDraftCaptureJob` / `ApiService` to include `autoFill: true`
- MUST open `${WEB_URL}/jobs/${id}` without `?autoConvert=true`
- Backend gates on `autoFillEnabled` — extension does not need settings query
</requirements>

## Success Criteria

- `import-job.service.ts` has no `autoConvert` query string
- Import still triggers fill when user setting is on
