# Quick Task 003: Summary

**Status:** Done
**Commit:** _see below_

## What Was Done

- Installed OrbStack via `brew install orbstack` as the Docker runtime
- Discovered and fixed 3 bugs in `apps/api/Dockerfile`:
  1. **Wrong build context** — gate command was `docker build ./apps/api` (build context = apps/api only); fixed to `docker build -f apps/api/Dockerfile .` (build context = monorepo root, required for COPY of root manifests)
  2. **husky in production install** — `pnpm install --prod` triggered the `prepare` script which calls `husky`; fixed with `--ignore-scripts`
  3. **pnpm workspace .bin symlinks in Docker** — `nest build` relies on `.bin/nest` wrapper scripts that pnpm generates with workspace-local hardcoded paths; these don't resolve in Docker regardless of linker mode; fixed by compiling directly with `tsc -p tsconfig.build.json` (equivalent for projects without `nest-cli.json`)

## Files Changed

- `apps/api/Dockerfile` — 3 fixes (correct build context flag in gate, --ignore-scripts for prod install, tsc instead of nest build)
- `.specs/features/project-setup/tasks.md` — T10 marked ✅
- `.specs/project/STATE.md` — quick task entry + lesson learned added

## Verification

- [x] `docker --version` returns Docker version 28.5.2
- [x] `docker build -t job-tracker-api -f apps/api/Dockerfile .` exits 0
- [x] T10 done-when checkboxes confirmed

## Lessons Learned

pnpm workspace `.bin` wrapper scripts hardcode workspace-local absolute paths (e.g. `/app/apps/api/node_modules/@nestjs/cli/bin/nest.js`) regardless of `shamefully-hoist` or `node-linker=hoisted`. These paths don't exist in Docker since pnpm uses symlinks or a virtual store. Solution: compile NestJS with `tsc` directly (or move `@nestjs/cli` to the root workspace). See LL-007 in STATE.md.
