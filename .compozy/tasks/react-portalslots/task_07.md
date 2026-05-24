---
status: completed
title: Document header actions convention in web-ui.md
type: docs
complexity: low
dependencies:
  - task_06
---

# Task 07: Document header actions convention in web-ui.md

## Overview

Add a short, actionable section to `.agents/rules/web-ui.md` describing when nested tabs/routes should contribute actions to a shared detail header via `react-portalslots`, and when simpler patterns suffice. This enables Profile and future detail layouts to follow the same convention.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — one minimal example snippet is acceptable
- TESTS REQUIRED — N/A for docs; validate markdown renders and links are correct
</critical>

<requirements>
- MUST add section **"Header actions from nested tabs/routes"** to `.agents/rules/web-ui.md`
- MUST document **When**: shared layout + child tab/route owns header actions
- MUST document **How**: `react-portalslots`, co-located `*.slots.ts`, `PortalSlotsProvider` in layout, slot fill in tab content
- MUST document **When not**: Radix overlays (dialogs/popovers), simple inline `trailing={...}` on same component
- SHOULD reference job details as canonical example: `job-details-header.slots.ts`
- MUST follow existing `web-ui.md` tone and heading style (sentence case, concise bullets)
</requirements>

## Subtasks

- [x] 7.1 Choose placement (under "List and Detail Page Layout" → Detail, or adjacent section)
- [x] 7.2 Write When / How / When not bullets
- [x] 7.3 Link to job details slots file path as reference implementation
- [x] 7.4 Proofread for consistency with PRD Fase 2

## Implementation Details

Suggested section outline:

### Header actions from nested tabs/routes

**When:** Detail layout wraps multiple tabs or nested routes; a child tab needs to place buttons or menu items in the shared header (e.g. Match Generate, Profile tab actions).

**How:**

- Add `react-portalslots` to `@job-tracker/web` (already done for job details)
- Co-locate `*.slots.ts` next to the feature (e.g. `job-details-header.slots.ts`)
- Layout: `PortalSlotsProvider` + `<SomeSlot.Slot />` in header
- Tab/route: wrap contributions in `<SomeSlot>...</SomeSlot>`

**When not:**

- Dialogs, popovers, tooltips — use Radix overlay components
- Actions on the same component as the control — use inline props (`trailing={...}`)

Place after existing Detail layout bullets (~line 64 in current `web-ui.md`).

### Relevant Files

- `.agents/rules/web-ui.md` — add section

### Dependent Files

- `AGENTS.md` — keyword index updated in task 08

## Deliverables

- New section in `web-ui.md` committed-ready
- Convention aligns with implemented job details pattern

## Tests

### Unit Tests

- [x] N/A

### Integration Tests

- [x] Section readable in markdown preview
- [x] File paths cited match actual repo paths post-Fase 1

## Success Criteria

- Developers can find portal slot guidance via `web-ui.md`
- When/not guidance prevents over-use of slots
- All tests passing (unchanged by docs)
