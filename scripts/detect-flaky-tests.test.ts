#!/usr/bin/env node
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyVitestVerboseLine,
  buildFilteredPnpmTestCommand,
  classifyStats,
  createLiveRunProgress,
  DEFAULT_TIMEOUT_MULTIPLIER,
  findNewlyFlakyTests,
  mergeRunResults,
  parseFlakyDetectionArgs,
  parsePlaywrightReport,
  parseVitestReport,
  parseVitestVerboseLine,
  resolvePnpmFilter,
  resolveTargetTimeoutMs,
  safeTargetFileStem,
  stripScriptArgv,
  type TestRunStats,
} from "./detect-flaky-tests.ts";

describe("detect-flaky-tests.ts", () => {
  it("parses vitest JSON reports", () => {
    const parsed = parseVitestReport("@job-tracker/api", {
      testResults: [
        {
          name: "src/foo.spec.ts",
          assertionResults: [
            { fullName: "foo works", status: "passed", failureMessages: [] },
            { fullName: "foo fails sometimes", status: "failed", failureMessages: ["boom"] },
          ],
        },
      ],
    });

    assert.equal(parsed.length, 2);
    assert.equal(parsed[1]?.status, "failed");
    assert.equal(parsed[1]?.failureMessage, "boom");
  });

  it("parses nested playwright JSON reports", () => {
    const parsed = parsePlaywrightReport("@job-tracker/web:e2e", {
      suites: [
        {
          title: "jobs",
          file: "e2e/jobs.spec.ts",
          specs: [{ title: "lists jobs", tests: [{ results: [{ status: "passed" }] }] }],
        },
      ],
    });

    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]?.fullName, "jobs > lists jobs");
    assert.equal(parsed[0]?.status, "passed");
  });

  it("merges repeated runs and classifies flaky tests", () => {
    let stats = new Map<string, TestRunStats>();

    stats = mergeRunResults(stats, [
      { targetId: "@job-tracker/web", file: "src/a.test.ts", fullName: "flaky test", status: "passed" },
    ]);
    stats = mergeRunResults(stats, [
      {
        targetId: "@job-tracker/web",
        file: "src/a.test.ts",
        fullName: "flaky test",
        status: "failed",
        failureMessage: "timeout",
      },
    ]);
    stats = mergeRunResults(stats, [
      { targetId: "@job-tracker/web", file: "src/a.test.ts", fullName: "stable test", status: "passed" },
      {
        targetId: "@job-tracker/web",
        file: "src/b.test.ts",
        fullName: "broken test",
        status: "failed",
        failureMessage: "assertion",
      },
    ]);

    const { flaky, alwaysFailing, stable } = classifyStats([...stats.values()]);

    assert.equal(flaky.length, 1);
    assert.equal(flaky[0]?.fullName, "flaky test");
    assert.equal(alwaysFailing.length, 1);
    assert.equal(stable.length, 1);
  });

  it("derives per-target timeout from observed baseline × multiplier", () => {
    assert.equal(resolveTargetTimeoutMs("@job-tracker/api"), Math.ceil(17_655 * DEFAULT_TIMEOUT_MULTIPLIER));
    assert.equal(resolveTargetTimeoutMs("@job-tracker/web"), Math.ceil(15_300 * DEFAULT_TIMEOUT_MULTIPLIER));
    assert.equal(resolveTargetTimeoutMs("@job-tracker/react-slots"), 30_000);
  });

  it("parses vitest verbose lines from live output", () => {
    const parsed = parseVitestVerboseLine(
      " ✓ src/hooks/useBreakpoint.test.ts > useBreakpoint > returns false when query does not match 8ms",
    );
    assert.deepEqual(parsed, {
      status: "passed",
      file: "src/hooks/useBreakpoint.test.ts",
      fullName: "useBreakpoint > returns false when query does not match",
    });
  });

  it("tracks live progress and detects newly flaky tests", () => {
    const progress = createLiveRunProgress();
    applyVitestVerboseLine(progress, " ✓ src/a.test.ts > suite > flaky test 1ms");
    applyVitestVerboseLine(progress, " × src/a.test.ts > suite > flaky test 2ms");

    assert.equal(progress.completedTests, 2);
    assert.equal(progress.failedTests, 1);

    let stats = mergeRunResults(new Map(), [
      { targetId: "@job-tracker/web", file: "src/a.test.ts", fullName: "suite > flaky test", status: "passed" },
    ]);
    const previous = stats;
    stats = mergeRunResults(stats, [
      {
        targetId: "@job-tracker/web",
        file: "src/a.test.ts",
        fullName: "suite > flaky test",
        status: "failed",
        failureMessage: "boom",
      },
    ]);

    const newlyFlaky = findNewlyFlakyTests(previous, stats);
    assert.equal(newlyFlaky.length, 1);
    assert.equal(newlyFlaky[0]?.fullName, "suite > flaky test");
  });

  it("sanitizes target ids for json output filenames", () => {
    assert.equal(safeTargetFileStem("@job-tracker/web"), "_job-tracker_web");
  });

  it("builds pnpm --filter test commands from targets", () => {
    assert.deepEqual(
      buildFilteredPnpmTestCommand({ id: "@job-tracker/web", cwd: "apps/web", runner: "vitest", args: [] }),
      ["--filter", "@job-tracker/web", "exec", "vitest", "run", "--reporter=verbose"],
    );
    assert.deepEqual(
      buildFilteredPnpmTestCommand(
        { id: "@job-tracker/web:e2e", cwd: "apps/web", runner: "playwright", args: [] },
        { playwrightReporters: ["list"] },
      ),
      ["--filter", "@job-tracker/web", "exec", "playwright", "test", "--reporter=list"],
    );
    assert.equal(resolvePnpmFilter({ id: "@job-tracker/web:e2e" }), "@job-tracker/web");
  });

  it("strips pnpm passthrough separator before parsing", () => {
    assert.deepEqual(stripScriptArgv(["--", "--runs", "5", "--no-build"]), ["--runs", "5", "--no-build"]);
    assert.deepEqual(stripScriptArgv(["--runs", "5"]), ["--runs", "5"]);
  });

  it("parses CLI options with yargs", async () => {
    const options = await parseFlakyDetectionArgs([
      "--runs",
      "3",
      "--package",
      "@job-tracker/web",
      "--no-build",
      "--no-fail",
      "--grep",
      "JobCard",
    ]);

    assert.equal(options.runs, 3);
    assert.equal(options.scope, "unit");
    assert.equal(options.packageFilter, "@job-tracker/web");
    assert.equal(options.build, false);
    assert.equal(options.failOnFlaky, false);
    assert.equal(options.nameFilter?.source, "JobCard");
    assert.equal(options.timeoutMultiplier, DEFAULT_TIMEOUT_MULTIPLIER);
  });

  it("accepts options after pnpm passthrough separator", async () => {
    const options = await parseFlakyDetectionArgs(["--", "--runs", "4", "--scope", "e2e"]);

    assert.equal(options.runs, 4);
    assert.equal(options.scope, "e2e");
  });
});
