# Platform Reliability Hardening - Tasks

**Spec:** `.specs/features/platform-reliability-hardening/spec.md`  
**Design:** `.specs/features/platform-reliability-hardening/design.md`  
**Status:** Planned

---

## Execution Plan

### Phase 1: Baseline and instrumentation foundations (Sequential)

```
T01 -> T02
```

### Phase 2: Correctness and resource safety (Parallel after T02)

```
T02 -> T03 [P]
T02 -> T04 [P]
```

### Phase 3: Security and dependency hardening (Parallel after T02)

```
T02 -> T05 [P]
T02 -> T06 [P]
```

### Phase 4: Architecture and resilience validation (Sequential)

```
T03,T04,T05,T06 -> T07 -> T08 -> T09
```

---

## Task Breakdown

### T01: Add request query counter instrumentation

**What:** Implement ORM hook/middleware to count executed queries per request and emit warning when threshold is exceeded  
**Where:** `apps/api` request/DB integration layer (exact file to confirm during execution phase)  
**Depends on:** platform-reliability-hardening spec  
**Requirement:** PRH-01

**Done when:**

- [ ] Query count is collected in request scope
- [ ] Warning is emitted for requests with count `> 15`
- [ ] Logs include enough metadata to identify the route/operation
- [ ] No runtime regression in normal request handling

**Tests:** unit + integration  
**Gate:** quick - `pnpm --filter @job-tracker/api test`

---

### T02: Establish observability baseline for query and queue metrics

**What:** Define metric names, labels, and thresholds used by runtime warnings/alerts  
**Where:** `apps/api` observability/monitoring modules and docs  
**Depends on:** T01  
**Requirement:** PRH-01, PRH-04

**Done when:**

- [ ] Query volume metric contract is documented and emitted
- [ ] Queue length and drain-time metrics are defined
- [ ] Warning/critical thresholds are documented
- [ ] Dashboards/alerts wiring points are identified

**Tests:** none (contract + smoke validation)  
**Gate:** build - `pnpm --filter @job-tracker/api build`

---

### T03: Add property-based concurrency tests [P]

**What:** Create property-based tests for critical concurrent operations and encode invariants  
**Where:** `apps/api` domain tests for state-changing operations  
**Depends on:** T02  
**Requirement:** PRH-02

**Done when:**

- [ ] Property-based test library is integrated in the API workspace
- [ ] At least one high-risk concurrent flow is covered with generated schedules
- [ ] Tests print reproducible seed on failure
- [ ] Invariants protect against lost updates/invalid transitions

**Tests:** property-based + existing unit/integration  
**Gate:** full - `pnpm --filter @job-tracker/api test`

---

### T04: Enforce cache TTL and queue drain checks [P]

**What:** Apply TTL policy to all caches and implement queue drain monitoring checks  
**Where:** `apps/api` cache modules, queue workers, and queue config  
**Depends on:** T02  
**Requirement:** PRH-03, PRH-04

**Done when:**

- [ ] All cache definitions include explicit TTL
- [ ] Queue length/drain checks are emitted and observable
- [ ] Runbook notes cover stuck-queue remediation
- [ ] No queue consumer behavior regression is introduced

**Tests:** unit + integration  
**Gate:** full - `pnpm --filter @job-tracker/api test`

---

### T05: Security linting in GitHub Actions [P]

**What:** Add CI secret scanning and fail policy for detected leaks  
**Where:** `.github/workflows/*`  
**Depends on:** T02  
**Requirement:** PRH-06

**Done when:**

- [ ] Secret scanning workflow is enabled in CI
- [ ] Pull requests run scanning automatically
- [ ] Failure behavior and exception process are documented

**Tests:** workflow validation  
**Gate:** CI dry-run or workflow lint check

---

### T06: Dependency pinning and vulnerability checks [P]

**What:** Enforce pinned dependency strategy and add vulnerability scanning routine  
**Where:** root/package workspace manifests and security workflow docs  
**Depends on:** T02  
**Requirement:** PRH-07

**Done when:**

- [ ] Dependency version policy is documented and applied
- [ ] Vulnerability scan command/workflow is wired
- [ ] Remediation threshold policy is defined (blocker/high/medium)

**Tests:** dependency/security tooling checks  
**Gate:** workspace checks + security scan pass

---

### T07: Document architecture decisions with principles matrix

**What:** Create/update ADR-style records and apply principles matrix for major platform decisions  
**Where:** `.specs/` project docs (decision location to confirm during execution phase)  
**Depends on:** T03, T04, T05, T06  
**Requirement:** PRH-08

**Done when:**

- [ ] Decision template includes alternatives, trade-offs, and revisit triggers
- [ ] At least one decision entry is completed using the matrix
- [ ] Team guidance for future decisions is documented

**Tests:** documentation review  
**Gate:** docs consistency review

---

### T08: Run failure simulations (including database downtime)

**What:** Define and execute controlled failure scenarios to validate degradation/recovery behavior  
**Where:** `apps/api` test harness/scripts + operational docs  
**Depends on:** T07  
**Requirement:** PRH-09

**Done when:**

- [ ] Database downtime scenario is executed or reproducibly simulated
- [ ] Expected behavior is defined and verified
- [ ] Recovery steps are documented and validated
- [ ] Evidence is captured (logs, metrics, outcomes)

**Tests:** chaos/failure simulation + integration checks  
**Gate:** scenario checklist pass

---

### T09: Profiling playbook and final hardening validation

**What:** Consolidate profiling and leak-triage workflow; run final validation of feature requirements  
**Where:** `.specs/` docs + relevant service docs/scripts  
**Depends on:** T08  
**Requirement:** PRH-05, PRH-01..PRH-09

**Done when:**

- [ ] Profiling playbook defines when to use `py-spy`, Sentry, pprof, and DevTools
- [ ] Evidence expectations and escalation path are documented
- [ ] Requirement traceability is updated and validated before closing feature

**Tests:** documentation + checklist validation  
**Gate:** final verification report

---

## Immediate Next Step

Start with **T01** (query counter instrumentation) and define the concrete target files in `apps/api` before coding.
