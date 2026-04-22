# Platform Reliability Hardening — Spec

**Milestone:** M2
**Status:** Planned

## Requirements

| ID     | Description                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRH-01 | Add ORM middleware/hooks to measure query count per request and emit warning when a request exceeds 15 queries (N+1 detection signal).                      |
| PRH-02 | Add property-based tests for critical concurrent flows to explore different execution orders and detect race conditions.                                    |
| PRH-03 | Enforce TTL for all in-memory/application caches and define default expiration policy per cache type.                                                       |
| PRH-04 | Add queue length monitoring and alerting, including checks that queues drain within expected time windows.                                                  |
| PRH-05 | Define and document live and deep profiling toolkit: `py-spy` for live inspection, and Sentry/pprof/Chrome DevTools for memory profiling and leak analysis. |
| PRH-06 | Automate secret scanning in GitHub Actions as part of CI security linting.                                                                                  |
| PRH-07 | Pin dependency versions across workspaces and add routine vulnerability validation against known exploit databases/tools.                                   |
| PRH-08 | Document architectural decisions with explicit trade-offs using a fundamental principles matrix for consistency.                                            |
| PRH-09 | Run failure simulations (including database downtime) and validate graceful degradation/recovery behavior with clear runbooks.                              |
