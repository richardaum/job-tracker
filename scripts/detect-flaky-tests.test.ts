#!/usr/bin/env node
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyStats,
  mergeRunResults,
  parsePlaywrightReport,
  parseVitestReport,
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
            {
              fullName: "foo fails sometimes",
              status: "failed",
              failureMessages: ["boom"],
            },
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
          specs: [
            {
              title: "lists jobs",
              tests: [{ results: [{ status: "passed" }] }],
            },
          ],
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
      {
        targetId: "@job-tracker/web",
        file: "src/a.test.ts",
        fullName: "flaky test",
        status: "passed",
      },
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
      {
        targetId: "@job-tracker/web",
        file: "src/a.test.ts",
        fullName: "stable test",
        status: "passed",
      },
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
});
