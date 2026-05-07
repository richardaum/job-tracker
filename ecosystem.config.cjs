/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const root = path.resolve(__dirname);

const namespace = "job-tracker";

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * **storybook** watches `specs/` and `scripts/generate-specs-storybook.mjs`; on change PM2 restarts
 * the dev server, which runs `sync-specs-docs` then Storybook (regenerates gitignored `docs/specs/*.mdx`).
 *
 * Start:  pnpm pm2:start
 * Reset:  `pnpm pm2:reset` — stop + SIGKILL LISTEN on 3100/3101/6006 + delete + start (`scripts/pm2-ecosystem-reset.mjs`).
 * Ports:  `pnpm ports:kill` — only SIGKILL LISTEN PIDs (`scripts/kill-tcp-listen-ports.mjs`). Env: `PORTS`, `KILL_PORTS`, or `PM2_RESET_PORTS`.
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
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development" },
      watch: true,
      ignore_watch: ["node_modules", ".git", ".next"],
    },
    {
      name: "web",
      namespace,
      cwd: path.join(root, "apps/web"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development", CI: "true" },
      watch: false,
    },
    {
      name: "storybook",
      namespace,
      cwd: path.join(root, "packages/ui"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development", CI: "true" },
      watch: [
        "src",
        ".storybook",
        path.join(root, "specs"),
        path.join(root, "scripts", "generate-specs-storybook.mjs"),
      ],
      ignore_watch: [
        "node_modules",
        ".git",
        "dist",
        "storybook-static",
        path.join(root, "docs", "specs"),
      ],
    },
    {
      name: "extension",
      namespace,
      cwd: path.join(root, "apps/extension"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development" },
      watch: false,
    },
  ],
};
