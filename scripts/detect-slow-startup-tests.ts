#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { tryRun } from "@job-tracker/try-run";

import {
  applyVitestVerboseLine,
  buildFilteredPnpmTestCommand,
  createLiveRunProgress,
  E2E_TARGETS,
  type LiveRunProgress,
  PROGRESS_LOG_INTERVAL_MS,
  stripScriptArgv,
  type TestTarget,
  VITEST_TARGETS,
} from "./detect-flaky-tests.ts";

const TAG = "[test:slow-startup]";
const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export const DEFAULT_STARTUP_TIMEOUT_MS = 60_000;
export const DEFAULT_SLOW_STARTUP_MS = 15_000;

const VITEST_RUN_LINE = /^\s*RUN\s+/;
const VITEST_FILE_LINE =
  /^\s*[✓×✗↓]\s+(.+\.(?:test|spec)\.[cm]?[jt]sx?)\s*(?:\(\d+\s+tests?\))?/;

const PLAYWRIGHT_RUNNING = /Running \d+ tests? using/;
const PLAYWRIGHT_TEST_LINE = /^\s*[✓×✗]\s+\d+\s+/;

export type StartupProgress = LiveRunProgress & {
  startedAt: number;
  firstOutputAt?: number;
  firstTestAt?: number;
  firstTestSignal?: string;
};

export type StartupFindingKind = "neverStarted" | "slowStartup";

export type StartupFinding = {
  targetId: string;
  run: number;
  kind: StartupFindingKind;
  startupMs: number;
  firstOutputMs?: number;
  thresholdMs: number;
  lastLine: string;
  firstTestSignal?: string;
};

export type SlowStartupDetectionOptions = {
  runs: number;
  scope: "unit" | "e2e" | "all";
  packageFilter?: string;
  nameFilter?: RegExp;
  build: boolean;
  failOnSlowStartup: boolean;
  startupTimeoutMs: number;
  slowStartupMs: number;
};

export function createStartupProgress(startedAt = Date.now()): StartupProgress {
  return { ...createLiveRunProgress(startedAt), startedAt };
}

export function markStartupOutput(progress: StartupProgress): void {
  if (progress.firstOutputAt === undefined) {
    progress.firstOutputAt = Date.now();
  }
  progress.lastActivityAt = Date.now();
}

export function markTestsStarted(
  progress: StartupProgress,
  signal: string,
): void {
  if (progress.firstTestAt === undefined) {
    progress.firstTestAt = Date.now();
    progress.firstTestSignal = signal.trim();
  }
  progress.lastActivityAt = Date.now();
}

export function parseVitestStartupLine(line: string): string | undefined {
  const trimmed = line.trimEnd();
  if (VITEST_RUN_LINE.test(trimmed)) return trimmed;
  if (parseVitestFileStartupLine(trimmed)) return trimmed;
  const probe = createStartupProgress();
  if (applyVitestStartupLine(probe, line)) return trimmed;
  return undefined;
}

function parseVitestFileStartupLine(line: string): string | undefined {
  const match = VITEST_FILE_LINE.exec(line.trimEnd());
  return match ? line.trimEnd() : undefined;
}

export function applyVitestStartupLine(
  progress: StartupProgress,
  line: string,
): string | undefined {
  progress.lastLine = line.trim();

  const trimmed = line.trimEnd();
  if (VITEST_RUN_LINE.test(trimmed)) {
    markTestsStarted(progress, trimmed);
    return trimmed;
  }

  const fileLine = parseVitestFileStartupLine(trimmed);
  if (fileLine) {
    markTestsStarted(progress, fileLine);
    return fileLine;
  }

  const parsed = applyVitestVerboseLine(progress, line);
  if (parsed) {
    markTestsStarted(progress, `${parsed.file} > ${parsed.fullName}`);
    return trimmed;
  }

  return undefined;
}

export function applyPlaywrightStartupLine(
  progress: StartupProgress,
  line: string,
): string | undefined {
  progress.lastLine = line.trim();
  const trimmed = line.trimEnd();

  if (PLAYWRIGHT_RUNNING.test(trimmed) || PLAYWRIGHT_TEST_LINE.test(trimmed)) {
    markTestsStarted(progress, trimmed);
    return trimmed;
  }

  return undefined;
}

export function startupMs(progress: StartupProgress): number | undefined {
  if (progress.firstTestAt === undefined) return undefined;
  return progress.firstTestAt - progress.startedAt;
}

export function firstOutputMs(progress: StartupProgress): number | undefined {
  if (progress.firstOutputAt === undefined) return undefined;
  return progress.firstOutputAt - progress.startedAt;
}

export function classifyStartupRun(
  targetId: string,
  run: number,
  progress: StartupProgress,
  options: Pick<
    SlowStartupDetectionOptions,
    "startupTimeoutMs" | "slowStartupMs"
  >,
  timedOutReason?: "startup" | "suite",
): StartupFinding | undefined {
  const elapsedMs = Date.now() - progress.startedAt;
  const measuredStartupMs = startupMs(progress);
  const lastLine = progress.lastLine || "(no output yet)";

  if (timedOutReason === "startup" || measuredStartupMs === undefined) {
    return {
      targetId,
      run,
      kind: "neverStarted",
      startupMs: measuredStartupMs ?? elapsedMs,
      firstOutputMs: firstOutputMs(progress),
      thresholdMs: options.startupTimeoutMs,
      lastLine,
      firstTestSignal: progress.firstTestSignal,
    };
  }

  if (measuredStartupMs > options.slowStartupMs) {
    return {
      targetId,
      run,
      kind: "slowStartup",
      startupMs: measuredStartupMs,
      firstOutputMs: firstOutputMs(progress),
      thresholdMs: options.slowStartupMs,
      lastLine,
      firstTestSignal: progress.firstTestSignal,
    };
  }

  return undefined;
}

export function mergeStartupFindings(
  findings: StartupFinding[],
): StartupFinding[] {
  const byKey = new Map<string, StartupFinding>();

  for (const finding of findings) {
    const key = `${finding.targetId}::${finding.kind}`;
    const existing = byKey.get(key);
    if (!existing || finding.startupMs > existing.startupMs) {
      byKey.set(key, finding);
    }
  }

  return [...byKey.values()].sort(
    (a, b) =>
      a.targetId.localeCompare(b.targetId) ||
      a.kind.localeCompare(b.kind) ||
      b.startupMs - a.startupMs,
  );
}

export async function parseSlowStartupDetectionArgs(
  argv: readonly string[],
): Promise<SlowStartupDetectionOptions> {
  const { default: yargs } = await import("yargs");
  const userArgs = stripScriptArgv(argv);

  const parsed = await yargs(userArgs)
    .scriptName("test:slow-startup")
    .usage(
      "Usage: pnpm test:slow-startup [-- [options]]\n\n" +
        "Detect test targets that take too long to start or never begin executing tests.\n" +
        "Streams output live, kills runs that produce no test activity within the startup\n" +
        "timeout, and flags targets whose first test signal exceeds the slow threshold.",
    )
    .option("runs", {
      type: "number",
      default: 1,
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
      description: "Exit 1 when slow or stuck startups are found",
    })
    .option("startup-timeout-ms", {
      type: "number",
      default: DEFAULT_STARTUP_TIMEOUT_MS,
      description: "Kill when no test activity within n ms",
    })
    .option("slow-startup-ms", {
      type: "number",
      default: DEFAULT_SLOW_STARTUP_MS,
      description: "Flag when first test activity takes longer than n ms",
    })
    .example(
      "pnpm test:slow-startup",
      "Check unit targets for slow or stuck startup",
    )
    .example(
      "pnpm test:slow-startup -- --package @job-tracker/web --runs 3",
      "Repeat web unit startup check 3 times",
    )
    .help()
    .alias("h", "help")
    .strict()
    .check((args) => {
      const startupTimeoutMs = Number(args.startupTimeoutMs);
      const slowStartupMs = Number(args.slowStartupMs);

      if (!Number.isInteger(args.runs) || args.runs < 1) {
        throw new Error(`${TAG} --runs must be an integer >= 1.`);
      }
      if (!Number.isInteger(startupTimeoutMs) || startupTimeoutMs < 1_000) {
        throw new Error(
          `${TAG} --startup-timeout-ms must be an integer >= 1000.`,
        );
      }
      if (!Number.isInteger(slowStartupMs) || slowStartupMs < 1) {
        throw new Error(`${TAG} --slow-startup-ms must be an integer >= 1.`);
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
    failOnSlowStartup: parsed.fail,
    startupTimeoutMs: parsed.startupTimeoutMs,
    slowStartupMs: parsed.slowStartupMs,
  };
}

function resolveTargets(options: SlowStartupDetectionOptions): TestTarget[] {
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

function formatStartupSummary(progress: StartupProgress): string {
  const started =
    progress.firstTestSignal ??
    (progress.firstOutputAt
      ? "output only (tests not started)"
      : "waiting for output");
  const startup = startupMs(progress);
  const startupLabel =
    startup === undefined
      ? "not started"
      : startup < 1_000
        ? `${startup}ms`
        : `${Math.round(startup / 1000)}s`;
  return `startup ${startupLabel} — first signal: ${started}`;
}

function processOutputLines(
  text: string,
  lineBuffer: { partial: string },
  target: TestTarget,
  progress: StartupProgress,
): void {
  markStartupOutput(progress);
  lineBuffer.partial += text;
  const lines = lineBuffer.partial.split("\n");
  lineBuffer.partial = lines.pop() ?? "";

  for (const line of lines) {
    if (target.runner === "vitest") {
      applyVitestStartupLine(progress, line);
      continue;
    }
    applyPlaywrightStartupLine(progress, line);
  }
}

type SpawnStartupResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  progress: StartupProgress;
  timedOutReason?: "startup" | "suite";
};

function spawnTargetWithStartupDetection(
  command: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  target: TestTarget,
  context: { startupTimeoutMs: number; suiteTimeoutMs: number },
): Promise<SpawnStartupResult> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const progress = createStartupProgress(startedAt);
    const stdoutLineBuffer = { partial: "" };
    let timedOutReason: "startup" | "suite" | undefined;

    const child = spawn("pnpm", [...command], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const killChild = (reason: "startup" | "suite") => {
      timedOutReason = reason;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }, 5_000);
    };

    const suiteTimeoutHandle = setTimeout(() => {
      killChild("suite");
    }, context.suiteTimeoutMs);

    const monitor = setInterval(() => {
      const waitingForStartup = progress.firstTestAt === undefined;
      const elapsedMs = Date.now() - startedAt;

      if (waitingForStartup && elapsedMs >= context.startupTimeoutMs) {
        killChild("startup");
        return;
      }

      console.log(
        `${TAG}    … ${formatStartupSummary(progress)} (elapsed ${Math.round(elapsedMs / 1000)}s)`,
      );
    }, PROGRESS_LOG_INTERVAL_MS);

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      processOutputLines(text, stdoutLineBuffer, target, progress);
    });

    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      processOutputLines(text, stdoutLineBuffer, target, progress);
    });

    child.on("error", (error) => {
      clearTimeout(suiteTimeoutHandle);
      clearInterval(monitor);
      reject(error);
    });

    child.on("close", (status, signal) => {
      clearTimeout(suiteTimeoutHandle);
      clearInterval(monitor);
      resolve({ status, signal, progress, timedOutReason });
    });
  });
}

async function runTargetStartupCheck(
  target: TestTarget,
  run: number,
  options: SlowStartupDetectionOptions,
): Promise<StartupFinding | undefined> {
  const command = buildFilteredPnpmTestCommand(target, {
    nameFilter: options.nameFilter,
    vitestReporters: ["verbose"],
    playwrightReporters: ["list"],
  });

  const suiteTimeoutMs = Math.max(
    options.startupTimeoutMs * 4,
    options.startupTimeoutMs + 120_000,
  );

  console.log(`${TAG}  → ${target.id} (run ${run}/${options.runs})`);

  const result = await spawnTargetWithStartupDetection(
    command,
    REPO_ROOT,
    process.env,
    target,
    { startupTimeoutMs: options.startupTimeoutMs, suiteTimeoutMs },
  );

  const finding = classifyStartupRun(
    target.id,
    run,
    result.progress,
    options,
    result.timedOutReason,
  );

  if (finding) {
    const detail =
      finding.kind === "neverStarted"
        ? `never started within ${finding.thresholdMs}ms`
        : `slow startup ${finding.startupMs}ms (threshold ${finding.thresholdMs}ms)`;
    console.log(`${TAG}    ⚠ ${detail}`);
    console.log(`${TAG}       last line: ${finding.lastLine}`);
    if (finding.firstTestSignal) {
      console.log(`${TAG}       first signal: ${finding.firstTestSignal}`);
    }
    return finding;
  }

  const measuredStartupMs = startupMs(result.progress);
  console.log(
    `${TAG}    ok in ${measuredStartupMs ?? 0}ms — ${formatStartupSummary(result.progress)}`,
  );

  if (result.status !== 0 && result.timedOutReason === undefined) {
    console.log(
      `${TAG}    note: target exited ${result.status ?? "with signal"} after startup`,
    );
  }

  return undefined;
}

function printReport(
  findings: StartupFinding[],
  runs: number,
  targetCount: number,
): void {
  const merged = mergeStartupFindings(findings);
  const neverStarted = merged.filter((entry) => entry.kind === "neverStarted");
  const slowStartup = merged.filter((entry) => entry.kind === "slowStartup");

  console.log(`\n${TAG} Summary (${runs} run(s) per target)`);
  console.log(`${TAG} Targets checked: ${targetCount}`);
  console.log(`${TAG} Never started: ${neverStarted.length}`);
  console.log(`${TAG} Slow startup: ${slowStartup.length}`);

  if (neverStarted.length > 0) {
    console.log(`\n${TAG} Never started:`);
    for (const entry of neverStarted) {
      console.log(
        `  - [${entry.targetId}] run ${entry.run}: waited ${entry.startupMs}ms` +
          (entry.firstOutputMs !== undefined
            ? ` (first output ${entry.firstOutputMs}ms)`
            : " (no output)") +
          `\n    last line: ${entry.lastLine}`,
      );
    }
  }

  if (slowStartup.length > 0) {
    console.log(`\n${TAG} Slow startup:`);
    for (const entry of slowStartup) {
      console.log(
        `  - [${entry.targetId}] run ${entry.run}: ${entry.startupMs}ms` +
          (entry.firstOutputMs !== undefined
            ? ` (first output ${entry.firstOutputMs}ms)`
            : "") +
          `\n    first signal: ${entry.firstTestSignal ?? entry.lastLine}`,
      );
    }
  }
}

export async function detectSlowStartupTests(
  options: SlowStartupDetectionOptions,
): Promise<StartupFinding[]> {
  const targets = resolveTargets(options);
  const findings: StartupFinding[] = [];

  if (options.build && options.scope !== "e2e") {
    runBuild();
  }

  for (let run = 1; run <= options.runs; run += 1) {
    console.log(`\n${TAG} Run ${run}/${options.runs}`);
    for (const target of targets) {
      const finding = await runTargetStartupCheck(target, run, options);
      if (finding) findings.push(finding);
    }
  }

  printReport(findings, options.runs, targets.length);
  return mergeStartupFindings(findings);
}

const selfResolved = resolve(fileURLToPath(import.meta.url));
const invokedDirectly =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === selfResolved;

if (invokedDirectly) {
  parseSlowStartupDetectionArgs(process.argv.slice(2))
    .then((options) =>
      detectSlowStartupTests(options).then((findings) => {
        if (findings.length > 0 && options.failOnSlowStartup) {
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
