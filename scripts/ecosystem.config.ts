import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { deriveSlug } from "@job-tracker/worktree-cli/derive-slug";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = deriveSlug(root);
const isWorktree = slug !== "job-tracker";
const namespace = isWorktree ? `job-tracker-${slug}` : "job-tracker";
const appPrefix = isWorktree ? `${slug}-` : "";

function loadEnvFile(filepath: string): Record<string, string> {
  if (!fs.existsSync(filepath)) return {};
  return dotenv.parse(fs.readFileSync(filepath, "utf-8"));
}

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * Each app loads its env from its own `.env` file via `dotenv` merged into `env`.
 * In a worktree, `pnpm worktree:setup` writes worktree-specific `.env` files.
 * PM2 namespace and app prefix are derived from the directory name.
 *
 * Start:  pnpm pm2:start
 * Reset:  pnpm pm2:reset
 * Ports:  pnpm ports:kill
 * Stop:   pnpm pm2:stop
 *
 * ezpm2gui: http://127.0.0.1:9310 — autorestart off (monitoring UI, not a dev app).
 * Start only the GUI: pnpm pm2:gui
 */
export default {
  apps: [
    {
      name: `${appPrefix}api`,
      namespace,
      cwd: path.join(root, "apps/api"),
      script: "pnpm",
      args: "run dev:debug",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "development",
        NODE_OPTIONS: `--import ${path.join(root, "apps/api/node_modules/tsx/dist/loader.mjs")}`,
        ...loadEnvFile(path.join(root, "apps/api/.env")),
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
      env: {
        NODE_ENV: "development",
        ...loadEnvFile(path.join(root, "apps/web/.env")),
      },
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
      env: {
        NODE_ENV: "development",
        CI: "true",
        ...loadEnvFile(path.join(root, "packages/ui/.env")),
      },
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
      env: {
        NODE_ENV: "development",
        ...loadEnvFile(path.join(root, "apps/extension/.env.development")),
        ...loadEnvFile(path.join(root, "apps/extension/.env")),
      },
      watch: false,
    },
    {
      name: `${appPrefix}ezpm2gui`,
      namespace,
      cwd: root,
      script: "npx",
      args: "ezpm2gui",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      autorestart: false,
      watch: false,
      env: { NODE_ENV: "development", PORT: "9310", HOST: "127.0.0.1" },
    },
  ],
};
