const path = require("node:path");
const { deriveSlug } = require("./packages/worktree-cli/derive-slug.cjs");

const root = path.resolve(__dirname);
const slug = deriveSlug(root);
const isWorktree = slug !== "job-tracker";
const namespace = isWorktree ? `job-tracker-${slug}` : "job-tracker";
const appPrefix = isWorktree ? `${slug}-` : "";

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * Each app loads its env from its own `.env` file via `env_file`.
 * In a worktree, `pnpm worktree:setup` writes worktree-specific `.env` files.
 * PM2 namespace and app prefix are derived from the directory name.
 *
 * Start:  pnpm pm2:start
 * Reset:  pnpm pm2:reset
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
      env_file: path.join(root, "apps/api/.env"),
      env: {
        NODE_ENV: "development",
        NODE_OPTIONS: `--import ${path.join(root, "apps/api/node_modules/tsx/dist/loader.mjs")}`,
      },
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
      env_file: path.join(root, "apps/web/.env"),
      env: { NODE_ENV: "development" },
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
      env_file: path.join(root, "packages/ui/.env"),
      env: { NODE_ENV: "development", CI: "true" },
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
      env_file: path.join(root, "apps/extension/.env.development"),
      env: { NODE_ENV: "development" },
      watch: false,
    },
  ],
};
