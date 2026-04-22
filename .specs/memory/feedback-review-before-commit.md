---
name: Always show changes for review before committing
description: Never auto-commit after implementation — show diff/files and wait for user approval first
type: feedback
originSessionId: 91b741b0-2825-4b82-bca7-e765fe18642d
---

After implementing any task, show the produced files/diff to the user and wait for explicit approval before running `git commit`.

**Why:** User wants to review each change before it lands in git history. Auto-committing removes their ability to catch issues early.

**How to apply:** After every implementation step (including sub-agent output): read + display the produced files, summarize what changed, then ask "looks good to commit?" or equivalent. Only run `git commit` after the user confirms.
