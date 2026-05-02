#!/usr/bin/env node

/**
 * TypeORM migrations are plain TypeScript classes; this script does not auto-squash them.
 *
 * To consolidate schema history in TypeORM:
 * 1. Manually merge SQL from pending migrations into a single new migration class
 *    under `src/database/migrations/` (or generate via `typeorm migration:generate`
 *    against a scratch database that matches production).
 * 2. Remove superseded migration files and keep chronological `timestamp-name.ts` ordering.
 * 3. For databases that already executed older TypeORM migrations, use manual baselining
 *    (insert into `typeorm_migrations`) — see `specs/021-technical-typeorm-data-layer/README.md`.
 */

console.log(
  "[migrate:squash] Migrations are plain TypeScript classes in src/database/migrations/.",
);
console.log(
  "[migrate:squash] Edit this script or project docs if you add an automated squasher.",
);
process.exit(0);
