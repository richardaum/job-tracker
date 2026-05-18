#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

import { tryRun } from "@job-tracker/try-run";

export const GLOBAL_REGISTRY_PATH = "/tmp/job-tracker-ports.json";
export const SLUG_REGISTRY_PREFIX = "/tmp/job-tracker-";
export const SLUG_REGISTRY_SUFFIX = ".ports.json";

export const API_WEB_PORT_MIN = 3102;
export const API_WEB_PORT_MAX = 3198;
export const STORYBOOK_PORT_MIN = 6006;
export const STORYBOOK_PORT_MAX = 6099;
export const WXT_PORT_MIN = 3001;
export const WXT_PORT_MAX = 3099;

/** Reserved for main checkout defaults — worktree allocator skips these. */
export const MAIN_RESERVED_PORTS = new Set([3100, 3101, 6006, 3001]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,14}[a-z0-9])?$/;

export type PortKey = "api" | "web" | "storybook" | "wxt";

export type SlugPorts = Record<PortKey, number>;

export type GlobalRegistry = {
  slugs: Record<string, SlugPorts & { updatedAt?: string }>;
};

export type WorktreeEnvMap = Record<string, string>;

const REQUIRED_API_SECRET_KEYS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

export function slugRegistryPath(slug: string): string {
  return `${SLUG_REGISTRY_PREFIX}${slug}${SLUG_REGISTRY_SUFFIX}`;
}

export function runGit(
  args: string[],
  cwd: string,
): { ok: true; stdout: string } | { ok: false; stderr: string } {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    return { ok: false, stderr: (result.stderr || result.stdout || "").trim() };
  }
  return { ok: true, stdout: (result.stdout || "").trim() };
}

export function isGitWorktreeCheckout(cwd: string): boolean {
  const gitDir = runGit(["rev-parse", "--git-dir"], cwd);
  const gitCommon = runGit(["rev-parse", "--git-common-dir"], cwd);
  if (!gitDir.ok || !gitCommon.ok) return false;
  return gitDir.stdout !== gitCommon.stdout;
}

export function resolveWorktreeRoot(cwd: string): string | undefined {
  const top = runGit(["rev-parse", "--show-toplevel"], cwd);
  return top.ok ? top.stdout : undefined;
}

/** First `git worktree list` entry is the primary (main) checkout. */
export function resolveMainWorktreeRoot(cwd: string): string | undefined {
  const listed = runGit(["worktree", "list", "--porcelain"], cwd);
  if (!listed.ok) return undefined;
  for (const line of listed.stdout.split("\n")) {
    if (line.startsWith("worktree ")) {
      return line.slice("worktree ".length).trim();
    }
  }
  return undefined;
}

export function deriveSlug(cwd: string): string | undefined {
  const root = resolveWorktreeRoot(cwd);
  if (!root) return undefined;
  let slug = basenameToSlug(root.split("/").pop() ?? "");
  if (slug === "job-tracker") {
    const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
    if (branch.ok && branch.stdout !== "HEAD") {
      slug = branchToSlug(branch.stdout);
    }
  }
  return validateSlug(slug) ? slug : undefined;
}

function basenameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[_\s/]+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
}

function branchToSlug(branch: string): string {
  return basenameToSlug(branch.replace(/^refs\/heads\//, ""));
}

export function validateSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 16;
}

export function isPortListening(port: number): boolean {
  const result = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function parseJsonOrUndefined(raw: string): unknown {
  const [, parsed] = tryRun(() => JSON.parse(raw) as unknown);
  return parsed ?? undefined;
}

export function readGlobalRegistry(): GlobalRegistry {
  if (!existsSync(GLOBAL_REGISTRY_PATH)) {
    return { slugs: {} };
  }
  const parsed = parseJsonOrUndefined(
    readFileSync(GLOBAL_REGISTRY_PATH, "utf8"),
  ) as GlobalRegistry | undefined;
  if (parsed && typeof parsed.slugs === "object") return parsed;
  return { slugs: {} };
}

export function writeGlobalRegistry(registry: GlobalRegistry): void {
  writeJsonAtomic(GLOBAL_REGISTRY_PATH, registry);
}

export function readSlugRegistry(slug: string): SlugPorts | undefined {
  const path = slugRegistryPath(slug);
  if (!existsSync(path)) return undefined;
  const parsed = parseJsonOrUndefined(readFileSync(path, "utf8")) as
    | SlugPorts
    | undefined;
  if (
    parsed &&
    Number.isInteger(parsed.api) &&
    Number.isInteger(parsed.web) &&
    Number.isInteger(parsed.storybook) &&
    Number.isInteger(parsed.wxt)
  ) {
    return parsed;
  }
  return undefined;
}

export function writeSlugRegistry(slug: string, ports: SlugPorts): void {
  writeJsonAtomic(slugRegistryPath(slug), ports);
}

function writeJsonAtomic(path: string, data: unknown): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

function allAllocatedPorts(registry: GlobalRegistry): Set<number> {
  const set = new Set<number>();
  for (const entry of Object.values(registry.slugs)) {
    set.add(entry.api);
    set.add(entry.web);
    set.add(entry.storybook);
    set.add(entry.wxt);
  }
  return set;
}

function portRangeFor(key: PortKey): { min: number; max: number } {
  switch (key) {
    case "api":
    case "web":
      return { min: API_WEB_PORT_MIN, max: API_WEB_PORT_MAX };
    case "storybook":
      return { min: STORYBOOK_PORT_MIN, max: STORYBOOK_PORT_MAX };
    case "wxt":
      return { min: WXT_PORT_MIN, max: WXT_PORT_MAX };
  }
}

function canReusePort(
  port: number,
  slug: string,
  key: PortKey,
  registry: GlobalRegistry,
): boolean {
  if (MAIN_RESERVED_PORTS.has(port)) return false;
  const owner = Object.entries(registry.slugs).find(
    ([s, p]) =>
      s !== slug &&
      (p.api === port ||
        p.web === port ||
        p.storybook === port ||
        p.wxt === port),
  );
  if (owner) return false;
  if (!isPortListening(port)) return true;
  const mine = registry.slugs[slug];
  return mine?.[key] === port;
}

export function allocatePorts(
  slug: string,
  registry: GlobalRegistry,
): SlugPorts {
  const existing = registry.slugs[slug] ?? readSlugRegistry(slug);
  const allocated = allAllocatedPorts(registry);
  const result = {} as SlugPorts;

  for (const key of ["api", "web", "storybook", "wxt"] as const) {
    const preferred = existing?.[key];
    if (
      preferred !== undefined &&
      canReusePort(preferred, slug, key, registry)
    ) {
      result[key] = preferred;
      allocated.delete(preferred);
      continue;
    }
    const { min, max } = portRangeFor(key);
    let found: number | undefined;
    for (let port = min; port <= max; port++) {
      if (MAIN_RESERVED_PORTS.has(port)) continue;
      if (allocated.has(port)) continue;
      if (isPortListening(port)) continue;
      found = port;
      break;
    }
    if (found === undefined) {
      throw new Error(
        `No free port for ${key} in range ${min}-${max} (slug=${slug}).`,
      );
    }
    result[key] = found;
    allocated.add(found);
  }

  if (result.api === result.web) {
    throw new Error("API and web ports must differ.");
  }

  return result;
}

export function parseEnvFile(content: string): WorktreeEnvMap {
  const map: WorktreeEnvMap = {};
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

export function readApiEnvFromPath(envPath: string): WorktreeEnvMap {
  if (!existsSync(envPath)) {
    throw new Error(`Missing API env at ${envPath}`);
  }
  return parseEnvFile(readFileSync(envPath, "utf8"));
}

export function extractRequiredSecrets(apiEnv: WorktreeEnvMap): WorktreeEnvMap {
  const out: WorktreeEnvMap = {};
  const missing: string[] = [];
  for (const key of REQUIRED_API_SECRET_KEYS) {
    const value = apiEnv[key]?.trim();
    if (!value) missing.push(key);
    else out[key] = value;
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required secrets in source apps/api/.env: ${missing.join(", ")}`,
    );
  }
  for (const optional of ["OPENAI_API_KEY", "OPENAI_MODEL", "SENTRY_DSN"]) {
    if (apiEnv[optional]?.trim()) out[optional] = apiEnv[optional].trim();
  }
  return out;
}

export function parseDatabaseName(databaseUrl: string): string | undefined {
  const match = /^[^:/?#]+:\/\/[^/?#]*\/([^/?#]+)/.exec(databaseUrl);
  return match?.[1];
}

export function buildDestinationDatabaseUrl(
  sourceUrl: string,
  slug: string,
): string {
  const url = new URL(sourceUrl);
  url.pathname = `/${dbNameForSlug(slug)}`;
  return url.toString();
}

export function dbNameForSlug(slug: string): string {
  return `job_tracker_${slug.replaceAll("-", "_")}`;
}

export function databaseExists(dbName: string): boolean {
  const result = spawnSync(
    "psql",
    [
      "-d",
      "postgres",
      "-tAc",
      `SELECT 1 FROM pg_database WHERE datname='${dbName.replaceAll("'", "''")}'`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return result.stdout.trim() === "1";
}

export function cloneDatabase(
  sourceDb: string,
  destDb: string,
  opts?: { force?: boolean },
): void {
  if (databaseExists(destDb) && !opts?.force) {
    console.warn(
      `[worktree:env] Database ${destDb} already exists — skipping clone.`,
    );
    return;
  }
  if (databaseExists(destDb) && opts?.force) {
    spawnOrThrow("dropdb", [destDb]);
  }
  spawnOrThrow("createdb", [destDb]);
  const dump = spawnSync("pg_dump", ["--no-owner", sourceDb], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (dump.status !== 0) {
    throw new Error(
      `pg_dump failed for ${sourceDb}: ${dump.stderr || dump.stdout}`,
    );
  }
  const load = spawnSync("psql", [destDb], {
    input: dump.stdout,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (load.status !== 0) {
    throw new Error(
      `psql load failed for ${destDb}: ${load.stderr || load.stdout}`,
    );
  }
}

function spawnOrThrow(cmd: string, args: string[]): void {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(" ")} failed (exit ${result.status ?? "?"}).`,
    );
  }
}

export function formatEnvWorktree(entries: WorktreeEnvMap): string {
  const lines = [
    "# Generated by pnpm worktree:env — do not commit.",
    "# Re-run is idempotent: ports/DB reused when possible; file regenerated.",
    "",
  ];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`${key}=${escapeEnvValue(value)}`);
  }
  lines.push("");
  return lines.join("\n");
}

function escapeEnvValue(value: string): string {
  if (/^[A-Za-z0-9_./:@-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

export function buildWorktreeEnv(params: {
  slug: string;
  ports: SlugPorts;
  secrets: WorktreeEnvMap;
  databaseUrl: string;
}): WorktreeEnvMap {
  const { slug, ports, secrets, databaseUrl } = params;
  const apiUrl = `http://localhost:${ports.api}`;
  const webUrl = `http://localhost:${ports.web}`;
  const resetPorts = [ports.api, ports.web, ports.storybook, ports.wxt].join(
    ",",
  );

  return {
    WORKTREE_SLUG: slug,
    PM2_NAMESPACE: `job-tracker-${slug}`,
    PM2_APP_PREFIX: slug,
    PM2_RESET_PORTS: resetPorts,
    API_PORT: String(ports.api),
    WEB_PORT: String(ports.web),
    DATABASE_URL: databaseUrl,
    WEB_URL: webUrl,
    GOOGLE_CALLBACK_URL: `${apiUrl}/auth/google/callback`,
    AUTH_BYPASS_ENABLED: "true",
    NEXT_PUBLIC_API_URL: apiUrl,
    STORYBOOK_PORT: String(ports.storybook),
    WXT_DEV_PORT: String(ports.wxt),
    WXT_PUBLIC_API_URL: apiUrl,
    WXT_PUBLIC_WEB_URL: webUrl,
    ...secrets,
    NODE_ENV: "development",
  };
}

export function loadEnvWorktree(root: string): WorktreeEnvMap {
  const path = join(root, ".env.worktree");
  if (!existsSync(path)) return {};
  return parseEnvFile(readFileSync(path, "utf8"));
}

export function removeSlugFromRegistry(slug: string): void {
  const registry = readGlobalRegistry();
  delete registry.slugs[slug];
  writeGlobalRegistry(registry);
  const slugPath = slugRegistryPath(slug);
  if (existsSync(slugPath)) unlinkSync(slugPath);
}
