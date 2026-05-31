#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { tryRun } from "@job-tracker/try-run";

import { deriveSlug } from "./derive-slug.ts";
import { worktreeEnv } from "./env.ts";

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

export type GlobalRegistry = { slugs: Record<string, SlugPorts & { updatedAt?: string }> };

export type WorktreeEnvMap = Record<string, string>;

const REQUIRED_API_SECRET_KEYS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

/** Per-slug port cache file under `/tmp` (survives global registry edits). */
export function slugRegistryPath(slug: string): string {
  return `${SLUG_REGISTRY_PREFIX}${slug}${SLUG_REGISTRY_SUFFIX}`;
}

/** Git subprocess wrapper that never throws — callers branch on `ok`. */
export function runGit(args: string[], cwd: string): { ok: true; stdout: string } | { ok: false; stderr: string } {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    return { ok: false, stderr: (result.stderr || result.stdout || "").trim() };
  }
  return { ok: true, stdout: (result.stdout || "").trim() };
}

function gitPathReal(cwd: string, flag: "--git-dir" | "--git-common-dir"): string | undefined {
  const resolved = runGit(["rev-parse", flag], cwd);
  if (!resolved.ok) return undefined;
  const raw = resolved.stdout;
  const candidate = raw.startsWith("/") ? raw : join(cwd, raw);
  const [err, real] = tryRun(() => realpathSync(candidate));
  return err ? undefined : real;
}

/** True when `.git` is not the shared bare/common dir (linked worktree checkout). */
export function isGitWorktreeCheckout(cwd: string): boolean {
  const gitDir = gitPathReal(cwd, "--git-dir");
  const gitCommon = gitPathReal(cwd, "--git-common-dir");
  if (!gitDir || !gitCommon) return false;
  return gitDir !== gitCommon;
}

/** Filesystem root of the checkout `cwd` belongs to. */
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

/** Enforces kebab-case, 1–16 chars, no leading/trailing hyphen. */
export function validateSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 16;
}

/** Uses `lsof` so allocation skips ports already bound on the host. */
export function isPortListening(port: number): boolean {
  const result = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

/** Parses registry JSON without throwing on corrupt files. */
function parseJsonOrUndefined(raw: string): unknown {
  const [err, parsed] = tryRun(() => JSON.parse(raw) as unknown);
  return err ? undefined : parsed;
}

/** Loads `/tmp/job-tracker-ports.json` or an empty registry when missing. */
export function readGlobalRegistry(): GlobalRegistry {
  if (!existsSync(GLOBAL_REGISTRY_PATH)) {
    return { slugs: {} };
  }
  const parsed = parseJsonOrUndefined(readFileSync(GLOBAL_REGISTRY_PATH, "utf8")) as GlobalRegistry | undefined;
  if (parsed && typeof parsed.slugs === "object") return parsed;
  return { slugs: {} };
}

/** Atomically persists the cross-worktree port ownership map. */
export function writeGlobalRegistry(registry: GlobalRegistry): void {
  writeJsonAtomic(GLOBAL_REGISTRY_PATH, registry);
}

/** Reads cached ports for one slug when the global registry entry is gone. */
export function readSlugRegistry(slug: string): SlugPorts | undefined {
  const path = slugRegistryPath(slug);
  if (!existsSync(path)) return undefined;
  const parsed = parseJsonOrUndefined(readFileSync(path, "utf8")) as SlugPorts | undefined;
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

/** Writes the per-slug port snapshot used to reuse allocations across setup runs. */
export function writeSlugRegistry(slug: string, ports: SlugPorts): void {
  writeJsonAtomic(slugRegistryPath(slug), ports);
}

/** Writes via pid-suffixed temp file then rename to avoid partial reads. */
function writeJsonAtomic(path: string, data: unknown): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

/** Flattens every port slot already claimed in the global registry. */
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

/** Maps each app role to its dedicated port band (api/web share a band). */
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

/** Allows keeping a port when it is ours in the registry or nothing is listening. */
function canReusePort(port: number, slug: string, key: PortKey, registry: GlobalRegistry): boolean {
  if (MAIN_RESERVED_PORTS.has(port)) return false;
  const owner = Object.entries(registry.slugs).find(
    ([s, p]) => s !== slug && (p.api === port || p.web === port || p.storybook === port || p.wxt === port),
  );
  if (owner) return false;
  if (!isPortListening(port)) return true;
  const mine = registry.slugs[slug];
  return mine?.[key] === port;
}

/** Picks free ports per slug, preferring prior registry values when still valid. */
export function allocatePorts(slug: string, registry: GlobalRegistry): SlugPorts {
  const existing = registry.slugs[slug] ?? readSlugRegistry(slug);
  const allocated = allAllocatedPorts(registry);
  const result = {} as SlugPorts;

  for (const key of ["api", "web", "storybook", "wxt"] as const) {
    const preferred = existing?.[key];
    if (preferred !== undefined && canReusePort(preferred, slug, key, registry)) {
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
      throw new Error(`No free port for ${key} in range ${min}-${max} (slug=${slug}).`);
    }
    result[key] = found;
    allocated.add(found);
  }

  if (result.api === result.web) {
    throw new Error("API and web ports must differ.");
  }

  return result;
}

/** Minimal dotenv parser (no variable expansion) for `.env` files. */
export function parseEnvFile(content: string): WorktreeEnvMap {
  const map: WorktreeEnvMap = {};
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

/** Loads main-checkout `apps/api/.env` or fails fast when absent. */
export function readApiEnvFromPath(envPath: string): WorktreeEnvMap {
  if (!existsSync(envPath)) {
    throw new Error(`Missing API env at ${envPath}`);
  }
  return parseEnvFile(readFileSync(envPath, "utf8"));
}

/** Copies auth secrets from main API env plus optional OpenAI/Sentry keys. */
export function extractRequiredSecrets(apiEnv: WorktreeEnvMap): WorktreeEnvMap {
  const out: WorktreeEnvMap = {};
  const missing: string[] = [];
  for (const key of REQUIRED_API_SECRET_KEYS) {
    const value = apiEnv[key]?.trim();
    if (!value) missing.push(key);
    else out[key] = value;
  }
  if (missing.length > 0) {
    throw new Error(`Missing required secrets in source apps/api/.env: ${missing.join(", ")}`);
  }
  for (const optional of ["OPENAI_API_KEY", "OPENAI_MODEL", "SENTRY_DSN", "DEV_AUTH_BYPASS_EMAIL"]) {
    if (apiEnv[optional]?.trim()) out[optional] = apiEnv[optional].trim();
  }
  return out;
}

/** Extracts the Postgres database segment from a URL pathname. */
export function parseDatabaseName(databaseUrl: string): string | undefined {
  const match = /^[^:/?#]+:\/\/[^/?#]*\/([^/?#]+)/.exec(databaseUrl);
  return match?.[1];
}

/** Host/port/database only — safe for dry-run logs (no credentials). */
export function formatDatabaseUrlForLog(databaseUrl: string): string {
  const [urlErr, url] = tryRun(() => new URL(databaseUrl));
  if (!urlErr && url) {
    const host = url.hostname || "localhost";
    const port = url.port || "5432";
    const database = parseDatabaseName(databaseUrl) ?? url.pathname.replace(/^\//, "");
    return `host=${host} port=${port} database=${database || "(missing)"}`;
  }
  const database = parseDatabaseName(databaseUrl);
  return database ? `database=${database} (could not parse host/port)` : "database=(invalid url)";
}

/** Rewrites only the DB name to `job_tracker_<slug>` while keeping host/credentials. */
export function buildDestinationDatabaseUrl(sourceUrl: string, slug: string): string {
  const url = new URL(sourceUrl);
  url.pathname = `/${dbNameForSlug(slug)}`;
  return url.toString();
}

/** Postgres identifier: `job_tracker_` plus slug hyphens as underscores. */
export function dbNameForSlug(slug: string): string {
  return `job_tracker_${slug.replaceAll("-", "_")}`;
}

/** Rewrites only the DB name to `job_tracker_test_<slug>` for the E2E test database. */
export function buildDestinationTestDatabaseUrl(sourceUrl: string, slug: string): string {
  const url = new URL(sourceUrl);
  url.pathname = `/${testDbNameForSlug(slug)}`;
  return url.toString();
}

/** Postgres identifier: `job_tracker_test_` plus slug hyphens as underscores. */
export function testDbNameForSlug(slug: string): string {
  return `job_tracker_test_${slug.replaceAll("-", "_")}`;
}

/** Collects main-then-worktree `docker-compose.yml` paths for Postgres discovery. */
function composeFilesForPostgres(repoRoot: string): string[] {
  const files: string[] = [];
  const mainRoot = resolveMainWorktreeRoot(repoRoot);
  if (mainRoot) {
    const mainCompose = join(mainRoot, "docker-compose.yml");
    if (existsSync(mainCompose)) files.push(mainCompose);
  }
  const localCompose = join(repoRoot, "docker-compose.yml");
  if (existsSync(localCompose) && !files.includes(localCompose)) {
    files.push(localCompose);
  }
  return files;
}

/** Resolves the running `postgres` service container id from a compose file. */
function dockerComposePostgresId(composeFile: string): string | undefined {
  const result = spawnSync("docker", ["compose", "-f", composeFile, "ps", "-q", "postgres"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) return undefined;
  return result.stdout
    ?.trim()
    .split("\n")
    .map((line: string) => line.trim())
    .find(Boolean);
}

/** Picks explicit `WORKTREE_POSTGRES_DOCKER`, else compose, else any host on :5432. */
export function resolvePostgresContainer(repoRoot: string): string | undefined {
  const explicit = worktreeEnv.WORKTREE_POSTGRES_DOCKER;
  if (explicit) return explicit;

  for (const composeFile of composeFilesForPostgres(repoRoot)) {
    const id = dockerComposePostgresId(composeFile);
    if (id) return id;
  }

  const listed = spawnSync("docker", ["ps", "--filter", "publish=5432", "--filter", "status=running", "-q"], {
    encoding: "utf8",
  });
  return listed.stdout?.trim().split(/\s+/).find(Boolean);
}

/** Postgres role for docker exec / local psql (default from worktreeEnv). */
function pgUser(): string {
  return worktreeEnv.WORKTREE_POSTGRES_USER;
}

/** Runs a Postgres CLI locally or via `docker exec` when a container is detected. */
function pgSpawn(
  repoRoot: string,
  command: string,
  args: string[],
  opts?: { input?: string; stdio?: "inherit" | ["ignore", "pipe", "pipe"]; encoding?: "utf8" },
): ReturnType<typeof spawnSync> {
  const container = resolvePostgresContainer(repoRoot);
  const maxBuffer = 50 * 1024 * 1024;
  const stdio =
    opts?.stdio ?? (opts?.encoding ? ["pipe", "pipe", "pipe"] : opts?.input !== undefined ? "pipe" : "inherit");

  if (!container) {
    return spawnSync(command, args, { encoding: opts?.encoding, input: opts?.input, stdio, maxBuffer });
  }

  const dockerArgs = ["exec"];
  if (opts?.input !== undefined) dockerArgs.push("-i");
  dockerArgs.push(container, command, "-U", pgUser(), ...args);

  return spawnSync("docker", dockerArgs, { encoding: opts?.encoding, input: opts?.input, stdio, maxBuffer });
}

/** Like `pgSpawn` but surfaces non-zero exit as an Error. */
function pgSpawnOrThrow(repoRoot: string, command: string, args: string[]): void {
  const result = pgSpawn(repoRoot, command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (exit ${result.status ?? "?"}).`);
  }
}

/** Single-quoted string safe for `sh -c` inside docker exec. */
function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

/** Ensures docker Postgres or a local `psql` exists before clone/drop. */
function assertPostgresAvailable(repoRoot: string): void {
  if (resolvePostgresContainer(repoRoot)) return;
  const psqlCheck = spawnSync("psql", ["--version"], { stdio: "ignore" });
  if (psqlCheck.status === 0) return;
  throw new Error(
    "PostgreSQL client not found. Install psql, start Postgres via docker compose, " +
      "or set WORKTREE_POSTGRES_DOCKER (e.g. job-tracker-postgres-1).",
  );
}

export type DatabaseExistsStatus = "exists" | "missing" | "error";

/** Queries `pg_database` — distinguishes missing DB from psql failures. */
export function checkDatabaseExists(
  dbName: string,
  repoRoot: string,
): { status: DatabaseExistsStatus; detail?: string } {
  const result = pgSpawn(
    repoRoot,
    "psql",
    ["-d", "postgres", "-tAc", `SELECT 1 FROM pg_database WHERE datname='${dbName.replaceAll("'", "''")}'`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").toString().trim();
    return { status: "error", detail: detail || `psql exited ${result.status ?? "?"}` };
  }
  const stdout = result.stdout;
  const text = typeof stdout === "string" ? stdout : (stdout?.toString("utf8") ?? "");
  return { status: text.trim() === "1" ? "exists" : "missing" };
}

/** True when the database name exists (psql errors → false). */
export function databaseExists(dbName: string, repoRoot: string): boolean {
  return checkDatabaseExists(dbName, repoRoot).status === "exists";
}

function tryDropDatabaseQuiet(dbName: string, repoRoot: string, tag: string): void {
  if (checkDatabaseExists(dbName, repoRoot).status !== "exists") return;
  const [err] = tryRun(() => dropDatabase(dbName, repoRoot));
  if (err) {
    console.warn(`${tag} cleanup dropdb ${dbName} failed: ${err.message}`);
  }
}

/** Idempotent clone: skip if dest exists unless `force` drops it first. */
export function cloneDatabase(
  sourceDb: string,
  destDb: string,
  opts?: { force?: boolean; repoRoot?: string; tag?: string },
): void {
  const repoRoot = opts?.repoRoot ?? process.cwd();
  const tag = opts?.tag ?? WORKTREE_SETUP_TAG;
  assertPostgresAvailable(repoRoot);

  const container = resolvePostgresContainer(repoRoot);
  if (container) {
    console.warn(`${tag} postgres CLI via docker (${container})`);
  }

  const existsCheck = checkDatabaseExists(destDb, repoRoot);
  if (existsCheck.status === "error") {
    throw new Error(`Could not check database ${destDb}: ${existsCheck.detail ?? "psql failed"}`);
  }
  if (existsCheck.status === "exists" && !opts?.force) {
    console.warn(`${tag} Database ${destDb} already exists — skipping clone.`);
    return;
  }
  if (existsCheck.status === "exists" && opts?.force) {
    pgSpawnOrThrow(repoRoot, "dropdb", [destDb]);
  }

  pgSpawnOrThrow(repoRoot, "createdb", [destDb]);

  if (container) {
    const user = pgUser();
    const script = `pg_dump -U ${user} --no-owner ${shellQuote(sourceDb)} | psql -U ${user} ${shellQuote(destDb)}`;
    const result = spawnSync("docker", ["exec", container, "sh", "-c", script], { stdio: "inherit" });
    if (result.status !== 0) {
      tryDropDatabaseQuiet(destDb, repoRoot, tag);
      throw new Error(`docker pg_dump|psql clone ${sourceDb} → ${destDb} failed (exit ${result.status ?? "?"}).`);
    }
    return;
  }

  const dump = pgSpawn(repoRoot, "pg_dump", ["--no-owner", sourceDb], { encoding: "utf8" });
  if (dump.status !== 0) {
    tryDropDatabaseQuiet(destDb, repoRoot, tag);
    throw new Error(`pg_dump failed for ${sourceDb}: ${dump.stderr || dump.stdout}`);
  }
  const load = pgSpawn(repoRoot, "psql", [destDb], { input: dump.stdout as string, encoding: "utf8" });
  if (load.status !== 0) {
    tryDropDatabaseQuiet(destDb, repoRoot, tag);
    throw new Error(`psql load failed for ${destDb}: ${load.stderr || load.stdout}`);
  }
}

/** Drops a worktree database via the same docker/local psql path as clone. */
export function dropDatabase(dbName: string, repoRoot: string): void {
  assertPostgresAvailable(repoRoot);
  pgSpawnOrThrow(repoRoot, "dropdb", [dbName]);
}

/** Serializes a flat env map with safe value quoting and optional header lines. */
export function formatEnvFile(entries: WorktreeEnvMap, header?: string[]): string {
  const lines = header ? [...header, ""] : [];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`${key}=${escapeEnvValue(value)}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Merges `overrides` into an existing `.env` file map (override wins when key exists). */
export function mergeEnvMap(base: WorktreeEnvMap, overrides: WorktreeEnvMap): WorktreeEnvMap {
  return { ...base, ...overrides };
}

/** JSON-quotes values that would break naive `KEY=value` parsing. */
function escapeEnvValue(value: string): string {
  if (/^[A-Za-z0-9_./:@-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

/** API-specific overrides to merge into worktree's `apps/api/.env`. */
export function buildWorktreeApiEnv(params: {
  ports: SlugPorts;
  databaseUrl: string;
  e2eDatabaseUrl: string;
}): WorktreeEnvMap {
  const { ports, databaseUrl, e2eDatabaseUrl } = params;

  return {
    DATABASE_URL: databaseUrl,
    DATABASE_INTEGRATION_URL: e2eDatabaseUrl,
    PORT: String(ports.api),
    GOOGLE_CALLBACK_URL: `http://localhost:${ports.api}/auth/google/callback`,
    WEB_URL: `http://localhost:${ports.web}`,
    RATE_LIMIT_DISABLED: "true",
  };
}

/** Web-specific vars to write into worktree's `apps/web/.env`. */
export function buildWorktreeWebEnv(params: { ports: SlugPorts }): WorktreeEnvMap {
  const { ports } = params;

  return { PORT: String(ports.web), NEXT_PUBLIC_API_URL: `http://localhost:${ports.api}`, E2E_PORT: String(ports.web) };
}

/** Storybook port — written to `packages/ui/.env`. */
export function buildWorktreeStorybookEnv(params: { ports: SlugPorts }): WorktreeEnvMap {
  return { STORYBOOK_PORT: String(params.ports.storybook) };
}

/** Extension port and URLs — written to `apps/extension/.env`. */
export function buildWorktreeExtensionEnv(params: { ports: SlugPorts }): WorktreeEnvMap {
  const { ports } = params;

  return {
    WXT_DEV_PORT: String(ports.wxt),
    WXT_PUBLIC_API_URL: `http://localhost:${ports.api}`,
    WXT_PUBLIC_WEB_URL: `http://localhost:${ports.web}`,
  };
}
/** Reads PM2_RESET_PORTS from the slug registry for the current worktree. */
export function loadWorktreeResetPorts(repoRoot: string): string | undefined {
  const root = resolveWorktreeRoot(repoRoot);
  if (!root) return undefined;
  const slug = deriveSlug(root);
  if (!validateSlug(slug) || slug === "job-tracker") return undefined;
  const ports = readSlugRegistry(slug);
  if (!ports) return undefined;
  return `${ports.api},${ports.web},${ports.storybook},${ports.wxt}`;
}

/** Injects PM2_RESET_PORTS into process.env from the slug registry. */
export function loadWorktreeEnvIntoProcess(repoRoot: string): void {
  const resetPorts = loadWorktreeResetPorts(repoRoot);
  if (resetPorts && process.env.PM2_RESET_PORTS === undefined) {
    process.env.PM2_RESET_PORTS = resetPorts;
  }
}

/** Removes slug from global registry and deletes its per-slug port file. */
export function removeSlugFromRegistry(slug: string): void {
  const registry = readGlobalRegistry();
  delete registry.slugs[slug];
  writeGlobalRegistry(registry);
  const slugPath = slugRegistryPath(slug);
  if (existsSync(slugPath)) unlinkSync(slugPath);
}

/** Path to the VS Code workspace file in the repository root. */
export const WORKSPACE_FILE = "job-tracker.code-workspace";

export function resolveWorkspacePath(repoRoot: string): string {
  return join(repoRoot, WORKSPACE_FILE);
}

/** Parses workspace JSON, returning folders array and settings object. */
function readWorkspace(
  workspacePath: string,
): { folders: { name: string; path: string }[]; settings: unknown } | undefined {
  if (!existsSync(workspacePath)) return undefined;
  const [err, parsed] = tryRun(() => JSON.parse(readFileSync(workspacePath, "utf8")) as unknown);
  if (err || !parsed || typeof parsed !== "object") return undefined;
  const ws = parsed as Record<string, unknown>;
  const folders = Array.isArray(ws.folders) ? ws.folders : [];
  const validFolders = folders.filter(
    (f: unknown): f is { name: string; path: string } =>
      typeof f === "object" &&
      f !== null &&
      typeof (f as Record<string, unknown>).name === "string" &&
      typeof (f as Record<string, unknown>).path === "string",
  );
  return { folders: validFolders, settings: ws.settings };
}

/** Writes the workspace file atomically. */
function writeWorkspace(workspacePath: string, folders: { name: string; path: string }[], settings: unknown): void {
  const content = { folders, settings };
  writeJsonAtomic(workspacePath, content);
}

/** Adds a worktree entry to the workspace file. Idempotent — skips if path already present. */
export function addWorktreeToWorkspace(params: {
  mainRoot: string;
  slug: string;
  worktreeRoot: string;
  tag: string;
}): void {
  const { mainRoot, slug, worktreeRoot, tag } = params;
  const workspacePath = resolveWorkspacePath(mainRoot);
  const ws = readWorkspace(workspacePath);
  if (!ws) {
    console.warn(`${tag} workspace file not found or invalid at ${workspacePath} — skipping.`);
    return;
  }

  const relPath = relative(mainRoot, worktreeRoot);
  const alreadyExists = ws.folders.some((f) => f.path === relPath);
  if (alreadyExists) {
    console.warn(`${tag} workspace already has entry for ${slug} (${relPath}) — skipping.`);
    return;
  }

  ws.folders.push({ name: slug, path: relPath });
  writeWorkspace(workspacePath, ws.folders, ws.settings);
  console.warn(`${tag} added ${slug} (${relPath}) to ${WORKSPACE_FILE}`);
}

/** Removes a worktree entry from the workspace file by slug. No-op if not found. */
export function removeWorktreeFromWorkspace(params: { mainRoot: string; slug: string; tag: string }): void {
  const { mainRoot, slug, tag } = params;
  const workspacePath = resolveWorkspacePath(mainRoot);
  const ws = readWorkspace(workspacePath);
  if (!ws) {
    console.warn(`${tag} workspace file not found or invalid at ${workspacePath} — skipping.`);
    return;
  }

  const index = ws.folders.findIndex((f) => f.name === slug);
  if (index === -1) {
    console.warn(`${tag} workspace has no entry for slug ${slug} — skipping.`);
    return;
  }

  const removed = ws.folders.splice(index, 1)[0];
  writeWorkspace(workspacePath, ws.folders, ws.settings);
  console.warn(`${tag} removed ${slug} (${removed.path}) from ${WORKSPACE_FILE}`);
}

export const WORKTREE_SETUP_TAG = "[worktree:setup]";
export const WORKTREE_TEARDOWN_TAG = "[worktree:teardown]";

/** Logs tagged stderr, exits 1, and satisfies `never` for TypeScript control flow. */
export function worktreeFail(tag: string, message: string): never {
  console.error(`${tag} ${message}`);
  process.exit(1);
  throw new Error(message);
}

/** PM2 process names for the four dev apps under a worktree prefix. */
export function worktreePm2AppNames(prefix: string): string[] {
  return [`${prefix}-api`, `${prefix}-web`, `${prefix}-storybook`, `${prefix}-extension`];
}

/** Runs `pm2 delete` and fails on non-zero exit. */
export function pm2DeleteApps(repoRoot: string, names: string[], tag: string): void {
  if (names.length === 0) return;
  const result = spawnSync("pm2", ["delete", ...names], { cwd: repoRoot, stdio: "inherit" });
  if (result.status !== 0) {
    worktreeFail(tag, `pm2 delete failed (exit ${result.status ?? "?"}).`);
  }
}

function spawnPnpmOrFail(repoRoot: string, args: string[], tag: string, env?: WorktreeEnvMap): void {
  const result = spawnSync("pnpm", args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: env ? { ...process.env, ...env } : process.env,
  });
  if (result.status !== 0) {
    worktreeFail(tag, `pnpm ${args.join(" ")} failed (exit ${result.status ?? "?"}).`);
  }
}

function curlCheck(url: string, tag: string, label: string): void {
  const result = spawnSync("curl", ["-fsS", url], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    worktreeFail(tag, `verify ${label} failed for ${url}: ${(result.stderr || "").toString().trim()}`);
  }
  console.warn(`${tag} verify ${label} ok ${url}`);
}

/** Worktree web app URL for the allocated port. */
export function worktreeWebUrl(ports: SlugPorts): string {
  return `http://localhost:${ports.web}/`;
}

/** Opens `url` in the system default browser (best-effort; warns on failure). */
export function openWebBrowser(url: string, tag: string): void {
  const command =
    process.platform === "darwin"
      ? { cmd: "open", args: [url] }
      : process.platform === "win32"
        ? { cmd: "cmd", args: ["/c", "start", "", url] }
        : { cmd: "xdg-open", args: [url] };

  const result = spawnSync(command.cmd, command.args, { stdio: "ignore" });
  if (result.status !== 0) {
    console.warn(`${tag} could not open browser for ${url}`);
    return;
  }
  console.warn(`${tag} opened browser ${url}`);
}

/** Aborts setup/teardown when invoked from the main checkout. */
export function assertGitWorktree(repoRoot: string, tag: string): void {
  if (isGitWorktreeCheckout(repoRoot)) return;
  worktreeFail(tag, "Refusing to run on the main checkout. Create a git worktree first, then run from that path.");
}

/** Returns worktree root or exits — used after `assertGitWorktree`. */
export function requireWorktreeRoot(repoRoot: string, tag: string): string {
  const worktreeRoot = resolveWorktreeRoot(repoRoot);
  if (worktreeRoot) return worktreeRoot;
  worktreeFail(tag, "Could not resolve worktree root.");
}

/** Resolves slug from path/branch and exits when it fails validation. */
export function requireValidSlug(repoRoot: string, tag: string): string {
  const root = resolveWorktreeRoot(repoRoot);
  if (!root) {
    worktreeFail(tag, "Could not resolve worktree root.");
  }
  const slug = deriveSlug(root);
  if (validateSlug(slug)) return slug;
  worktreeFail(
    tag,
    `Invalid slug derived from path/branch. Use a kebab-case directory name (≤16 chars). Got: ${JSON.stringify(slug)}`,
  );
}

/** Ensures clone source DB name is set via CLI arg or worktreeEnv. */
export function requireSourceDb(sourceDb: string | undefined, tag: string): string {
  if (sourceDb) return sourceDb;
  worktreeFail(
    tag,
    "WORKTREE_SOURCE_DB is required.\n" +
      "  export WORKTREE_SOURCE_DB=job_tracker\n" +
      "  pnpm worktree:setup\n" +
      "Or: pnpm worktree:setup -- --source-db job_tracker",
  );
}

/** Returns primary checkout path where `apps/api/.env` lives. */
export function requireMainWorktreeRoot(repoRoot: string, tag: string): string {
  const mainRoot = resolveMainWorktreeRoot(repoRoot);
  if (mainRoot) return mainRoot;
  worktreeFail(tag, "Could not resolve main worktree (source for apps/api/.env secrets).");
}

export type MainApiEnvForWorktree = { secrets: WorktreeEnvMap; databaseUrl: string; destDb: string };

/** Pulls secrets and destination `DATABASE_URL` from main API env for one slug. */
export function loadMainApiEnvForWorktree(mainRoot: string, slug: string, tag: string): MainApiEnvForWorktree {
  const sourceApiEnvPath = join(mainRoot, "apps/api/.env");
  if (!existsSync(sourceApiEnvPath)) {
    worktreeFail(tag, `Missing API env at ${sourceApiEnvPath}`);
  }
  const sourceApiEnv = readApiEnvFromPath(sourceApiEnvPath);
  const sourceDatabaseUrl = sourceApiEnv.DATABASE_URL;
  if (!sourceDatabaseUrl) {
    worktreeFail(tag, `DATABASE_URL missing in ${sourceApiEnvPath}`);
  }
  return {
    secrets: extractRequiredSecrets(sourceApiEnv),
    databaseUrl: buildDestinationDatabaseUrl(sourceDatabaseUrl, slug),
    destDb: dbNameForSlug(slug),
  };
}

/** Setup-step wrapper that logs slug and delegates to `cloneDatabase`. */
export function cloneWorktreeDatabase(params: {
  tag: string;
  slug: string;
  sourceDb: string;
  destDb: string;
  worktreeRoot: string;
  recreateDb: boolean;
}): void {
  const { tag, slug, sourceDb, destDb, worktreeRoot, recreateDb } = params;
  console.warn(`${tag} slug=${slug}`);
  console.warn(`${tag} cloning ${sourceDb} → ${destDb}`);
  cloneDatabase(sourceDb, destDb, { force: recreateDb, repoRoot: worktreeRoot, tag });
}

/** Creates an empty test database for the worktree (no data clone needed). */
export function cloneWorktreeTestDatabase(params: {
  tag: string;
  slug: string;
  testDbName: string;
  worktreeRoot: string;
  recreateDb: boolean;
}): void {
  const { tag, slug, testDbName, worktreeRoot, recreateDb } = params;
  console.warn(`${tag} slug=${slug}`);
  assertPostgresAvailable(worktreeRoot);

  const existsCheck = checkDatabaseExists(testDbName, worktreeRoot);
  if (existsCheck.status === "error") {
    throw new Error(`Could not check test database ${testDbName}: ${existsCheck.detail ?? "psql failed"}`);
  }
  if (existsCheck.status === "exists" && !recreateDb) {
    console.warn(`${tag} Test database ${testDbName} already exists — skipping.`);
    return;
  }
  if (existsCheck.status === "exists" && recreateDb) {
    pgSpawnOrThrow(worktreeRoot, "dropdb", [testDbName]);
  }

  console.warn(`${tag} creating test database ${testDbName}`);
  pgSpawnOrThrow(worktreeRoot, "createdb", [testDbName]);
}

/** Allocates ports for dry-run without writing registry files. */
export function previewWorktreePorts(slug: string): SlugPorts {
  const registry = readGlobalRegistry();
  return allocatePorts(slug, registry);
}

/** Allocates ports and persists both global and per-slug registry entries. */
export function registerWorktreePorts(slug: string): SlugPorts {
  const registry = readGlobalRegistry();
  const ports = allocatePorts(slug, registry);
  registry.slugs[slug] = { ...ports, updatedAt: new Date().toISOString() };
  writeGlobalRegistry(registry);
  writeSlugRegistry(slug, ports);
  return ports;
}

/** Human-readable clone action for dry-run (skip, replace, or fresh create). */
export function describeWorktreeClonePlan(params: {
  sourceDb: string;
  destDb: string;
  worktreeRoot: string;
  recreateDb: boolean;
}): string {
  const check = checkDatabaseExists(params.destDb, params.worktreeRoot);
  if (check.status === "error") {
    return `unknown (psql check failed: ${check.detail ?? "error"})`;
  }
  if (check.status === "exists" && !params.recreateDb) {
    return "skip (database exists; use --recreate-db=true to replace)";
  }
  if (check.status === "exists" && params.recreateDb) {
    return "drop existing database, then pg_dump | psql clone";
  }
  return "createdb + pg_dump | psql clone";
}

/** Writes per-app `.env` files for the worktree. */
export function writeWorktreeAppEnvs(params: {
  worktreeRoot: string;
  mainRoot: string;
  ports: SlugPorts;
  databaseUrl: string;
  e2eDatabaseUrl: string;
}): { apiEnvPath: string; webEnvPath: string; storybookEnvPath: string; extensionEnvPath: string } {
  const { worktreeRoot, mainRoot, ports, databaseUrl, e2eDatabaseUrl } = params;

  const apiBasePath = join(worktreeRoot, "apps/api/.env");
  const mainApiEnvPath = join(mainRoot, "apps/api/.env");
  const apiBase = existsSync(mainApiEnvPath) ? parseEnvFile(readFileSync(mainApiEnvPath, "utf8")) : {};
  const apiOverrides = buildWorktreeApiEnv({ ports, databaseUrl, e2eDatabaseUrl });
  const apiMerged = mergeEnvMap(apiBase, apiOverrides);
  writeFileSync(
    apiBasePath,
    formatEnvFile(apiMerged, [
      "# Worktree env — generated by pnpm worktree:setup.",
      "# Overrides merged on top of main-checkout apps/api/.env.",
    ]),
    "utf8",
  );

  const webEnvPath = join(worktreeRoot, "apps/web/.env");
  const webEnv = buildWorktreeWebEnv({ ports });
  writeFileSync(webEnvPath, formatEnvFile(webEnv, ["# Worktree env — generated by pnpm worktree:setup."]), "utf8");

  const storybookEnvPath = join(worktreeRoot, "packages/ui/.env");
  const storybookEnv = buildWorktreeStorybookEnv({ ports });
  writeFileSync(
    storybookEnvPath,
    formatEnvFile(storybookEnv, ["# Worktree env — generated by pnpm worktree:setup."]),
    "utf8",
  );

  const extensionEnvPath = join(worktreeRoot, "apps/extension/.env");
  const extensionEnv = buildWorktreeExtensionEnv({ ports });
  writeFileSync(
    extensionEnvPath,
    formatEnvFile(extensionEnv, ["# Worktree env — generated by pnpm worktree:setup."]),
    "utf8",
  );

  return { apiEnvPath: apiBasePath, webEnvPath, storybookEnvPath, extensionEnvPath };
}

/** Prints the full setup plan when `--dry-run` is set. */
export function logSetupDryRun(params: {
  tag: string;
  worktreeRoot: string;
  mainRoot: string;
  slug: string;
  sourceDb: string;
  destDb: string;
  databaseUrl: string;
  e2eDatabaseUrl: string;
  recreateDb: boolean;
  dbeaver: boolean;
  forceDbeaver: boolean;
  ports: SlugPorts;
  install: boolean;
  migrate: boolean;
  start: boolean;
  verify: boolean;
  open: boolean;
  workspacePath: string;
}): void {
  const {
    tag,
    worktreeRoot,
    mainRoot,
    slug,
    sourceDb,
    destDb,
    databaseUrl,
    e2eDatabaseUrl,
    recreateDb,
    dbeaver,
    forceDbeaver,
    ports,
    install,
    migrate,
    start,
    verify,
    open,
    workspacePath,
  } = params;
  const apiEnvPath = join(worktreeRoot, "apps/api/.env");
  const webEnvPath = join(worktreeRoot, "apps/web/.env");
  const storybookEnvPath = join(worktreeRoot, "packages/ui/.env");
  const extensionEnvPath = join(worktreeRoot, "apps/extension/.env");

  const cloneAction = describeWorktreeClonePlan({ sourceDb, destDb, worktreeRoot, recreateDb });
  const relPath = relative(mainRoot, worktreeRoot);

  console.warn(`${tag} [dry-run] no changes will be made`);
  console.warn(`${tag} [dry-run] worktree ${worktreeRoot}`);
  console.warn(`${tag} [dry-run] main     ${mainRoot}`);
  console.warn(`${tag} [dry-run] slug     ${slug}`);
  console.warn(`${tag} [dry-run] database ${sourceDb} → ${destDb}: ${cloneAction}`);
  console.warn(`${tag} [dry-run] DATABASE_URL ${formatDatabaseUrlForLog(databaseUrl)}`);
  console.warn(`${tag} [dry-run] DATABASE_INTEGRATION_URL ${formatDatabaseUrlForLog(e2eDatabaseUrl)}`);
  console.warn(
    `${tag} [dry-run] ports api=${ports.api} web=${ports.web} storybook=${ports.storybook} wxt=${ports.wxt}`,
  );
  console.warn(`${tag} [dry-run] would write ${apiEnvPath}, ${webEnvPath}, ${storybookEnvPath}, ${extensionEnvPath}`);
  console.warn(`${tag} [dry-run] would update ${GLOBAL_REGISTRY_PATH}, ${slugRegistryPath(slug)}`);
  console.warn(`${tag} [dry-run] would add ${slug} (${relPath}) to ${workspacePath}`);
  if (dbeaver) {
    console.warn(
      `${tag} [dry-run] would add DBeaver connection "${slug}" (Job Tracker/Worktrees)${forceDbeaver ? " (--force-dbeaver)" : ""}`,
    );
  }
  if (install) console.warn(`${tag} [dry-run] would run: pnpm install`);
  if (migrate) {
    console.warn(`${tag} [dry-run] would run: pnpm --filter @job-tracker/api run db:migrate`);
  }
  if (start) console.warn(`${tag} [dry-run] would run: pnpm pm2:start`);
  if (verify) {
    console.warn(`${tag} [dry-run] would verify API/Web/Storybook/WXT health endpoints`);
  }
  if (open) {
    console.warn(`${tag} [dry-run] would open browser ${worktreeWebUrl(ports)}`);
  }
  if (!install && !migrate && !start && !verify && !open) {
    console.warn(
      `${tag} [dry-run] post-steps skipped (pass --install=true --migrate=true --start=true --verify=true --open=true)`,
    );
  }
}

/** Runs optional post-setup steps (flags only; no stdin). */
export function runWorktreePostSetup(params: {
  tag: string;
  repoRoot: string;
  ports: SlugPorts;
  install: boolean;
  migrate: boolean;
  start: boolean;
  verify: boolean;
  open: boolean;
}): void {
  const { tag, repoRoot, ports, install, migrate, start, verify, open } = params;
  const webUrl = worktreeWebUrl(ports);

  if (install) {
    console.warn(`${tag} pnpm install`);
    spawnPnpmOrFail(repoRoot, ["install"], tag);
  }
  if (migrate) {
    console.warn(`${tag} pnpm --filter @job-tracker/api run db:migrate`);
    spawnPnpmOrFail(repoRoot, ["--filter", "@job-tracker/api", "run", "db:migrate"], tag);
  }
  if (start) {
    console.warn(`${tag} pnpm pm2:start`);
    spawnPnpmOrFail(repoRoot, ["pm2:start"], tag);
  }
  if (verify) {
    const apiPort = String(ports.api);
    const sbPort = String(ports.storybook);
    const wxtPort = String(ports.wxt);
    curlCheck(`http://localhost:${apiPort}/health`, tag, "api");
    curlCheck(webUrl, tag, "web");
    if (open) {
      openWebBrowser(webUrl, tag);
    }
    curlCheck(`http://localhost:${sbPort}/`, tag, "storybook");
    const wxt = spawnSync("curl", ["-fsS", `http://localhost:${wxtPort}/`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (wxt.status !== 0) {
      console.warn(
        `${tag} verify wxt skipped or failed (extension dev server may be down): http://localhost:${wxtPort}/`,
      );
    } else {
      console.warn(`${tag} verify wxt ok http://localhost:${wxtPort}/`);
    }
  } else if (open) {
    openWebBrowser(webUrl, tag);
  }
}

/** Post-setup URLs, env paths, and reminder to run migrations manually. */
export function logSetupSummary(params: {
  tag: string;
  apiEnvPath: string;
  webEnvPath: string;
  storybookEnvPath: string;
  extensionEnvPath: string;
  ports: SlugPorts;
  databaseUrl: string;
  e2eDatabaseUrl: string;
  destDb: string;
}): void {
  const {
    tag,
    apiEnvPath,
    webEnvPath,
    storybookEnvPath,
    extensionEnvPath,
    ports,
    databaseUrl,
    e2eDatabaseUrl,
    destDb,
  } = params;
  console.warn(`${tag} wrote ${apiEnvPath}`);
  console.warn(`${tag} wrote ${webEnvPath}`);
  console.warn(`${tag} wrote ${storybookEnvPath}`);
  console.warn(`${tag} wrote ${extensionEnvPath}`);
  console.warn(`${tag} API  http://localhost:${ports.api}`);
  console.warn(`${tag} Web  http://localhost:${ports.web}`);
  console.warn(`${tag} SB   http://localhost:${ports.storybook}`);
  console.warn(`${tag} WXT  http://localhost:${ports.wxt}`);
  console.warn(`${tag} DB   ${parseDatabaseName(databaseUrl) ?? destDb}`);
  console.warn(`${tag} E2E  ${parseDatabaseName(e2eDatabaseUrl) ?? "test_" + destDb}`);
  console.warn(`${tag} Post-steps: pass --install=true --migrate=true --start=true --verify=true --open=true`);
}

/** Resolves slug from argv or derives from worktree directory name. */
export function requireTeardownSlug(repoRoot: string, slugArg: string | undefined, tag: string): string {
  let slug = slugArg;
  if (!slug) {
    const root = resolveWorktreeRoot(repoRoot);
    if (!root) {
      worktreeFail(tag, "Could not determine slug. Pass as argument or run from a linked worktree.");
    }
    slug = deriveSlug(root);
  }
  if (!slug || !validateSlug(slug)) {
    worktreeFail(tag, "Could not determine slug. Pass as argument or run from a linked worktree.");
  }
  return slug;
}

/** PM2 name prefix — defaults to the worktree slug. */
export function resolveTeardownPm2Prefix(_repoRoot: string, slug: string): string {
  return slug;
}

/** Deletes prefixed PM2 apps for this worktree. */
export function stopWorktreePm2Apps(repoRoot: string, prefix: string, tag: string): void {
  const appNames = worktreePm2AppNames(prefix);
  console.warn(`${tag} pm2 delete ${appNames.join(" ")}`);
  pm2DeleteApps(repoRoot, appNames, tag);
}

/** Drops `job_tracker_<slug>` unless `--drop-db=false` was passed. */
export function dropWorktreeDatabase(repoRoot: string, slug: string, dropDb: boolean, tag: string): void {
  const dbName = dbNameForSlug(slug);
  if (!dropDb) {
    console.warn(`${tag} database ${dbName} preserved (--drop-db=false). Postgres container/volume unchanged.`);
    return;
  }
  const container = resolvePostgresContainer(repoRoot);
  if (container) {
    console.warn(`${tag} dropdb ${dbName} via docker (${container})`);
  } else {
    console.warn(`${tag} dropdb ${dbName}`);
  }
  const [dropErr] = tryRun(() => dropDatabase(dbName, repoRoot));
  if (dropErr) worktreeFail(tag, dropErr.message);
}

/** Drops `job_tracker_test_<slug>` unless `--keep-db` was passed. */
export function dropWorktreeTestDatabase(repoRoot: string, slug: string, dropDb: boolean, tag: string): void {
  const testDbName = testDbNameForSlug(slug);
  if (!dropDb) {
    console.warn(`${tag} test database ${testDbName} preserved (--keep-db).`);
    return;
  }
  const check = checkDatabaseExists(testDbName, repoRoot);
  if (check.status !== "exists") {
    console.warn(`${tag} test database ${testDbName} does not exist — skipping.`);
    return;
  }
  const container = resolvePostgresContainer(repoRoot);
  if (container) {
    console.warn(`${tag} dropdb ${testDbName} via docker (${container})`);
  } else {
    console.warn(`${tag} dropdb ${testDbName}`);
  }
  const [dropErr] = tryRun(() => dropDatabase(testDbName, repoRoot));
  if (dropErr) worktreeFail(tag, dropErr.message);
}

/** Reminds that `git worktree remove` is still manual after teardown. */
export function logWorktreeRemoveHint(repoRoot: string, tag: string): void {
  const wtRoot = runGit(["rev-parse", "--show-toplevel"], repoRoot);
  if (!wtRoot.ok) return;
  console.warn(`${tag} git worktree remove is manual: git worktree remove ${wtRoot.stdout}`);
}

/** Prints the full teardown plan when `--dry-run` is set. */
export function logTeardownDryRun(params: {
  tag: string;
  repoRoot: string;
  slug: string;
  pm2Prefix: string;
  dropDb: boolean;
  dbeaver: boolean;
}): void {
  const { tag, repoRoot, slug, pm2Prefix, dropDb, dbeaver } = params;
  const appNames = worktreePm2AppNames(pm2Prefix);
  const dbName = dbNameForSlug(slug);
  const mainRoot = resolveMainWorktreeRoot(repoRoot);
  const workspacePath = mainRoot ? resolveWorkspacePath(mainRoot) : undefined;

  console.warn(`${tag} [dry-run] no changes will be made`);
  console.warn(`${tag} [dry-run] slug ${slug}`);
  console.warn(`${tag} [dry-run] would run: pm2 delete ${appNames.join(" ")}`);
  if (dbeaver) {
    console.warn(`${tag} [dry-run] would remove DBeaver connection for ${slug} (postgres-jdbc-wt-${slug})`);
  }
  if (workspacePath) {
    console.warn(`${tag} [dry-run] would remove ${slug} from ${workspacePath}`);
  }
  if (dropDb) {
    const container = resolvePostgresContainer(repoRoot);
    console.warn(`${tag} [dry-run] would dropdb ${dbName}${container ? ` via docker (${container})` : ""}`);
  } else {
    console.warn(`${tag} [dry-run] would keep database ${dbName} (--drop-db=false)`);
  }
  console.warn(`${tag} [dry-run] would update ${GLOBAL_REGISTRY_PATH} and remove ${slugRegistryPath(slug)}`);
  console.warn(`${tag} [dry-run] re-run with --apply=true to execute (no stdin prompt).`);
  logWorktreeRemoveHint(repoRoot, `${tag} [dry-run]`);
}
