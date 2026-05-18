const path = require("path");

const root = path.resolve(__dirname);

const namespace = "job-tracker";

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * **storybook** watches `src` and `.storybook`; on change PM2 restarts the dev server.
 *
 * Start:  pnpm pm2:start
 * Reset:  `pnpm pm2:reset` — stop + SIGKILL LISTEN on 3100/3101/6006 + delete + start (`scripts/pm2-ecosystem-reset.ts`).
 * Ports:  `pnpm ports:kill` — only SIGKILL LISTEN PIDs (`scripts/kill-tcp-listen-ports.ts`). Env: `PORTS`, `KILL_PORTS`, or `PM2_RESET_PORTS`.
 * Stop:   pnpm pm2:stop
 * Restart with refreshed env: pnpm pm2:restart
 *        → runs: pm2 restart ecosystem.config.cjs --update-env
 *
 */
module.exports = {
  apps: [
    {
      name: "api",
      namespace,
      cwd: path.join(root, "apps/api"),
      script: "pnpm",
      args: "run dev:debug",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "development",
        NODE_OPTIONS: `--import ${path.join(root, "apps/api/node_modules/tsx/dist/loader.mjs")}`,
      },
      watch: false,
    },
    {
      name: "web",
      namespace,
      cwd: path.join(root, "apps/web"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: { NODE_ENV: "development" },
      watch: false,
    },
    {
      name: "storybook",
      namespace,
      cwd: path.join(root, "packages/ui"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: { NODE_ENV: "development", CI: "true" },
      watch: ["src", ".storybook"],
      ignore_watch: ["node_modules", ".git", "dist", "storybook-static"],
    },
    {
      name: "extension",
      namespace,
      cwd: path.join(root, "apps/extension"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: { NODE_ENV: "development" },
      watch: false,
    },
  ],
};
