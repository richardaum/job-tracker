# PRD: Export Job as Markdown

## Overview

Users need a way to export a job listing from the Job Details page as a Markdown file. Markdown is a universal, human-readable format that works everywhere — LLMs, note-taking apps (Obsidian, Notion), documentation, version control, and plain-text editors. Currently, the only export available is PDF of the description editor.

This feature adds one item to the existing Actions dropdown: "Export as Markdown". One click, one `.md` file download with all job data.

## Goals

- Allow users to download a complete job record as a portable Markdown file
- Zero new backend infrastructure — purely client-side generation
- Follow existing UI patterns (Actions dropdown, ContextSlot)
- Deliver in a single implementation pass

## User Stories

- As a job seeker, I want to export a job to my Obsidian vault so I can track it alongside my other notes.
- As a power user, I want to feed a job listing into an LLM context by dragging in a `.md` file instead of copy-pasting from the browser.
- As a user, I want a single-click export without navigating away from the job details page.

## Core Features

### Export as Markdown (single feature)

- **Trigger**: "Export as Markdown" item in the Actions dropdown on the Job Details page.
- **Data included**: title, company, description, URLs, source, salary, tags, location, work region, current stage, summary, notes, stage events (full history), source content (`htmlContent`), match analysis.
- **Output format**: Clean, readable Markdown with headings per section (Job, Description, Notes, Stage History, Match Analysis).
- **Delivery**: Immediate browser download via `Blob` + `URL.createObjectURL`.
- **File name**: Slugified `{title}-{company}.md` or `job-{id}.md` when title/company are empty.
- **Loading state**: Menu item shows a brief loading state while data is gathered.

### Non-Features (intentionally excluded)

- No preview dialog — download is immediate.
- No format customization — one opinionated template.
- No scheduled/email export.
- No bulk export from the job list.

## User Experience

1. User is on the Job Details page (any tab).
2. User clicks "Actions" in the page header.
3. Dropdown opens with the existing items + a new "Export as Markdown" item.
4. User clicks "Export as Markdown".
5. A brief loading state appears. The browser downloads `{title}-{company}.md`.
6. User opens the file in any text editor, note-taking app, or LLM chat.

The MD structure:

```
# {Job Title}

**Company**: {Company Name}
**Location**: {Location}
**Stage**: {Current Stage}
**URL**: {url}
**Salary**: {salary range}
**Tags**: {tag1, tag2, ...}
**Created**: {date}

## Summary

{AI summary}

## Description

{job description}

## Source Content

{original HTML/page content}

## Notes

### {date} — Note title
{note content}

## Stage History

- **{date}** — Applied → Screening
- **{date}** — Screening → Interview

## Match Analysis

{score, classification, match/gap/unclear data}
```

## Non-Goals (Out of Scope)

- Export from the job list page (bulk export).
- Custom template selection.
- Export to PDF/JSON/CSV.
- Server-side generation or API endpoint.
- Drag-and-drop export.

## Phased Rollout Plan

### MVP (Phase 1)

- "Export as Markdown" item in Actions dropdown.
- Client-side generation from fetched GraphQL data.
- Covers all core fields (job, notes, stage events, match).

No further phases needed — this is a self-contained feature.

## Success Metrics

- Feature works correctly: exported `.md` opens in any text editor.
- All job fields are present in the output (verified by QA or code review).
- No increase in API errors or timeouts (single additional query batch on click).

## Risks and Mitigations

- **Slow export on large jobs**: Notes and stage events add a slight delay. Mitigation: show loading state, keep it asynchronous.
- **File name collisions**: If two jobs have the same title, the second download appends `(1)` or timestamp. Accepted OS-level behavior.

## Architecture Decision Records

- [ADR-001: Direct Markdown Export from Actions Dropdown](adrs/adr-001.md) — One-click download from Actions dropdown, client-side generation, no preview dialog.

## Open Questions

None at this stage. All scope decisions have been made.
