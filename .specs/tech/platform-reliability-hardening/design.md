# Platform Reliability Hardening - Design

**Spec:** `.specs/tech/platform-reliability-hardening/spec.md`  
**Status:** Planned

---

## Scope Strategy

This feature is **Large** (cross-cutting concerns across API runtime, tests, CI, operations, and engineering process).

Execution will happen in six streams:

1. Runtime observability and bottleneck detection
2. Concurrency correctness and stress validation
3. Memory and resource safety
4. Security and dependency hygiene
5. Architectural decision governance
6. Reliability under failure scenarios

---

## Architecture

### 1) Request-level query volume instrumentation

For N+1 detection, the API layer should expose per-request query count.

Design principles:

- Instrument ORM query execution via centralized hook/middleware (single integration point)
- Track count scoped to request context (not global process counters)
- Emit warning when count exceeds threshold (`> 15`)
- Log structured metadata (route/operation, user context when safe, total count, duration bucket)

Expected output:

- Warning signal for expensive requests
- Baseline data to identify candidates for eager loading/batching

### 2) Concurrency correctness via property-based testing

Critical concurrent paths should be tested with generated interleavings rather than fixed deterministic cases.

Design principles:

- Introduce property-based test harness for selected race-prone flows (example: update/status transitions/idempotent operations)
- Express invariants (no duplicated state transitions, no lost updates, ownership isolation preserved)
- Use randomized schedules/inputs with reproducible seeds on failure

Expected output:

- Failing seeds that expose hidden race conditions
- Regression safety once fixes are merged

### 3) Memory and resource management guardrails

Prevent long-lived memory growth through default-expiring caches and queue health checks.

Design principles:

- Every cache definition must include TTL policy (explicit no-TTL caches are disallowed)
- Add queue depth monitoring and drain-time checks
- Define warning and critical thresholds per queue profile
- Add operational guidance for remediation (worker scale, stuck job investigation, dead-letter actions)

Expected output:

- Bounded cache residency
- Early signals when queues stop draining

### 4) Profiling toolkit standardization

Adopt a profiling stack that supports both live production-like inspection and deep offline analysis.

Design principles:

- `py-spy` for low-overhead live inspection
- Sentry performance/error telemetry for correlation
- `pprof` for targeted memory/cpu capture (where supported)
- Chrome DevTools heap snapshots for frontend/runtime leak analysis
- Document when to use each tool and minimum evidence required before proposing fixes

Expected output:

- Repeatable profiling playbook
- Faster leak triage with consistent evidence quality

### 5) Security and supply-chain controls

Shift security checks left into CI and dependency lifecycle management.

Design principles:

- Add secret-scanning workflow in GitHub Actions
- Pin versions across workspaces where practical and document update cadence
- Add vulnerability scanning against known advisories/CVE feeds
- Define triage policy (blocker/high/medium, SLA to remediate)

Expected output:

- Earlier detection of leaked credentials
- Reduced exposure to dependency compromise

### 6) Decision framework and resilience validation

Ensure architectural consistency and prove behavior under outages.

Design principles:

- Maintain architecture decision entries with explicit trade-offs and rationale
- Use a principles matrix to evaluate options consistently
- Run failure simulations (including DB downtime) with expected system behavior documented
- Validate graceful degradation and recovery procedures

Expected output:

- Traceable, defensible architecture choices
- Confidence in outage behavior and recovery runbooks

---

## Fundamental Principles Matrix (Template)

Every relevant architecture decision should be evaluated against:

- Operational simplicity
- Failure isolation
- Performance impact
- Security posture
- Cost/complexity of implementation
- Team maintainability

Each decision record should document:

- Alternatives considered
- Chosen option
- Trade-offs accepted
- Revisit trigger (what changes would invalidate this decision)

---

## Traceability Matrix

| Requirement | Design response                                                                  |
| ----------- | -------------------------------------------------------------------------------- |
| PRH-01      | Central ORM query instrumentation with per-request counter and warning threshold |
| PRH-02      | Property-based concurrency test harness with invariant-driven assertions         |
| PRH-03      | Mandatory TTL policy for all caches                                              |
| PRH-04      | Queue depth + drain-time monitoring with thresholds and remediation guidance     |
| PRH-05      | Profiling toolkit playbook (`py-spy`, Sentry, pprof, Chrome DevTools)            |
| PRH-06      | GitHub Actions secret scanning integration                                       |
| PRH-07      | Dependency pinning and vulnerability scan policy                                 |
| PRH-08      | ADR + principles matrix governance                                               |
| PRH-09      | Failure simulation scenarios with validation criteria and runbooks               |
