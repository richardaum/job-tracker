#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { tryRun } from "@job-tracker/try-run";

const TAG = "[test:flaky]";
const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

type TestStatus = "passed" | "failed" | "skipped" | "pending" | "timedOut";

export type TestTarget = {
  id: string;
  cwd: string;
  runner: "vitest" | "playwright";
  args: readonly string[];
};

export const VITEST_TARGETS: readonly TestTarget[] = [
  { id: "@job-tracker/api", cwd: "apps/api", runner: "vitest", args: [] },
  { id: "@job-tracker/web", cwd: "apps/web", runner: "vitest", args: [] },
  {
    id: "@job-tracker/ui",
    cwd: "packages/ui",
    runner: "vitest",
    args: ["--project=unit"],
  },
  {
    id: "@job-tracker/react-slots",
    cwd: "packages/react-slots",
    runner: "vitest",
    args: [],
  },
  {
    id: "@job-tracker/html-sanitize",
    cwd: "packages/html-sanitize",
    runner: "vitest",
    args: [],
  },
  {
    id: "@job-tracker/extension",
    cwd: "apps/extension",
    runner: "vitest",
    args: [],
  },
];

export const E2E_TARGETS: readonly TestTarget[] = [
  {
    id: "@job-tracker/web:e2e",
    cwd: "apps/web",
    runner: "playwright",
    args: [],
  },
];

export type ParsedTestResult = {
  targetId: string;
  file: string;
  fullName: string;
  status: TestStatus;
  failureMessage?: string;
};

export type TestRunStats = {
  targetId: string;
  file: string;
  fullName: string;
  passCount: number;
  failCount: number;
  skipCount: number;
  otherCount: number;
  runs: number;
  failureMessages: string[];
};

export type FlakyDetectionOptions = {
  runs: number;
  scope: "unit" | "e2e" | "all";
  packageFilter?: string;
  nameFilter?: RegExp;
  build: boolean;
  failOnFlaky: boolean;
};

type VitestAssertionResult = {
  fullName?: string;
  status?: string;
  failureMessages?: string[];
};

type VitestJsonReport = {
  testResults?: Array<{
    name?: string;
    assertionResults?: VitestAssertionResult[];
  }>;
};

type PlaywrightJsonReport = { suites?: PlaywrightSuite[] };

type PlaywrightSuite = {
  title?: string;
  file?: string;
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
};

type PlaywrightSpec = { title?: string; tests?: PlaywrightTest[] };

type PlaywrightTest = {
  results?: Array<{ status?: string; error?: { message?: string } }>;
};

function printUsage(): void {
  console.log(`Usage: pnpm test:flaky [-- [options]]

Detect flaky tests by running the suite multiple times and comparing outcomes.

Options:
  --runs <n>          Number of repetitions per target (default: 10)
  --scope <unit|e2e|all>  Which tests to run (default: unit)
  --package <id>      Run only one target (e.g. @job-tracker/web)
  --grep <pattern>    Filter tests by name (regex)
  --no-build          Skip "pnpm turbo build" before unit runs
  --no-fail           Exit 0 even when flaky tests are found

Examples:
  pnpm test:flaky
  pnpm test:flaky -- --runs 20 --package @job-tracker/web
  pnpm test:flaky -- --scope e2e --runs 5
  pnpm test:flaky -- --grep "JobCard"
`);
}

function parseArgs(argv: string[]): FlakyDetectionOptions | undefined {
  let runs = 10;
  let scope: FlakyDetectionOptions["scope"] = "unit";
  let packageFilter: string | undefined;
  let nameFilter: RegExp | undefined;
  let build = true;
  let failOnFlaky = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--runs": {
        const value = Number.parseInt(argv[++i] ?? "", 10);
        if (!Number.isInteger(value) || value < 2) {
          console.error(`${TAG} --runs must be an integer >= 2.`);
          return undefined;
        }
        runs = value;
        break;
      }
      case "--scope": {
        const value = argv[++i];
        if (value !== "unit" && value !== "e2e" && value !== "all") {
          console.error(`${TAG} --scope must be unit, e2e, or all.`);
          return undefined;
        }
        scope = value;
        break;
      }
      case "--package":
        packageFilter = argv[++i];
        if (!packageFilter) {
          console.error(`${TAG} --package requires a target id.`);
          return undefined;
        }
        break;
      case "--grep": {
        const pattern = argv[++i];
        if (!pattern) {
          console.error(`${TAG} --grep requires a regex pattern.`);
          return undefined;
        }
        const [regexError, compiledFilter] = tryRun(() => new RegExp(pattern));
        if (regexError) {
          console.error(`${TAG} Invalid --grep regex: ${pattern}`);
          return undefined;
        }
        nameFilter = compiledFilter;
        break;
      }
      case "--no-build":
        build = false;
        break;
      case "--no-fail":
        failOnFlaky = false;
        break;
      case "--help":
      case "-h":
        printUsage();
        return undefined;
      default:
        console.error(`${TAG} Unknown argument: ${arg}`);
        printUsage();
        return undefined;
    }
  }

  return { runs, scope, packageFilter, nameFilter, build, failOnFlaky };
}

function normalizeStatus(raw: string | undefined): TestStatus {
  switch (raw) {
    case "passed":
      return "passed";
    case "failed":
      return "failed";
    case "skipped":
      return "skipped";
    case "pending":
      return "pending";
    case "timedOut":
      return "timedOut";
    default:
      return "failed";
  }
}

export function parseVitestReport(
  targetId: string,
  report: VitestJsonReport,
): ParsedTestResult[] {
  const results: ParsedTestResult[] = [];
  for (const suite of report.testResults ?? []) {
    const file = suite.name ?? "<unknown>";
    for (const assertion of suite.assertionResults ?? []) {
      const fullName = assertion.fullName ?? assertion.status ?? "<unknown>";
      results.push({
        targetId,
        file,
        fullName,
        status: normalizeStatus(assertion.status),
        failureMessage: assertion.failureMessages?.[0],
      });
    }
  }
  return results;
}

function collectPlaywrightSpecResults(
  targetId: string,
  suite: PlaywrightSuite,
  parentTitles: string[],
  results: ParsedTestResult[],
): void {
  const titles = suite.title ? [...parentTitles, suite.title] : parentTitles;
  const file = suite.file ?? "<unknown>";

  for (const child of suite.suites ?? []) {
    collectPlaywrightSpecResults(targetId, child, titles, results);
  }

  for (const spec of suite.specs ?? []) {
    const specTitle = spec.title ?? "<unknown>";
    const fullName = [...titles, specTitle].join(" > ");
    for (const test of spec.tests ?? []) {
      const lastResult = test.results?.at(-1);
      results.push({
        targetId,
        file,
        fullName,
        status: normalizeStatus(lastResult?.status),
        failureMessage: lastResult?.error?.message,
      });
    }
  }
}

export function parsePlaywrightReport(
  targetId: string,
  report: PlaywrightJsonReport,
): ParsedTestResult[] {
  const results: ParsedTestResult[] = [];
  for (const suite of report.suites ?? []) {
    collectPlaywrightSpecResults(targetId, suite, [], results);
  }
  return results;
}

function testKey(result: ParsedTestResult): string {
  return `${result.targetId}::${result.file}::${result.fullName}`;
}

export function mergeRunResults(
  previous: Map<string, TestRunStats>,
  runResults: ParsedTestResult[],
): Map<string, TestRunStats> {
  const next = new Map(previous);

  for (const result of runResults) {
    const key = testKey(result);
    const current = next.get(key) ?? {
      targetId: result.targetId,
      file: result.file,
      fullName: result.fullName,
      passCount: 0,
      failCount: 0,
      skipCount: 0,
      otherCount: 0,
      runs: 0,
      failureMessages: [],
    };

    current.runs += 1;
    switch (result.status) {
      case "passed":
        current.passCount += 1;
        break;
      case "failed":
      case "timedOut":
        current.failCount += 1;
        if (result.failureMessage) {
          current.failureMessages.push(result.failureMessage);
        }
        break;
      case "skipped":
      case "pending":
        current.skipCount += 1;
        break;
      default:
        current.otherCount += 1;
    }

    next.set(key, current);
  }

  return next;
}

export function classifyStats(stats: TestRunStats[]): {
  flaky: TestRunStats[];
  alwaysFailing: TestRunStats[];
  stable: TestRunStats[];
} {
  const flaky: TestRunStats[] = [];
  const alwaysFailing: TestRunStats[] = [];
  const stable: TestRunStats[] = [];

  for (const entry of stats) {
    if (entry.passCount > 0 && entry.failCount > 0) {
      flaky.push(entry);
      continue;
    }
    if (entry.failCount > 0 && entry.passCount === 0) {
      alwaysFailing.push(entry);
      continue;
    }
    stable.push(entry);
  }

  flaky.sort(
    (a, b) =>
      b.failCount / b.runs - a.failCount / a.runs || b.failCount - a.failCount,
  );
  alwaysFailing.sort((a, b) => b.failCount - a.failCount);

  return { flaky, alwaysFailing, stable };
}

function resolveTargets(options: FlakyDetectionOptions): TestTarget[] {
  const byScope =
    options.scope === "unit"
      ? VITEST_TARGETS
      : options.scope === "e2e"
        ? E2E_TARGETS
        : [...VITEST_TARGETS, ...E2E_TARGETS];

  if (!options.packageFilter) return [...byScope];

  const match = byScope.filter((target) => target.id === options.packageFilter);
  if (match.length === 0) {
    const available = byScope.map((target) => target.id).join(", ");
    throw new Error(
      `Unknown package "${options.packageFilter}". Available: ${available}`,
    );
  }
  return match;
}

function runBuild(): void {
  console.log(`${TAG} Building workspace dependencies...`);
  const result = spawnSync("pnpm", ["turbo", "build"], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("turbo build failed");
  }
}

function runTargetOnce(
  target: TestTarget,
  outputFile: string,
  nameFilter?: RegExp,
): ParsedTestResult[] {
  const cwd = join(REPO_ROOT, target.cwd);
  const grepArgs =
    target.runner === "vitest" && nameFilter
      ? ["-t", nameFilter.source]
      : target.runner === "playwright" && nameFilter
        ? ["--grep", nameFilter.source]
        : [];

  const command =
    target.runner === "vitest"
      ? [
          "exec",
          "vitest",
          "run",
          ...target.args,
          ...grepArgs,
          "--reporter=json",
          `--outputFile=${outputFile}`,
        ]
      : [
          "exec",
          "playwright",
          "test",
          ...target.args,
          ...grepArgs,
          "--reporter=json",
        ];

  const result = spawnSync("pnpm", command, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      ...(target.runner === "playwright"
        ? { PLAYWRIGHT_JSON_OUTPUT_NAME: outputFile }
        : {}),
    },
  });

  let parsed: ParsedTestResult[] = [];
  const [parseError, parsedFromReport] = tryRun(() => {
    const raw = readFileSync(outputFile, "utf8");
    const report = JSON.parse(raw) as VitestJsonReport | PlaywrightJsonReport;
    return target.runner === "vitest"
      ? parseVitestReport(target.id, report as VitestJsonReport)
      : parsePlaywrightReport(target.id, report as PlaywrightJsonReport);
  });
  if (parseError) {
    console.warn(
      `${TAG} Could not parse JSON report for ${target.id}: ${parseError.message}`,
    );
  } else {
    parsed = parsedFromReport;
  }

  if (result.status !== 0 && parsed.length === 0) {
    throw new Error(`${target.id} run failed without parseable test results`);
  }

  return parsed;
}

function formatRate(count: number, total: number): string {
  return `${((count / total) * 100).toFixed(1)}%`;
}

function printReport(
  stats: Map<string, TestRunStats>,
  runs: number,
): { flaky: TestRunStats[]; alwaysFailing: TestRunStats[] } {
  const classified = classifyStats([...stats.values()]);

  console.log(`\n${TAG} Summary (${runs} run(s) per target)`);
  console.log(`${TAG} Tracked tests: ${stats.size}`);
  console.log(`${TAG} Stable: ${classified.stable.length}`);
  console.log(`${TAG} Flaky: ${classified.flaky.length}`);
  console.log(`${TAG} Always failing: ${classified.alwaysFailing.length}`);

  if (classified.flaky.length > 0) {
    console.log(`\n${TAG} Flaky tests:`);
    for (const entry of classified.flaky) {
      console.log(
        `  - [${entry.targetId}] ${entry.fullName}\n` +
          `    file: ${entry.file}\n` +
          `    pass/fail: ${entry.passCount}/${entry.failCount} (${formatRate(entry.failCount, entry.runs)} fail rate)`,
      );
      if (entry.failureMessages.length > 0) {
        const sample = entry.failureMessages[0].split("\n")[0];
        console.log(`    sample error: ${sample}`);
      }
    }
  }

  if (classified.alwaysFailing.length > 0) {
    console.log(`\n${TAG} Always failing (not flaky, but broken):`);
    for (const entry of classified.alwaysFailing) {
      console.log(
        `  - [${entry.targetId}] ${entry.fullName} (${entry.failCount}/${entry.runs} fails)`,
      );
    }
  }

  return { flaky: classified.flaky, alwaysFailing: classified.alwaysFailing };
}

export async function detectFlakyTests(
  options: FlakyDetectionOptions,
): Promise<{ flaky: TestRunStats[]; alwaysFailing: TestRunStats[] }> {
  const targets = resolveTargets(options);
  const tempDir = mkdtempSync(join(tmpdir(), "job-tracker-flaky-"));

  try {
    if (options.build && options.scope !== "e2e") {
      runBuild();
    }

    let stats = new Map<string, TestRunStats>();

    for (let run = 1; run <= options.runs; run += 1) {
      console.log(`\n${TAG} Run ${run}/${options.runs}`);
      for (const target of targets) {
        const outputFile = join(tempDir, `${target.id}-${run}.json`);
        console.log(`${TAG}  → ${target.id}`);
        const runResults = runTargetOnce(
          target,
          outputFile,
          options.nameFilter,
        );
        stats = mergeRunResults(stats, runResults);
        console.log(`${TAG}    collected ${runResults.length} test result(s)`);
      }
    }

    return printReport(stats, options.runs);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

const selfResolved = resolve(fileURLToPath(import.meta.url));
const invokedDirectly =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === selfResolved;

if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    process.exit(
      process.argv.includes("--help") || process.argv.includes("-h") ? 0 : 1,
    );
  }

  detectFlakyTests(options)
    .then(({ flaky }) => {
      if (flaky.length > 0 && options.failOnFlaky) {
        process.exit(1);
      }
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${TAG} ${message}`);
      process.exit(1);
    });
}
