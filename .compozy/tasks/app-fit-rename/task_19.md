---
status: pending
title: "Verify Phase 1 — no Application remnants + full validation"
type: refactor
complexity: high
dependencies:
  [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18]
---

# Task 19: Verify Phase 1 — no Application remnants

## Script: `scripts/verify-rename-job.sh`

```bash
#!/bin/bash
set -e
EXCLUDE="node_modules|.git|dist|.next|.turbo|gql/|scripts/verify-rename"

# Must return ZERO matches
echo "=== Checking residual 'Application' ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bApplication\b' apps/ packages/ specs/ docs/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES occurrences of 'Application' still exist"
  grep -rn '\bApplication\b' apps/ packages/ specs/ docs/ --include='*.ts' --include='*.tsx' | grep -vE "$EXCLUDE"
  exit 1
fi

echo "=== Checking residual 'application' ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bapplication\b' apps/ packages/ specs/ docs/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES occurrences of 'application' still exist"
  exit 1
fi

echo "PASS: No Application remnants found"
```

## Post-verification

```bash
pnpm fix:imports
pnpm lint
pnpm format
pnpm typecheck
pnpm test
```

## Criteria

- [ ] `pnpm typecheck` passes (api, web, extension, ui)
- [ ] `pnpm test` passes
- [ ] `pnpm lint` no new warnings
- [ ] `scripts/verify-rename-job.sh` returns zero matches
- [ ] Codegen web generates hooks with new names
- [ ] PM2/Docker logs no new errors
