# Quick Task 003: Install OrbStack and verify Docker T10 gate

**Date:** 2026-04-19
**Status:** In Progress

## Description

Install OrbStack as the Docker runtime on macOS and verify the T10 gate (`docker build -t job-tracker-api ./apps/api`) passes.

## Files Changed

- No project source files changed — system tooling install only
- `.specs/features/project-setup/tasks.md` — mark T10 ✅

## Verification

- [ ] `docker --version` returns a valid version
- [ ] `docker build -t job-tracker-api ./apps/api` exits 0
- [ ] T10 done-when checkboxes confirmed

## Commit

_pending_
