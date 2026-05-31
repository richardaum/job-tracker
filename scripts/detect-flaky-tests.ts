#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
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

/** Wall-clock ms from last valid run (2026-05-24, local dev). */
export const TARGET_BASELINE_MS: Readonly<Record<string, number>> = {
  "@job-tracker/api": 17_655,
  "@job-tracker/web": 15_300,
  "@job-tracker/ui": 9_942,
  "@job-tracker/react-slots": 1_068,
  "@job-tracker/html-sanitize": 781,
  "@job-tracker/extension": 847,
  "@job-tracker/web:e2e": 300_000,
};

export const DEFAULT_TARGET_BASELINE_MS = 60_000;
export const DEFAULT_TIMEOUT_MULTIPLIER = 3;
export const MIN_TARGET_TIMEOUT_MS = 30_000;
export const DEFAULT_IDLE_TIMEOUT_MS = 60_000;
export const PROGRESS_LOG_INTERVAL_MS = 5_000;

export function resolveTargetTimeoutMs(
  targetId: string,
  multiplier = DEFAULT_TIMEOUT_MULTIPLIER,
): number {
  const baseline = TARGET_BASELINE_MS[targetId] ?? DEFAULT_TARGET_BASELINE_MS;
  return Math.max(MIN_TARGET_TIMEOUT_MS, Math.ceil(baseline * multiplier));
}

export function safeTargetFileStem(targetId: string): string {
  return targetId.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/** Workspace package name for `pnpm --filter` (strips scope suffix like `:e2e`). */
export function resolvePnpmFilter(target: Pick<TestTarget, "id">): string {
  const colonIndex = target.id.indexOf(":");
  return colonIndex >= 0 ? target.id.slice(0, colonIndex) : target.id;
}

export function buildFilteredPnpmTestCommand(
  target: TestTarget,
  options?: {
    nameFilter?: RegExp;
    vitestReporters?: readonly string[];
    playwrightReporters?: readonly string[];
    vitestOutputFile?: string;
  },
): string[] {
  const grepArgs =
    target.runner === "vitest" && options?.nameFilter
      ? ["-t", options.nameFilter.source]
      : target.runner === "playwright" && options?.nameFilter
        ? ["--grep", options.nameFilter.source]
        : [];

  const filterArgs = ["--filter", resolvePnpmFilter(target)];

  if (target.runner === "vitest") {
    const reporters = options?.vitestReporters ?? ["verbose"];
    return [
      ...filterArgs,
      "exec",
      "vitest",
      "run",
      ...target.args,
      ...grepArgs,
      ...reporters.map((reporter) => `--reporter=${reporter}`),
      ...(options?.vitestOutputFile
        ? [`--outputFile=${options.vitestOutputFile}`]
        : []),
    ];
  }

  const reporters = options?.playwrightReporters ?? ["list"];
  return [
    ...filterArgs,
    "exec",
    "playwright",
    "test",
    ...target.args,
    ...grepArgs,
    ...reporters.map((reporter) => `--reporter=${reporter}`),
  ];
}

export type ParsedVitestVerboseLine = {
  status: "passed" | "failed" | "skipped";
  file: string;
  fullName: string;
};

const VITEST_VERBOSE_LINE = /^\s*([✓×✗↓])\s+(.+?)\s>\s*(.+?)(?:\s+\d+m?s)?\s*$/;

export function parseVitestVerboseLine(
  line: string,
): ParsedVitestVerboseLine | undefined {
  const match = VITEST_VERBOSE_LINE.exec(line.trimEnd());
  if (!match) return undefined;

  const symbol = match[1];
  const status =
    symbol === "✓"
      ? "passed"
      : symbol === "↓"
        ? "skipped"
        : symbol === "×" || symbol === "✗"
          ? "failed"
          : undefined;
  if (!status) return undefined;

  return { status, file: match[2].trim(), fullName: match[3].trim() };
}

export type LiveRunProgress = {
  lastActivityAt: number;
  lastLine: string;
  lastTestFile?: string;
  lastTestFullName?: string;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
};

export function createLiveRunProgress(startedAt = Date.now()): LiveRunProgress {
  return {
    lastActivityAt: startedAt,
    lastLine: "",
    completedTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
  };
}

export function applyVitestVerboseLine(
  progress: LiveRunProgress,
  line: string,
): ParsedVitestVerboseLine | undefined {
  progress.lastActivityAt = Date.now();
  progress.lastLine = line.trim();

  const parsed = parseVitestVerboseLine(line);
  if (!parsed) return undefined;

  progress.completedTests += 1;
  progress.lastTestFile = parsed.file;
  progress.lastTestFullName = parsed.fullName;

  switch (parsed.status) {
    case "passed":
      progress.passedTests += 1;
      break;
    case "failed":
      progress.failedTests += 1;
      break;
    case "skipped":
      progress.skippedTests += 1;
      break;
  }

  return parsed;
}

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
  timeoutMultiplier: number;
  idleTimeoutMs: number;
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

type SpawnCaptureResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  progress: LiveRunProgress;
};

/** Strips pnpm's `--` passthrough separator when present. */
export function stripScriptArgv(argv: readonly string[]): string[] {
  const separatorIndex = argv.indexOf("--");
  return separatorIndex >= 0 ? argv.slice(separatorIndex + 1) : [...argv];
}

export async function parseFlakyDetectionArgs(
  argv: readonly string[],
): Promise<FlakyDetectionOptions> {
  const { default: yargs } = await import("yargs");
  const userArgs = stripScriptArgv(argv);

  const parsed = await yargs(userArgs)
    .scriptName("test:flaky")
    .usage(
      "Usage: pnpm test:flaky [-- [options]]\n\n" +
        "Detect flaky tests by running the suite multiple times and comparing outcomes.\n" +
        "Streams test output live, detects stale runs when output stops, and flags flaky\n" +
        "tests as soon as pass/fail outcomes diverge across repetitions.",
    )
    .option("runs", {
      type: "number",
      default: 10,
      description: "Number of repetitions per target",
    })
    .option("scope", {
      choices: ["unit", "e2e", "all"] as const,
      default: "unit" as const,
      description: "Which tests to run",
    })
    .option("package", {
      type: "string",
      description: "Run only one target (e.g. @job-tracker/web)",
    })
    .option("grep", {
      type: "string",
      description: "Filter tests by name (regex)",
    })
    .option("build", {
      type: "boolean",
      default: true,
      description: 'Run "pnpm turbo build" before unit runs',
    })
    .option("fail", {
      type: "boolean",
      default: true,
      description: "Exit 1 when flaky tests are found",
    })
    .option("timeout-multiplier", {
      type: "number",
      default: DEFAULT_TIMEOUT_MULTIPLIER,
      description: "Per-target timeout = baseline × n",
    })
    .option("idle-timeout-ms", {
      type: "number",
      default: DEFAULT_IDLE_TIMEOUT_MS,
      description: "Kill when no output for n ms",
    })
    .example("pnpm test:flaky", "Run 10 unit repetitions per target")
    .example(
      "pnpm test:flaky -- --runs 20 --package @job-tracker/web",
      "Repeat web unit tests 20 times",
    )
    .example("pnpm test:flaky -- --scope e2e --runs 5", "Run e2e suite 5 times")
    .example('pnpm test:flaky -- --grep "JobCard"', "Filter by test name")
    .help()
    .alias("h", "help")
    .strict()
    .check((args) => {
      const timeoutMultiplier = Number(args.timeoutMultiplier);
      const idleTimeoutMs = Number(args.idleTimeoutMs);

      if (!Number.isInteger(args.runs) || args.runs < 2) {
        throw new Error(`${TAG} --runs must be an integer >= 2.`);
      }
      if (!Number.isFinite(timeoutMultiplier) || timeoutMultiplier <= 0) {
        throw new Error(
          `${TAG} --timeout-multiplier must be a positive number.`,
        );
      }
      if (!Number.isInteger(idleTimeoutMs) || idleTimeoutMs < 1_000) {
        throw new Error(`${TAG} --idle-timeout-ms must be an integer >= 1000.`);
      }
      if (args.grep) {
        const [regexError] = tryRun(() => new RegExp(args.grep as string));
        if (regexError) {
          throw new Error(`${TAG} Invalid --grep regex: ${args.grep}`);
        }
      }
      return true;
    })
    .fail((message, error) => {
      if (error) throw error;
      throw new Error(message);
    })
    .parse();

  const grep = typeof parsed.grep === "string" ? parsed.grep : undefined;
  const [, compiledNameFilter] = grep
    ? tryRun(() => new RegExp(grep))
    : [undefined, undefined];

  return {
    runs: parsed.runs,
    scope: parsed.scope,
    packageFilter: parsed.package,
    nameFilter: compiledNameFilter ?? undefined,
    build: parsed.build,
    failOnFlaky: parsed.fail,
    timeoutMultiplier: parsed.timeoutMultiplier,
    idleTimeoutMs: parsed.idleTimeoutMs,
  };
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

function testKey(
  result: Pick<ParsedTestResult, "targetId" | "file" | "fullName">,
): string {
  return `${result.targetId}::${result.file}::${result.fullName}`;
}

function isFlakyStats(entry: TestRunStats): boolean {
  return entry.passCount > 0 && entry.failCount > 0;
}

export function mergeRunResults(
  previous: Map<string, TestRunStats>,
  runResults: ParsedTestResult[],
): Map<string, TestRunStats> {
  const next = new Map(previous);

  for (const result of runResults) {
    const key = testKey(result);
    const existing = next.get(key);
    const current = existing
      ? { ...existing, failureMessages: [...existing.failureMessages] }
      : {
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

export function findNewlyFlakyTests(
  previous: Map<string, TestRunStats>,
  next: Map<string, TestRunStats>,
): TestRunStats[] {
  const newlyFlaky: TestRunStats[] = [];

  for (const [key, entry] of next) {
    if (!isFlakyStats(entry)) continue;
    const before = previous.get(key);
    if (before && isFlakyStats(before)) continue;
    newlyFlaky.push(entry);
  }

  return newlyFlaky;
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
    if (isFlakyStats(entry)) {
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

function formatProgressSummary(progress: LiveRunProgress): string {
  const lastTest =
    progress.lastTestFile && progress.lastTestFullName
      ? `${progress.lastTestFile} > ${progress.lastTestFullName}`
      : progress.lastLine || "starting";
  return (
    `${progress.completedTests} completed` +
    ` (${progress.passedTests} passed, ${progress.failedTests} failed, ${progress.skippedTests} skipped)` +
    ` — last: ${lastTest}`
  );
}

function processVitestOutputLines(
  text: string,
  lineBuffer: { partial: string },
  target: TestTarget,
  progress: LiveRunProgress,
): void {
  lineBuffer.partial += text;
  const lines = lineBuffer.partial.split("\n");
  lineBuffer.partial = lines.pop() ?? "";

  if (target.runner !== "vitest") return;

  for (const line of lines) {
    const parsed = applyVitestVerboseLine(progress, line);
    if (parsed?.status === "failed") {
      console.log(`${TAG}    ✗ ${parsed.file} > ${parsed.fullName}`);
    }
  }
}

function spawnPnpmWithLiveDetection(
  command: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  target: TestTarget,
  context: {
    outputFile: string;
    startedAt: number;
    timeoutMs: number;
    idleTimeoutMs: number;
    baselineMs: number;
    timeoutMultiplier: number;
  },
): Promise<SpawnCaptureResult> {
  return new Promise((resolve, reject) => {
    const progress = createLiveRunProgress(context.startedAt);
    const stdoutLineBuffer = { partial: "" };
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let staleReason: "idle" | "suite" | undefined;

    const child = spawn("pnpm", [...command], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const killChild = (reason: "idle" | "suite") => {
      staleReason = reason;
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }, 5_000);
    };

    const suiteTimeoutHandle = setTimeout(() => {
      killChild("suite");
    }, context.timeoutMs);

    const monitors = [
      setInterval(() => {
        const idleForMs = Date.now() - progress.lastActivityAt;
        if (idleForMs >= context.idleTimeoutMs) {
          killChild("idle");
          return;
        }

        console.log(
          `${TAG}    … ${formatProgressSummary(progress)} (idle ${Math.round(idleForMs / 1000)}s)`,
        );
      }, PROGRESS_LOG_INTERVAL_MS),
    ];

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      progress.lastActivityAt = Date.now();
      process.stdout.write(text);
      processVitestOutputLines(text, stdoutLineBuffer, target, progress);
    });

    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      progress.lastActivityAt = Date.now();
      process.stderr.write(text);
    });

    child.on("error", (error) => {
      clearTimeout(suiteTimeoutHandle);
      for (const monitor of monitors) clearInterval(monitor);
      reject(error);
    });

    child.on("close", (status, signal) => {
      clearTimeout(suiteTimeoutHandle);
      for (const monitor of monitors) clearInterval(monitor);

      if (timedOut) {
        const idleForMs = Date.now() - progress.lastActivityAt;
        const lastTest =
          progress.lastTestFile && progress.lastTestFullName
            ? `${progress.lastTestFile} > ${progress.lastTestFullName}`
            : progress.lastLine || "(no output yet)";
        const reason =
          staleReason === "idle"
            ? `no output for ${context.idleTimeoutMs}ms (last activity ${Math.round(idleForMs / 1000)}s ago)`
            : `exceeded suite timeout ${context.timeoutMs}ms (baseline ${context.baselineMs}ms × ${context.timeoutMultiplier})`;

        reject(
          new Error(
            `${target.id} stale run detected: ${reason}. Last seen: ${lastTest}`,
          ),
        );
        return;
      }

      resolve({ status, signal, stdout, stderr, progress });
    });
  });
}

async function runTargetOnce(
  target: TestTarget,
  outputFile: string,
  timeoutMultiplier: number,
  idleTimeoutMs: number,
  nameFilter?: RegExp,
): Promise<ParsedTestResult[]> {
  const command = buildFilteredPnpmTestCommand(target, {
    nameFilter,
    vitestReporters: ["verbose", "json"],
    vitestOutputFile: outputFile,
    playwrightReporters: ["list", "json"],
  });

  const env = {
    ...process.env,
    ...(target.runner === "playwright"
      ? { PLAYWRIGHT_JSON_OUTPUT_NAME: outputFile }
      : {}),
  };

  const startedAt = Date.now();
  const timeoutMs = resolveTargetTimeoutMs(target.id, timeoutMultiplier);
  const baselineMs =
    TARGET_BASELINE_MS[target.id] ?? DEFAULT_TARGET_BASELINE_MS;

  const result = await spawnPnpmWithLiveDetection(
    command,
    REPO_ROOT,
    env,
    target,
    {
      outputFile,
      startedAt,
      timeoutMs,
      idleTimeoutMs,
      baselineMs,
      timeoutMultiplier,
    },
  );

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

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `${TAG}    done in ${elapsedSec}s — ${formatProgressSummary(result.progress)}`,
  );

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
        const outputFile = join(
          tempDir,
          `${safeTargetFileStem(target.id)}-${run}.json`,
        );
        console.log(`${TAG}  → ${target.id}`);
        const runResults = await runTargetOnce(
          target,
          outputFile,
          options.timeoutMultiplier,
          options.idleTimeoutMs,
          options.nameFilter,
        );
        const previous = stats;
        stats = mergeRunResults(stats, runResults);

        for (const entry of findNewlyFlakyTests(previous, stats)) {
          console.log(
            `${TAG}    ⚡ flaky: ${entry.fullName} (${entry.passCount} passed, ${entry.failCount} failed after ${entry.runs} run(s))`,
          );
        }

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
  parseFlakyDetectionArgs(process.argv.slice(2))
    .then((options) =>
      detectFlakyTests(options).then(({ flaky }) => {
        if (flaky.length > 0 && options.failOnFlaky) {
          process.exit(1);
        }
      }),
    )
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message.startsWith(TAG) ? message : `${TAG} ${message}`);
      process.exit(1);
    });
}
