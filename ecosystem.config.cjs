const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname);

/** @param {string} filePath */
function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  /** @type {Record<string, string>} */
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split("\n")) {
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
    env[key] = value;
  }
  return env;
}

const worktreeEnv = loadDotEnvFile(path.join(root, ".env.worktree"));
const namespace = worktreeEnv.PM2_NAMESPACE || "job-tracker";
const appPrefix = worktreeEnv.PM2_APP_PREFIX
  ? `${worktreeEnv.PM2_APP_PREFIX}-`
  : "";

/** @param {Record<string, string>} extra */
function sharedEnv(extra = {}) {
  return { NODE_ENV: "development", ...worktreeEnv, ...extra };
}

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * Worktrees: run `pnpm worktree:env` first — loads `.env.worktree` here (gitignored).
 *
 * Start:  pnpm pm2:start
 * Reset:  pnpm pm2:reset — uses PM2_RESET_PORTS from `.env.worktree` when present.
 * Ports:  pnpm ports:kill
 * Stop:   pnpm pm2:stop
 */
module.exports = {
  apps: [
    {
      name: `${appPrefix}api`,
      namespace,
      cwd: path.join(root, "apps/api"),
      script: "pnpm",
      args: "run dev:debug",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: sharedEnv({
        NODE_OPTIONS: `--import ${path.join(root, "apps/api/node_modules/tsx/dist/loader.mjs")}`,
        PORT: worktreeEnv.API_PORT || "3101",
      }),
      watch: false,
    },
    {
      name: `${appPrefix}web`,
      namespace,
      cwd: path.join(root, "apps/web"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: sharedEnv({
        PORT: worktreeEnv.WEB_PORT || "3100",
        NEXT_PUBLIC_API_URL:
          worktreeEnv.NEXT_PUBLIC_API_URL || "http://localhost:3101",
      }),
      watch: false,
    },
    {
      name: `${appPrefix}storybook`,
      namespace,
      cwd: path.join(root, "packages/ui"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: sharedEnv({ CI: "true" }),
      watch: ["src", ".storybook"],
      ignore_watch: ["node_modules", ".git", "dist", "storybook-static"],
    },
    {
      name: `${appPrefix}extension`,
      namespace,
      cwd: path.join(root, "apps/extension"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: sharedEnv(),
      watch: false,
    },
  ],
};
