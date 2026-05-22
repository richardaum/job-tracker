---
status: pending
title: "Rename Fit references in docs"
type: docs
complexity: low
dependencies: [20]
---

# Task 34: Rename Fit references in docs

## Files to update

- `docs/FEATURE_MAP.md` — references to "fit"
- Any other doc files under `docs/` mentioning "fit" in the context of job-fit analysis

## Action

```bash
grep -rn -i "\bfit\b" docs/ --include='*.md' --include='*.mdx'
```

Update all references to Fit Analysis / Fit Score / fit analysis → Match Analysis / Match Score / match analysis.

Be careful to NOT rename:

- `benefit`, `benefits`
- `profile`, `profiles`
- `outfit`
- `fit` as English verb in comments ("does not fit")

## Verification

```bash
pnpm lint
```
