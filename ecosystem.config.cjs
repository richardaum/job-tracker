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
 * Stop:   pnpm pm2:stop
 * Restart with refreshed env: pnpm pm2:restart
 *        → runs: pm2 restart ecosystem.config.cjs --update-env
 */
module.exports = {
  apps: [
    {
      name: "api",
      namespace,
      cwd: path.join(root, "apps/api"),
      script: "pnpm",
      args: "run dev:stable",
      interpreter: "none",
      env: { NODE_ENV: "development" },
      watch: ["src"],
      // Nest writes `src/schema.gql` on boot (GraphQL autoSchemaFile); ignore so PM2 does not restart in a loop.
      ignore_watch: ["node_modules", ".git", "dist", "src/schema.gql"],
    },
    {
      name: "web",
      namespace,
      cwd: path.join(root, "apps/web"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development", CI: "true" },
      watch: ["src", "next.config.ts"],
      ignore_watch: ["node_modules", ".git", ".next"],
    },
    {
      name: "storybook",
      namespace,
      cwd: path.join(root, "packages/ui"),
      script: "pnpm",
      args: "run dev",
      interpreter: "none",
      env: { NODE_ENV: "development", CI: "true" },
      // Regenerate `docs/specs/*.mdx` on each restart; watch LeanSpec sources + generator only (not `docs/specs/` — avoids a restart loop when the script writes output).
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
      env: { NODE_ENV: "development", JOB_TRACKER_EXTENSION_DEBUG_INGEST: "1" },
      watch: ["src", "scripts"],
      ignore_watch: ["node_modules", ".git", "build", ".plasmo"],
    },
  ],
};
