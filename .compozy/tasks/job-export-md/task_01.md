---
status: completed
title: "Utility functions: Markdown generation and download"
type: web
complexity: low
dependencies: []
---

# Task 01: Utility functions: Markdown generation and download

## Overview

Create pure utility functions that format job data (including notes and stage events) as a clean Markdown string and trigger a browser download. These are the building blocks for the export feature, testable in isolation without any React or Apollo dependencies.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST export `formatJobAsMarkdown(data): string` that takes job, notes, and stage events
- MUST export `downloadMarkdown(content, filename): void` that triggers browser download via Blob
- MUST export `slugifyFileName(title, company, id): string` for safe file names
- MUST handle null/missing fields gracefully (skip section or show "N/A")
- MUST NOT have any React or Apollo dependencies
- MUST be importable by both the component and unit tests
</requirements>

## Subtasks

- [x] 01.1 Implement `slugifyFileName()` — lowercase, replace spaces/special chars, fallback to `job-{id}`
- [x] 01.2 Implement `formatJobAsMarkdown()` — iterate over job fields, notes, stage events, produce structured MD
- [x] 01.3 Implement `downloadMarkdown()` — create Blob, object URL, trigger click, revoke URL
- [x] 01.4 Write unit tests for all three functions

## Implementation Details

Create file `apps/web/src/modules/jobs/details/utils/export-job-md.ts`.

The Markdown structure defined in the PRD:

- H1 with job title
- Key-value table for metadata (Company, Location, Stage, URL, Salary, Tags, Created)
- ## Summary section (if summary exists)
- ## Description section (if description exists)
- ## Source Content section (if htmlContent exists)
- ## Notes section (iterate notes, each as H3 with date)
- ## Stage History section (unordered list with date + transition)
- ## Match Analysis section (if match exists)

### Relevant Files

- `apps/web/src/modules/jobs/details/utils/export-job-md.ts` — file to create
- `apps/web/src/modules/jobs/details/utils/job-details.shared.ts` — reference for existing utils pattern

### Dependent Files

- `apps/web/src/modules/jobs/details/components/ExportJobMdMenuItem.tsx` — will import from this utility

### Related ADRs

- [ADR-001: Direct Markdown Export from Actions Dropdown](../adrs/adr-001.md) — Defines the export as client-side, no preview dialog

## Deliverables

- `apps/web/src/modules/jobs/details/utils/export-job-md.ts` with three exported functions
- Unit tests with 80%+ coverage **(REQUIRED)**

## Tests

- Unit tests:
  - [ ] `formatJobAsMarkdown()` with full data returns well-structured Markdown with all sections
  - [ ] `formatJobAsMarkdown()` with null/missing fields omits or marks sections as N/A
  - [ ] `formatJobAsMarkdown()` with empty notes/events array omits those sections
  - [ ] `slugifyFileName()` with normal title returns kebab-case `.md`
  - [ ] `slugifyFileName()` with special characters strips/escapes them safely
  - [ ] `slugifyFileName()` with null title falls back to `job-{id}.md`
  - [ ] `downloadMarkdown()` creates a Blob with correct MIME type `text/markdown`
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage >=80%
- Functions exported and importable without React/Apollo
