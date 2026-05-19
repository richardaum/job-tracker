#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
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

/** Per-slug port cache file under `/tmp` (survives global registry edits). */
export function slugRegistryPath(slug: string): string {
  return `${SLUG_REGISTRY_PREFIX}${slug}${SLUG_REGISTRY_SUFFIX}`;
}

/** Git subprocess wrapper that never throws — callers branch on `ok`. */
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

function gitPathReal(
  cwd: string,
  flag: "--git-dir" | "--git-common-dir",
): string | undefined {
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

/** Slug from directory name, or from branch when the folder is still named `job-tracker`. */
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

/** Normalizes a path or branch fragment into the kebab-case slug alphabet. */
function basenameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[_\s/]+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
}

/** Strips `refs/heads/` before applying basename slug rules. */
function branchToSlug(branch: string): string {
  return basenameToSlug(branch.replace(/^refs\/heads\//, ""));
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
  const parsed = parseJsonOrUndefined(
    readFileSync(GLOBAL_REGISTRY_PATH, "utf8"),
  ) as GlobalRegistry | undefined;
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

/** Picks free ports per slug, preferring prior registry values when still valid. */
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

/** Minimal dotenv parser (no variable expansion) for `.env` and `.env.worktree`. */
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
    throw new Error(
      `Missing required secrets in source apps/api/.env: ${missing.join(", ")}`,
    );
  }
  for (const optional of ["OPENAI_API_KEY", "OPENAI_MODEL", "SENTRY_DSN"]) {
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
    const database =
      parseDatabaseName(databaseUrl) ?? url.pathname.replace(/^\//, "");
    return `host=${host} port=${port} database=${database || "(missing)"}`;
  }
  const database = parseDatabaseName(databaseUrl);
  return database
    ? `database=${database} (could not parse host/port)`
    : "database=(invalid url)";
}

/** Rewrites only the DB name to `job_tracker_<slug>` while keeping host/credentials. */
export function buildDestinationDatabaseUrl(
  sourceUrl: string,
  slug: string,
): string {
  const url = new URL(sourceUrl);
  url.pathname = `/${dbNameForSlug(slug)}`;
  return url.toString();
}

/** Postgres identifier: `job_tracker_` plus slug hyphens as underscores. */
export function dbNameForSlug(slug: string): string {
  return `job_tracker_${slug.replaceAll("-", "_")}`;
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
  const result = spawnSync(
    "docker",
    ["compose", "-f", composeFile, "ps", "-q", "postgres"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) return undefined;
  return result.stdout
    ?.trim()
    .split("\n")
    .map((line: string) => line.trim())
    .find(Boolean);
}

/** Picks explicit `WORKTREE_POSTGRES_DOCKER`, else compose, else any host on :5432. */
export function resolvePostgresContainer(repoRoot: string): string | undefined {
  const explicit = process.env.WORKTREE_POSTGRES_DOCKER?.trim();
  if (explicit) return explicit;

  for (const composeFile of composeFilesForPostgres(repoRoot)) {
    const id = dockerComposePostgresId(composeFile);
    if (id) return id;
  }

  const listed = spawnSync(
    "docker",
    ["ps", "--filter", "publish=5432", "--filter", "status=running", "-q"],
    { encoding: "utf8" },
  );
  return listed.stdout?.trim().split(/\s+/).find(Boolean);
}

/** Postgres role for docker exec / local psql (default `postgres`). */
function pgUser(): string {
  return process.env.WORKTREE_POSTGRES_USER?.trim() || "postgres";
}

/** Runs a Postgres CLI locally or via `docker exec` when a container is detected. */
function pgSpawn(
  repoRoot: string,
  command: string,
  args: string[],
  opts?: {
    input?: string;
    stdio?: "inherit" | ["ignore", "pipe", "pipe"];
    encoding?: "utf8";
  },
): ReturnType<typeof spawnSync> {
  const container = resolvePostgresContainer(repoRoot);
  const maxBuffer = 50 * 1024 * 1024;
  const stdio =
    opts?.stdio ??
    (opts?.encoding
      ? ["pipe", "pipe", "pipe"]
      : opts?.input !== undefined
        ? "pipe"
        : "inherit");

  if (!container) {
    return spawnSync(command, args, {
      encoding: opts?.encoding,
      input: opts?.input,
      stdio,
      maxBuffer,
    });
  }

  const dockerArgs = ["exec"];
  if (opts?.input !== undefined) dockerArgs.push("-i");
  dockerArgs.push(container, command, "-U", pgUser(), ...args);

  return spawnSync("docker", dockerArgs, {
    encoding: opts?.encoding,
    input: opts?.input,
    stdio,
    maxBuffer,
  });
}

/** Like `pgSpawn` but surfaces non-zero exit as an Error. */
function pgSpawnOrThrow(
  repoRoot: string,
  command: string,
  args: string[],
): void {
  const result = pgSpawn(repoRoot, command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed (exit ${result.status ?? "?"}).`,
    );
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
    [
      "-d",
      "postgres",
      "-tAc",
      `SELECT 1 FROM pg_database WHERE datname='${dbName.replaceAll("'", "''")}'`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").toString().trim();
    return {
      status: "error",
      detail: detail || `psql exited ${result.status ?? "?"}`,
    };
  }
  const stdout = result.stdout;
  const text =
    typeof stdout === "string" ? stdout : (stdout?.toString("utf8") ?? "");
  return { status: text.trim() === "1" ? "exists" : "missing" };
}

/** True when the database name exists (psql errors → false). */
export function databaseExists(dbName: string, repoRoot: string): boolean {
  return checkDatabaseExists(dbName, repoRoot).status === "exists";
}

function tryDropDatabaseQuiet(
  dbName: string,
  repoRoot: string,
  tag: string,
): void {
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
    throw new Error(
      `Could not check database ${destDb}: ${existsCheck.detail ?? "psql failed"}`,
    );
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
    const result = spawnSync(
      "docker",
      ["exec", container, "sh", "-c", script],
      { stdio: "inherit" },
    );
    if (result.status !== 0) {
      tryDropDatabaseQuiet(destDb, repoRoot, tag);
      throw new Error(
        `docker pg_dump|psql clone ${sourceDb} → ${destDb} failed (exit ${result.status ?? "?"}).`,
      );
    }
    return;
  }

  const dump = pgSpawn(repoRoot, "pg_dump", ["--no-owner", sourceDb], {
    encoding: "utf8",
  });
  if (dump.status !== 0) {
    tryDropDatabaseQuiet(destDb, repoRoot, tag);
    throw new Error(
      `pg_dump failed for ${sourceDb}: ${dump.stderr || dump.stdout}`,
    );
  }
  const load = pgSpawn(repoRoot, "psql", [destDb], {
    input: dump.stdout as string,
    encoding: "utf8",
  });
  if (load.status !== 0) {
    tryDropDatabaseQuiet(destDb, repoRoot, tag);
    throw new Error(
      `psql load failed for ${destDb}: ${load.stderr || load.stdout}`,
    );
  }
}

/** Drops a worktree database via the same docker/local psql path as clone. */
export function dropDatabase(dbName: string, repoRoot: string): void {
  assertPostgresAvailable(repoRoot);
  pgSpawnOrThrow(repoRoot, "dropdb", [dbName]);
}

/** Serializes `.env.worktree` with a generated header and safe value quoting. */
export function formatEnvWorktree(entries: WorktreeEnvMap): string {
  const lines = [
    "# Generated by pnpm worktree:setup — do not commit.",
    "# Re-run is idempotent: ports/DB reused when possible; file regenerated.",
    "",
  ];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`${key}=${escapeEnvValue(value)}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** JSON-quotes values that would break naive `KEY=value` parsing. */
function escapeEnvValue(value: string): string {
  if (/^[A-Za-z0-9_./:@-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

/** Builds PM2, app URLs, auth bypass, and copied secrets for one worktree slug. */
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

/** Parses existing `.env.worktree` or returns `{}` when setup has not run. */
export function loadEnvWorktree(root: string): WorktreeEnvMap {
  const path = join(root, ".env.worktree");
  if (!existsSync(path)) return {};
  return parseEnvFile(readFileSync(path, "utf8"));
}

/** Removes slug from global registry and deletes its per-slug port file. */
export function removeSlugFromRegistry(slug: string): void {
  const registry = readGlobalRegistry();
  delete registry.slugs[slug];
  writeGlobalRegistry(registry);
  const slugPath = slugRegistryPath(slug);
  if (existsSync(slugPath)) unlinkSync(slugPath);
}

export const WORKTREE_SETUP_TAG = "[worktree:setup]";
export const WORKTREE_TEARDOWN_TAG = "[worktree:teardown]";

/** Logs tagged stderr, exits 1, and satisfies `never` for TypeScript control flow. */
export function worktreeFail(tag: string, message: string): never {
  console.error(`${tag} ${message}`);
  process.exit(1);
  throw new Error(message);
}

export type SetupArgs = {
  sourceDb?: string;
  recreateDb: boolean;
  dbeaver: boolean;
  forceDbeaver: boolean;
  dryRun: boolean;
  install: boolean;
  migrate: boolean;
  start: boolean;
  verify: boolean;
};

export type TeardownArgs = {
  slug?: string;
  dropDb: boolean;
  dbeaver: boolean;
  dryRun: boolean;
  apply: boolean;
};

const SETUP_BOOLEAN_FLAGS = [
  "--dry-run",
  "--recreate-db",
  "--dbeaver",
  "--force-dbeaver",
  "--install",
  "--migrate",
  "--start",
  "--verify",
] as const;

const TEARDOWN_BOOLEAN_FLAGS = [
  "--dry-run",
  "--apply",
  "--drop-db",
  "--dbeaver",
] as const;

/** Parses `true` / `false` (case-insensitive) for `--flag=value` booleans. */
export function parseBooleanFlagValue(raw: string): boolean | undefined {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function readBooleanFlag(
  arg: string,
  flag: string,
  tag: string,
): boolean | undefined {
  const prefix = `${flag}=`;
  if (!arg.startsWith(prefix)) return undefined;
  const value = parseBooleanFlagValue(arg.slice(prefix.length));
  if (value === undefined) {
    worktreeFail(tag, `${flag} must be true or false (e.g. ${flag}=false).`);
  }
  return value;
}

function rejectBareBooleanFlag(
  arg: string,
  flags: readonly string[],
  tag: string,
): void {
  if (flags.includes(arg as (typeof flags)[number])) {
    worktreeFail(tag, `${arg} requires =true or =false (e.g. ${arg}=false).`);
  }
}

function requireAllBooleanFlags(
  seen: Partial<Record<string, boolean>>,
  flags: readonly string[],
  tag: string,
): void {
  const missing = flags.filter((flag) => seen[flag] === undefined);
  if (missing.length === 0) return;
  worktreeFail(
    tag,
    `Missing required flags: ${missing.map((f) => `${f}=true|false`).join(", ")}`,
  );
}

/** Parses setup CLI flags (no stdin). Every boolean flag must use `=true` or `=false`. */
export function parseSetupArgs(argv: string[]): SetupArgs {
  const tag = WORKTREE_SETUP_TAG;
  let sourceDb = process.env.WORKTREE_SOURCE_DB?.trim();
  const seen: Partial<Record<string, boolean>> = {};
  let slugArg: string | undefined;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    rejectBareBooleanFlag(arg, SETUP_BOOLEAN_FLAGS, tag);

    const dryRun = readBooleanFlag(arg, "--dry-run", tag);
    if (dryRun !== undefined) {
      seen["--dry-run"] = dryRun;
      continue;
    }
    const recreateDb = readBooleanFlag(arg, "--recreate-db", tag);
    if (recreateDb !== undefined) {
      seen["--recreate-db"] = recreateDb;
      continue;
    }
    const dbeaver = readBooleanFlag(arg, "--dbeaver", tag);
    if (dbeaver !== undefined) {
      seen["--dbeaver"] = dbeaver;
      continue;
    }
    const forceDbeaver = readBooleanFlag(arg, "--force-dbeaver", tag);
    if (forceDbeaver !== undefined) {
      seen["--force-dbeaver"] = forceDbeaver;
      continue;
    }
    const install = readBooleanFlag(arg, "--install", tag);
    if (install !== undefined) {
      seen["--install"] = install;
      continue;
    }
    const migrate = readBooleanFlag(arg, "--migrate", tag);
    if (migrate !== undefined) {
      seen["--migrate"] = migrate;
      continue;
    }
    const start = readBooleanFlag(arg, "--start", tag);
    if (start !== undefined) {
      seen["--start"] = start;
      continue;
    }
    const verify = readBooleanFlag(arg, "--verify", tag);
    if (verify !== undefined) {
      seen["--verify"] = verify;
      continue;
    }
    if (arg === "--source-db" && argv[i + 1]) {
      sourceDb = argv[++i]?.trim();
      continue;
    }
    if (arg.startsWith("--source-db=")) {
      sourceDb = arg.slice("--source-db=".length).trim();
      continue;
    }
    if (!arg.startsWith("-")) {
      slugArg = arg;
      continue;
    }
    if (arg.startsWith("--")) {
      worktreeFail(tag, `Unknown flag: ${arg}`);
    }
  }

  requireAllBooleanFlags(seen, SETUP_BOOLEAN_FLAGS, tag);

  const recreateDb = seen["--recreate-db"]!;
  const dbeaver = seen["--dbeaver"]!;
  const forceDbeaver = seen["--force-dbeaver"]!;
  const dryRun = seen["--dry-run"]!;
  const install = seen["--install"]!;
  const migrate = seen["--migrate"]!;
  const start = seen["--start"]!;
  const verify = seen["--verify"]!;

  if (forceDbeaver && !dbeaver) {
    worktreeFail(tag, "--force-dbeaver=true requires --dbeaver=true.");
  }
  if (slugArg) {
    worktreeFail(
      tag,
      `Unexpected positional argument: ${slugArg}. Setup does not accept a slug argument.`,
    );
  }

  return {
    sourceDb,
    recreateDb,
    dbeaver,
    forceDbeaver,
    dryRun,
    install,
    migrate,
    start,
    verify,
  };
}

/** Parses teardown CLI flags. Every boolean flag must use `=true` or `=false`. */
export function parseTeardownArgs(argv: string[]): TeardownArgs {
  const tag = WORKTREE_TEARDOWN_TAG;
  const seen: Partial<Record<string, boolean>> = {};
  let slug: string | undefined;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    rejectBareBooleanFlag(arg, TEARDOWN_BOOLEAN_FLAGS, tag);

    const dryRun = readBooleanFlag(arg, "--dry-run", tag);
    if (dryRun !== undefined) {
      seen["--dry-run"] = dryRun;
      continue;
    }
    const apply = readBooleanFlag(arg, "--apply", tag);
    if (apply !== undefined) {
      seen["--apply"] = apply;
      continue;
    }
    const dropDb = readBooleanFlag(arg, "--drop-db", tag);
    if (dropDb !== undefined) {
      seen["--drop-db"] = dropDb;
      continue;
    }
    const dbeaver = readBooleanFlag(arg, "--dbeaver", tag);
    if (dbeaver !== undefined) {
      seen["--dbeaver"] = dbeaver;
      continue;
    }
    if (arg === "--keep-db") {
      worktreeFail(tag, "--keep-db was removed. Use --drop-db=false instead.");
    }
    if (!arg.startsWith("-")) {
      slug = arg;
      continue;
    }
    if (arg.startsWith("--")) {
      worktreeFail(tag, `Unknown flag: ${arg}`);
    }
  }

  requireAllBooleanFlags(seen, TEARDOWN_BOOLEAN_FLAGS, tag);

  return {
    slug,
    dropDb: seen["--drop-db"]!,
    dbeaver: seen["--dbeaver"]!,
    dryRun: seen["--dry-run"]!,
    apply: seen["--apply"]!,
  };
}

/** Teardown mode: exactly one of `--dry-run=true` or `--apply=true`. */
export function resolveTeardownMode(
  args: TeardownArgs,
  tag: string,
): "dry-run" | "apply" {
  if (args.dryRun && args.apply) {
    worktreeFail(
      tag,
      "Set exactly one mode flag to true: --dry-run=true or --apply=true.",
    );
  }
  if (!args.dryRun && !args.apply) {
    worktreeFail(
      tag,
      "Set exactly one mode flag to true: --dry-run=true (plan) or --apply=true (execute).",
    );
  }
  return args.dryRun ? "dry-run" : "apply";
}

/** PM2 process names for the four dev apps under a worktree prefix. */
export function worktreePm2AppNames(prefix: string): string[] {
  return [
    `${prefix}-api`,
    `${prefix}-web`,
    `${prefix}-storybook`,
    `${prefix}-extension`,
  ];
}

/** Runs `pm2 delete` and fails on non-zero exit. */
export function pm2DeleteApps(
  repoRoot: string,
  names: string[],
  tag: string,
): void {
  if (names.length === 0) return;
  const result = spawnSync("pm2", ["delete", ...names], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    worktreeFail(tag, `pm2 delete failed (exit ${result.status ?? "?"}).`);
  }
}

function spawnPnpmOrFail(
  repoRoot: string,
  args: string[],
  tag: string,
  env?: WorktreeEnvMap,
): void {
  const result = spawnSync("pnpm", args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: env ? { ...process.env, ...env } : process.env,
  });
  if (result.status !== 0) {
    worktreeFail(
      tag,
      `pnpm ${args.join(" ")} failed (exit ${result.status ?? "?"}).`,
    );
  }
}

function curlCheck(url: string, tag: string, label: string): void {
  const result = spawnSync("curl", ["-fsS", url], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    worktreeFail(
      tag,
      `verify ${label} failed for ${url}: ${(result.stderr || "").toString().trim()}`,
    );
  }
  console.warn(`${tag} verify ${label} ok ${url}`);
}

/** Aborts setup/teardown when invoked from the main checkout. */
export function assertGitWorktree(repoRoot: string, tag: string): void {
  if (isGitWorktreeCheckout(repoRoot)) return;
  worktreeFail(
    tag,
    "Refusing to run on the main checkout. Create a git worktree first, then run from that path.",
  );
}

/** Returns worktree root or exits — used after `assertGitWorktree`. */
export function requireWorktreeRoot(repoRoot: string, tag: string): string {
  const worktreeRoot = resolveWorktreeRoot(repoRoot);
  if (worktreeRoot) return worktreeRoot;
  worktreeFail(tag, "Could not resolve worktree root.");
}

/** Resolves slug from path/branch and exits when it fails validation. */
export function requireValidSlug(repoRoot: string, tag: string): string {
  const slug = deriveSlug(repoRoot);
  if (slug && validateSlug(slug)) return slug;
  worktreeFail(
    tag,
    `Invalid slug derived from path/branch. Use a kebab-case directory name (≤16 chars). Got: ${JSON.stringify(slug)}`,
  );
}

/** Ensures clone source DB name is set via env or `--source-db`. */
export function requireSourceDb(
  sourceDb: string | undefined,
  tag: string,
): string {
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
  worktreeFail(
    tag,
    "Could not resolve main worktree (source for apps/api/.env secrets).",
  );
}

export type MainApiEnvForWorktree = {
  secrets: WorktreeEnvMap;
  databaseUrl: string;
  destDb: string;
};

/** Pulls secrets and destination `DATABASE_URL` from main API env for one slug. */
export function loadMainApiEnvForWorktree(
  mainRoot: string,
  slug: string,
  tag: string,
): MainApiEnvForWorktree {
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
  cloneDatabase(sourceDb, destDb, {
    force: recreateDb,
    repoRoot: worktreeRoot,
    tag,
  });
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

/** Writes gitignored `.env.worktree` and returns its absolute path. */
export function writeWorktreeEnvFile(params: {
  worktreeRoot: string;
  slug: string;
  ports: SlugPorts;
  secrets: WorktreeEnvMap;
  databaseUrl: string;
}): string {
  const envPath = join(params.worktreeRoot, ".env.worktree");
  const envMap = buildWorktreeEnv({
    slug: params.slug,
    ports: params.ports,
    secrets: params.secrets,
    databaseUrl: params.databaseUrl,
  });
  writeFileSync(envPath, formatEnvWorktree(envMap), "utf8");
  return envPath;
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
  recreateDb: boolean;
  dbeaver: boolean;
  forceDbeaver: boolean;
  ports: SlugPorts;
  install: boolean;
  migrate: boolean;
  start: boolean;
  verify: boolean;
}): void {
  const {
    tag,
    worktreeRoot,
    mainRoot,
    slug,
    sourceDb,
    destDb,
    databaseUrl,
    recreateDb,
    dbeaver,
    forceDbeaver,
    ports,
    install,
    migrate,
    start,
    verify,
  } = params;
  const envPath = join(worktreeRoot, ".env.worktree");
  const cloneAction = describeWorktreeClonePlan({
    sourceDb,
    destDb,
    worktreeRoot,
    recreateDb,
  });

  console.warn(`${tag} [dry-run] no changes will be made`);
  console.warn(`${tag} [dry-run] worktree ${worktreeRoot}`);
  console.warn(`${tag} [dry-run] main     ${mainRoot}`);
  console.warn(`${tag} [dry-run] slug     ${slug}`);
  console.warn(
    `${tag} [dry-run] database ${sourceDb} → ${destDb}: ${cloneAction}`,
  );
  console.warn(
    `${tag} [dry-run] DATABASE_URL ${formatDatabaseUrlForLog(databaseUrl)}`,
  );
  console.warn(
    `${tag} [dry-run] ports api=${ports.api} web=${ports.web} storybook=${ports.storybook} wxt=${ports.wxt}`,
  );
  console.warn(
    `${tag} [dry-run] would write ${envPath} and update ${GLOBAL_REGISTRY_PATH}, ${slugRegistryPath(slug)}`,
  );
  if (dbeaver) {
    console.warn(
      `${tag} [dry-run] would add DBeaver connection "${slug}" (Job Tracker/Worktrees)${forceDbeaver ? " (--force-dbeaver)" : ""}`,
    );
  }
  if (install) console.warn(`${tag} [dry-run] would run: pnpm install`);
  if (migrate) {
    console.warn(
      `${tag} [dry-run] would run: pnpm --filter @job-tracker/api run db:migrate`,
    );
  }
  if (start) console.warn(`${tag} [dry-run] would run: pnpm pm2:start`);
  if (verify) {
    console.warn(
      `${tag} [dry-run] would verify API/Web/Storybook/WXT health endpoints`,
    );
  }
  if (!install && !migrate && !start && !verify) {
    console.warn(
      `${tag} [dry-run] post-steps skipped (pass --install=true --migrate=true --start=true --verify=true)`,
    );
  }
}

/** Runs optional post-setup steps (flags only; no stdin). */
export function runWorktreePostSetup(params: {
  tag: string;
  repoRoot: string;
  install: boolean;
  migrate: boolean;
  start: boolean;
  verify: boolean;
}): void {
  const { tag, repoRoot, install, migrate, start, verify } = params;
  const env = loadEnvWorktree(repoRoot);

  if (install) {
    console.warn(`${tag} pnpm install`);
    spawnPnpmOrFail(repoRoot, ["install"], tag);
  }
  if (migrate) {
    console.warn(`${tag} pnpm --filter @job-tracker/api run db:migrate`);
    spawnPnpmOrFail(
      repoRoot,
      ["--filter", "@job-tracker/api", "run", "db:migrate"],
      tag,
      env,
    );
  }
  if (start) {
    console.warn(`${tag} pnpm pm2:start`);
    spawnPnpmOrFail(repoRoot, ["pm2:start"], tag);
  }
  if (verify) {
    const apiPort = env.API_PORT;
    const webPort = env.WEB_PORT;
    const sbPort = env.STORYBOOK_PORT;
    const wxtPort = env.WXT_DEV_PORT;
    if (!apiPort || !webPort || !sbPort || !wxtPort) {
      worktreeFail(tag, "verify requires .env.worktree with port variables.");
    }
    curlCheck(`http://localhost:${apiPort}/health`, tag, "api");
    curlCheck(`http://localhost:${webPort}/`, tag, "web");
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
  }
}

/** Post-setup URLs, env path, and reminder to run migrations manually. */
export function logSetupSummary(params: {
  tag: string;
  envPath: string;
  ports: SlugPorts;
  databaseUrl: string;
  destDb: string;
}): void {
  const { tag, envPath, ports, databaseUrl, destDb } = params;
  console.warn(`${tag} wrote ${envPath}`);
  console.warn(`${tag} API  http://localhost:${ports.api}`);
  console.warn(`${tag} Web  http://localhost:${ports.web}`);
  console.warn(`${tag} SB   http://localhost:${ports.storybook}`);
  console.warn(`${tag} WXT  http://localhost:${ports.wxt}`);
  console.warn(`${tag} DB   ${parseDatabaseName(databaseUrl) ?? destDb}`);
  console.warn(
    `${tag} Post-steps: pass --install=true --migrate=true --start=true --verify=true`,
  );
}

/** Resolves slug from argv, `.env.worktree`, or exits. */
export function requireTeardownSlug(
  repoRoot: string,
  slugArg: string | undefined,
  tag: string,
): string {
  const env = loadEnvWorktree(repoRoot);
  const slug = slugArg ?? env.PM2_APP_PREFIX ?? env.WORKTREE_SLUG;
  if (slug) return slug;
  worktreeFail(
    tag,
    "Could not determine slug. Pass as argument or run from a worktree with .env.worktree.",
  );
}

/** PM2 name prefix from env file, falling back to the worktree slug. */
export function resolveTeardownPm2Prefix(
  repoRoot: string,
  slug: string,
): string {
  const env = loadEnvWorktree(repoRoot);
  return env.PM2_APP_PREFIX ?? slug;
}

/** Deletes prefixed PM2 apps for this worktree. */
export function stopWorktreePm2Apps(
  repoRoot: string,
  prefix: string,
  tag: string,
): void {
  const appNames = worktreePm2AppNames(prefix);
  console.warn(`${tag} pm2 delete ${appNames.join(" ")}`);
  pm2DeleteApps(repoRoot, appNames, tag);
}

/** Unlinks `.env.worktree` when present. */
export function removeWorktreeEnvFile(repoRoot: string, tag: string): void {
  const envPath = join(repoRoot, ".env.worktree");
  if (!existsSync(envPath)) return;
  unlinkSync(envPath);
  console.warn(`${tag} removed ${envPath}`);
}

/** Drops `job_tracker_<slug>` unless `--drop-db=false` was passed. */
export function dropWorktreeDatabase(
  repoRoot: string,
  slug: string,
  dropDb: boolean,
  tag: string,
): void {
  const dbName = dbNameForSlug(slug);
  if (!dropDb) {
    console.warn(
      `${tag} database ${dbName} preserved (--drop-db=false). Postgres container/volume unchanged.`,
    );
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

/** Reminds that `git worktree remove` is still manual after teardown. */
export function logWorktreeRemoveHint(repoRoot: string, tag: string): void {
  const wtRoot = runGit(["rev-parse", "--show-toplevel"], repoRoot);
  if (!wtRoot.ok) return;
  console.warn(
    `${tag} git worktree remove is manual: git worktree remove ${wtRoot.stdout}`,
  );
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
  const envPath = join(repoRoot, ".env.worktree");
  const dbName = dbNameForSlug(slug);
  const envExists = existsSync(envPath);

  console.warn(`${tag} [dry-run] no changes will be made`);
  console.warn(`${tag} [dry-run] slug ${slug}`);
  console.warn(`${tag} [dry-run] would run: pm2 delete ${appNames.join(" ")}`);
  if (dbeaver) {
    console.warn(
      `${tag} [dry-run] would remove DBeaver connection for ${slug} (postgres-jdbc-wt-${slug})`,
    );
  }
  if (dropDb) {
    const container = resolvePostgresContainer(repoRoot);
    console.warn(
      `${tag} [dry-run] would dropdb ${dbName}${container ? ` via docker (${container})` : ""}`,
    );
  } else {
    console.warn(
      `${tag} [dry-run] would keep database ${dbName} (--drop-db=false)`,
    );
  }
  console.warn(
    `${tag} [dry-run] would update ${GLOBAL_REGISTRY_PATH} and remove ${slugRegistryPath(slug)}`,
  );
  console.warn(
    `${tag} [dry-run] would ${envExists ? "remove" : "skip (missing)"} ${envPath}`,
  );
  console.warn(
    `${tag} [dry-run] re-run with --apply=true to execute (no stdin prompt).`,
  );
  logWorktreeRemoveHint(repoRoot, `${tag} [dry-run]`);
}
