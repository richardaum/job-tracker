import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { tryRun } from "@job-tracker/try-run";

import { worktreeEnv } from "./env.ts";
import { dbNameForSlug, parseDatabaseName, worktreeFail } from "./lib.ts";

const WORKTREE_FOLDER = "Job Tracker/Worktrees";
const PARENT_FOLDER = "Job Tracker";

export type DBeaverDataSources = {
  folders?: Record<string, { parent?: string }>;
  connections: Record<string, DBeaverConnection>;
  "connection-types"?: Record<string, unknown>;
};

type DBeaverConnection = {
  provider: string;
  driver: string;
  name: string;
  "save-password": boolean;
  "show-system-objects": boolean;
  folder: string;
  configuration: {
    host: string;
    port: string;
    database: string;
    url: string;
    user: string;
    password?: string;
    configurationType: string;
    type: string;
    "auth-model": string;
  };
};

/** Platform default for DBeaver 23+ `data-sources.json`, overridable via worktreeEnv. */
export function defaultDBeaverDataSourcesPath(): string {
  const explicit = worktreeEnv.WORKTREE_DBEAVER_DATA_SOURCES;
  if (explicit) return explicit;

  const home = homedir();
  if (process.platform === "darwin") {
    return join(home, "Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json");
  }
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? join(home, "AppData/Roaming");
    return join(appData, "DBeaverData/workspace6/General/.dbeaver/data-sources.json");
  }
  return join(home, ".local/share/DBeaverData/workspace6/General/.dbeaver/data-sources.json");
}

/** Stable connection key derived from the worktree slug. */
export function dbeaverConnectionId(slug: string): string {
  return `postgres-jdbc-wt-${slug}`;
}

/** Atomic write for DBeaver JSON so the IDE never reads a half file. */
function writeJsonAtomic(path: string, data: unknown): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

/** Loads and validates DBeaver `connections` map from disk. */
function readDataSources(path: string): DBeaverDataSources {
  if (!existsSync(path)) {
    throw new Error(`DBeaver config not found at ${path}`);
  }
  const raw = readFileSync(path, "utf8");
  const [err, parsed] = tryRun(() => JSON.parse(raw) as DBeaverDataSources);
  if (err || !parsed?.connections) {
    throw new Error(`Invalid DBeaver data-sources.json at ${path}`);
  }
  return parsed;
}

/** Splits a Postgres URL into JDBC fields (password may be empty). */
function parsePgDatabaseUrl(databaseUrl: string): {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
} {
  const url = new URL(databaseUrl);
  const database = url.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error(`Invalid DATABASE_URL (missing database name): ${databaseUrl}`);
  }
  return {
    host: url.hostname || "localhost",
    port: url.port || "5432",
    database,
    user: decodeURIComponent(url.username || "postgres"),
    password: decodeURIComponent(url.password || ""),
  };
}

/** Ensures `Job Tracker` / `Worktrees` folder nodes exist in the JSON tree. */
function ensureWorktreeFolders(data: DBeaverDataSources): void {
  data.folders ??= {};
  if (!data.folders[PARENT_FOLDER]) {
    data.folders[PARENT_FOLDER] = {};
  }
  if (!data.folders.Worktrees) {
    data.folders.Worktrees = { parent: PARENT_FOLDER };
  }
}

/** Finds an existing connection when the stable id was created manually. */
function findConnectionIdByDatabase(
  connections: Record<string, DBeaverConnection>,
  database: string,
): string | undefined {
  for (const [id, conn] of Object.entries(connections)) {
    if (conn.configuration?.database === database) return id;
  }
  return undefined;
}

/** Builds a JDBC entry matching the repo's existing DBeaver worktree shape. */
function buildConnection(slug: string, databaseUrl: string): { id: string; entry: DBeaverConnection } {
  const pg = parsePgDatabaseUrl(databaseUrl);
  const jdbcUrl = `jdbc:postgresql://${pg.host}:${pg.port}/${pg.database}`;
  const id = dbeaverConnectionId(slug);
  return {
    id,
    entry: {
      provider: "postgresql",
      driver: "postgres-jdbc",
      name: slug,
      "save-password": false,
      "show-system-objects": false,
      folder: WORKTREE_FOLDER,
      configuration: {
        host: pg.host,
        port: pg.port,
        database: pg.database,
        url: jdbcUrl,
        user: pg.user,
        configurationType: "MANUAL",
        type: "dev",
        "auth-model": "native",
      },
    },
  };
}

/** Idempotently appends a worktree DB under `Job Tracker/Worktrees`. */
export function addWorktreeDBeaverConnection(params: {
  tag: string;
  slug: string;
  databaseUrl: string;
  dataSourcesPath?: string;
  force?: boolean;
}): void {
  const path = params.dataSourcesPath ?? defaultDBeaverDataSourcesPath();
  const database = parseDatabaseName(params.databaseUrl) ?? dbNameForSlug(params.slug);

  const [readErr, data] = tryRun(() => readDataSources(path));
  if (readErr) {
    worktreeFail(params.tag, readErr.message);
  }

  ensureWorktreeFolders(data!);
  const existingId =
    dbeaverConnectionId(params.slug) in data!.connections
      ? dbeaverConnectionId(params.slug)
      : findConnectionIdByDatabase(data!.connections, database);

  const { id, entry } = buildConnection(params.slug, params.databaseUrl);

  if (existingId && !params.force) {
    console.warn(`${params.tag} DBeaver connection already exists (${existingId}, db=${database})`);
    return;
  }

  if (existingId && params.force) {
    delete data!.connections[existingId];
    console.warn(`${params.tag} DBeaver updating existing connection (${existingId})`);
  }

  data!.connections[id] = entry;

  const [writeErr] = tryRun(() => writeJsonAtomic(path, data));
  if (writeErr) {
    worktreeFail(params.tag, writeErr.message);
  }

  console.warn(`${params.tag} DBeaver added ${entry.name} → ${path} (${WORKTREE_FOLDER})`);
}

/** Removes connection by slug id or by matching database name. */
export function removeWorktreeDBeaverConnection(params: { tag: string; slug: string; dataSourcesPath?: string }): void {
  const path = params.dataSourcesPath ?? defaultDBeaverDataSourcesPath();
  const database = dbNameForSlug(params.slug);

  if (!existsSync(path)) {
    console.warn(`${params.tag} DBeaver config not found — skip (${path})`);
    return;
  }

  const [readErr, data] = tryRun(() => readDataSources(path));
  if (readErr) {
    worktreeFail(params.tag, readErr.message);
  }

  const id =
    dbeaverConnectionId(params.slug) in data!.connections
      ? dbeaverConnectionId(params.slug)
      : findConnectionIdByDatabase(data!.connections, database);

  if (!id) {
    console.warn(`${params.tag} DBeaver connection not found for db=${database} — skip`);
    return;
  }

  const name = data!.connections[id]?.name ?? id;
  delete data!.connections[id];

  const [writeErr] = tryRun(() => writeJsonAtomic(path, data));
  if (writeErr) {
    worktreeFail(params.tag, writeErr.message);
  }

  console.warn(`${params.tag} DBeaver removed ${name} (${id})`);
}
