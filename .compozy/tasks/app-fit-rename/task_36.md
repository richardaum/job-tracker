---
status: pending
title: "Verify Phase 2 — no Fit remnants + full validation"
type: refactor
complexity: high
dependencies: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
---

# Task 36: Verify Phase 2 — no Fit remnants + full validation

## Script: `scripts/verify-rename-match.sh`

```bash
#!/bin/bash
set -e
EXCLUDE="node_modules|.git|dist|.next|.turbo|gql/|scripts/verify|benefit|profile|outfit|profit|retrofit"

echo "=== Checking residual 'Fit' standalone ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bFit\b' apps/ packages/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES occurrences of 'Fit' still exist"
  grep -rn '\bFit\b' apps/ packages/ --include='*.ts' --include='*.tsx' | grep -vE "$EXCLUDE"
  exit 1
fi

echo "=== Checking residual 'fit' standalone ==="
MATCHES=$(grep -r --include='*.ts' --include='*.tsx' --include='*.gql' --include='*.graphql' \
  '\bfit\b' apps/ packages/ 2>/dev/null | grep -vE "$EXCLUDE" | wc -l)
if [ "$MATCHES" -gt 0 ]; then
  echo "FAIL: $MATCHES occurrences of 'fit' still exist"
  exit 1
fi

echo "PASS: No Fit remnants found"
```

## Full validation pipeline

```bash
# 1. Codegen web — ensure schema is synced
pnpm --filter @job-tracker/web run codegen

# 2. Import sorting
pnpm fix:imports

# 3. Lint + Format + Typecheck
pnpm lint
pnpm format
pnpm typecheck

# 4. Tests
pnpm test

# 5. Rename verification scripts
bash scripts/verify-rename-job.sh
bash scripts/verify-rename-match.sh

# 6. Dead code check
pnpm knip

# 7. E2E (if available)
pnpm e2e
```

## Success criteria

- [ ] `pnpm typecheck` passes (api, web, extension, ui)
- [ ] `pnpm test` passes
- [ ] `pnpm lint` no new warnings
- [ ] Verification scripts return zero matches for `Application` and `Fit`
- [ ] Codegen web generates hooks with new names
- [ ] `pnpm knip` no new dead code
- [ ] PM2/Docker logs no new errors
