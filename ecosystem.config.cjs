/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const root = path.resolve(__dirname);

/**
 * PM2 ecosystem — dev processes for this monorepo.
 *
 * Start:  yarn pm2:start
 * Stop:   yarn pm2:stop
 * Restart with refreshed env: yarn pm2:restart
 *        → runs: pm2 restart ecosystem.config.cjs --update-env
 */
module.exports = {
  apps: [
    {
      name: "api",
      namespace: "job-tracker",
      cwd: path.join(root, "apps/api"),
      script: "pnpm",
      args: "run dev:debug",
      interpreter: "none",
      env: {
        NODE_ENV: "development",
      },
      watch: ["apps/api/src", "packages/shared"],
      ignore_watch: ["node_modules", ".git", "dist"],
    },
    {
      name: "web",
      namespace: "job-tracker",
      cwd: path.join(root, "apps/web"),
      script: "node_modules/.bin/next",
      args: "dev --port 3100",
      interpreter: "none",
      env: {
        NODE_ENV: "development",
        CI: "true",
      },
      watch: ["apps/web/src", "apps/web/next.config.ts"],
      ignore_watch: ["node_modules", ".git", ".next"],
    },
    {
      name: "storybook",
      namespace: "job-tracker",
      cwd: path.join(root, "packages/ui"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: {
        NODE_ENV: "development",
        CI: "true",
      },
      watch: ["packages/ui/src", "packages/ui/.storybook"],
      ignore_watch: ["node_modules", ".git", "dist", "storybook-static"],
    },
  ],
};
