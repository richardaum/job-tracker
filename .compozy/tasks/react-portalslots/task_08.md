---
status: completed
title: Add AGENTS.md keyword index entry
type: docs
complexity: low
dependencies:
  - task_07
---

# Task 08: Add AGENTS.md keyword index entry

## Overview

Add a single row to the root `AGENTS.md` keyword index so agents discover the new header actions / portal slot convention in `web-ui.md` without reading the full rules file.

<critical>
- ALWAYS READ the PRD before starting
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — one table row only
- TESTS REQUIRED — N/A
</critical>

<requirements>
- MUST add one row to the Keyword index table in root `AGENTS.md`
- MUST map triggers such as `portal slot`, `header actions`, `react-portalslots` to `web-ui.md`
- SHOULD place row near other `web-ui.md` entries (e.g. after `detail page`, `Tabs`)
- MUST NOT duplicate the full convention text — index only
</requirements>

## Subtasks

- [x] 8.1 Add keyword index row linking to `web-ui.md`
- [x] 8.2 Verify table formatting matches existing rows

## Implementation Details

Example row (adapt to table column width):

| `portal slot`, `header actions`, `react-portalslots`, nested tab header | `web-ui.md` |

Insert in `AGENTS.md` keyword index section (~line 65, near `detail page`, `Tabs`).

### Relevant Files

- `AGENTS.md` — keyword index table

### Dependent Files

- `.agents/rules/frontend/web-ui.md` — section added in task 07

## Deliverables

- One new keyword index row in `AGENTS.md`

## Tests

### Unit Tests

- [x] N/A

### Integration Tests

- [x] Keyword grep in AGENTS.md finds new triggers

## Success Criteria

- Agents searching "portal slot" or "header actions" are routed to `web-ui.md`
- Optional task complete — may skip if team prefers index-only-in-web-ui
