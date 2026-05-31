#!/usr/bin/env node
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyPlaywrightStartupLine,
  classifyStartupRun,
  createStartupProgress,
  DEFAULT_SLOW_STARTUP_MS,
  DEFAULT_STARTUP_TIMEOUT_MS,
  firstOutputMs,
  mergeStartupFindings,
  parseSlowStartupDetectionArgs,
  parseVitestStartupLine,
  type StartupFinding,
  startupMs,
} from "./detect-slow-startup-tests.ts";

describe("detect-slow-startup-tests.ts", () => {
  it("recognizes vitest startup signals", () => {
    assert.equal(parseVitestStartupLine(" RUN  v3.0.0 /tmp/project"), " RUN  v3.0.0 /tmp/project");
    assert.equal(
      parseVitestStartupLine(" ✓ src/foo.test.ts (3 tests) 12ms"),
      " ✓ src/foo.test.ts (3 tests) 12ms",
    );
    assert.equal(
      parseVitestStartupLine(
        " ✓ src/hooks/useBreakpoint.test.ts > useBreakpoint > returns false 8ms",
      ),
      " ✓ src/hooks/useBreakpoint.test.ts > useBreakpoint > returns false 8ms",
    );
    assert.equal(parseVitestStartupLine("collecting tests..."), undefined);
  });

  it("tracks first output and first test activity", () => {
    const progress = createStartupProgress(1_000);
    progress.firstOutputAt = 1_500;
    progress.firstTestAt = 4_000;
    progress.firstTestSignal = "src/a.test.ts > suite > works";

    assert.equal(firstOutputMs(progress), 500);
    assert.equal(startupMs(progress), 3_000);
  });

  it("classifies never started and slow startup runs", () => {
    const startedAt = 10_000;
    const progress = createStartupProgress(startedAt);
    progress.firstOutputAt = startedAt + 2_000;
    progress.lastLine = "collecting tests...";

    const neverStarted = classifyStartupRun(
      "@job-tracker/web",
      1,
      progress,
      {
        startupTimeoutMs: DEFAULT_STARTUP_TIMEOUT_MS,
        slowStartupMs: DEFAULT_SLOW_STARTUP_MS,
      },
      "startup",
    );
    assert.equal(neverStarted?.kind, "neverStarted");

    progress.firstTestAt = startedAt + 20_000;
    progress.firstTestSignal = "src/a.test.ts > suite > works";
    const slowStartup = classifyStartupRun("@job-tracker/web", 1, progress, {
      startupTimeoutMs: DEFAULT_STARTUP_TIMEOUT_MS,
      slowStartupMs: DEFAULT_SLOW_STARTUP_MS,
    });
    assert.equal(slowStartup?.kind, "slowStartup");
    assert.equal(slowStartup?.startupMs, 20_000);
  });

  it("recognizes playwright startup signals", () => {
    const progress = createStartupProgress();
    applyPlaywrightStartupLine(progress, "Running 3 tests using 1 worker");
    assert.equal(progress.firstTestSignal, "Running 3 tests using 1 worker");
  });

  it("merges findings keeping the worst startup per target/kind", () => {
    const findings: StartupFinding[] = [
      {
        targetId: "@job-tracker/web",
        run: 1,
        kind: "slowStartup",
        startupMs: 18_000,
        thresholdMs: DEFAULT_SLOW_STARTUP_MS,
        lastLine: "a",
      },
      {
        targetId: "@job-tracker/web",
        run: 2,
        kind: "slowStartup",
        startupMs: 25_000,
        thresholdMs: DEFAULT_SLOW_STARTUP_MS,
        lastLine: "b",
      },
    ];

    const merged = mergeStartupFindings(findings);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.startupMs, 25_000);
  });

  it("parses CLI options with yargs", async () => {
    const options = await parseSlowStartupDetectionArgs([
      "--runs",
      "2",
      "--package",
      "@job-tracker/web",
      "--no-build",
      "--no-fail",
      "--startup-timeout-ms",
      "45000",
      "--slow-startup-ms",
      "8000",
    ]);

    assert.equal(options.runs, 2);
    assert.equal(options.packageFilter, "@job-tracker/web");
    assert.equal(options.build, false);
    assert.equal(options.failOnSlowStartup, false);
    assert.equal(options.startupTimeoutMs, 45_000);
    assert.equal(options.slowStartupMs, 8_000);
  });
});
