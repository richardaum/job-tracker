---
status: in_progress
created: 2026-05-07
priority: medium
tags:
  - web
  - applications
  - ai
created_at: 2026-05-07T14:56:00.000000Z
updated_at: 2026-05-07T18:26:00.000000Z
---

# Technical Scope: ai-application-create-v2

> **Status**: in_progress · **Priority**: medium · **Created**: 2026-05-07

## Spec

- [T-1] Introduce `AiApplicationCreatePageV2` in `apps/web/src/modules/applications/create-ai/page/` and use it as the route entrypoint for `/applications/new/ai` while the legacy page is phased out.
- [T-2] Implement a functional paste-capture list in `AiApplicationCreatePageV2`: each distinct paste event while the page is focused creates a new list item at the top with icon + preview: primary `lineOne` single-line clamp; secondary `lineTwo` up to **two** visible lines (`line-clamp-2`) (duplicate payloads skipped per [T-5]).
- [T-3] Extract paste capture orchestration into a domain hook (e.g. `usePasteCapture`) scoped to `create-ai/page` context, reducing page-level effect complexity and improving unit testability via dependency injection for time/id generation.
- [T-4] Extract pure text preview formatting (`splitPreviewLines`) to a local utility module in the same context, preserving UI behavior while isolating agnostic string transformation logic for focused tests and reuse.
- [T-5] Skip adding a paste when its text duplicates any existing list entry after shared normalization (strip `\r`, trim); implement as a pure helper module (e.g. `pasteTextDedupe`) consumed by `usePasteCapture`, not ad hoc logic in the page.
- [T-6] When a duplicate paste is detected and skipped, show a non-blocking info toast in `AiApplicationCreatePageV2` to inform the user that the pasted content already exists in the list.
- [T-7] Redesign the shared `Toast` component in `packages/ui` for app-wide usage quality: viewport at top-right, reduced internal padding, neutral visual surface with intent accent only, explicit visual duration progress, close (`X`) control visually aligned with leading content/icon row, and support for multi-toast stacking/queue rendering consumed by web pages.
- [T-8] For each captured paste item in `AiApplicationCreatePageV2`, display a compact source badge that distinguishes clipboard payload kind as `HTML` when `text/html` content is present, otherwise `Plain text`.
- [T-9] Treat pasted content as potentially unstructured/noisy job-ad text: preview shaping must ignore common section-header noise (e.g., `Responsibilities:`, `Requirements:`) and dedupe normalization must be resilient to casing and whitespace-only differences so repeated semantic payloads are skipped consistently.

## Modus Operandi

Follow repository-wide extraction guidance in `docs/CONVENTIONS.mdx` under **Web application patterns → New implementation extraction M.O.**

For this spec, apply that M.O. to split page-level responsibilities into:

- UI composition (`AiApplicationCreatePageV2`).
- Paste orchestration hook (`usePasteCapture`).
- Pure text shaping (`splitPreviewLines`) and dedupe policy (`pasteTextDedupe`).
- Shared notification rendering (`Toast`) separated from page event orchestration via a dedicated toast-queue hook (`useToastQueue`) backed by a top-level app provider/host so page components avoid owning local toast queue state directly.
