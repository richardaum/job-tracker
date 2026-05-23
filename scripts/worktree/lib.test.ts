#!/usr/bin/env node
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allocatePorts,
  buildDestinationDatabaseUrl,
  buildDestinationTestDatabaseUrl,
  buildWorktreeEnv,
  dbNameForSlug,
  type GlobalRegistry,
  parseEnvFile,
  resolvePostgresContainer,
  testDbNameForSlug,
  validateSlug,
} from "./lib.ts";

describe("worktree lib", () => {
  it("validateSlug accepts kebab-case ≤16", () => {
    assert.equal(validateSlug("frontend-pdf"), true);
    assert.equal(validateSlug("a"), true);
    assert.equal(validateSlug("-bad"), false);
    assert.equal(validateSlug("way-too-long-slug-name"), false);
  });

  it("dbNameForSlug maps hyphens to underscores", () => {
    assert.equal(dbNameForSlug("job-fit"), "job_tracker_job_fit");
  });

  it("testDbNameForSlug maps hyphens to underscores", () => {
    assert.equal(testDbNameForSlug("job-fit"), "job_tracker_test_job_fit");
  });

  it("buildDestinationDatabaseUrl swaps database name", () => {
    const url = buildDestinationDatabaseUrl(
      "postgresql://postgres:postgres@localhost:5432/job_tracker",
      "my-feature",
    );
    assert.equal(new URL(url).pathname, "/job_tracker_my_feature");
  });

  it("buildDestinationTestDatabaseUrl swaps database name for test", () => {
    const url = buildDestinationTestDatabaseUrl(
      "postgresql://postgres:postgres@localhost:5432/job_tracker",
      "my-feature",
    );
    assert.equal(new URL(url).pathname, "/job_tracker_test_my_feature");
  });

  it("allocatePorts assigns distinct api/web and skips reserved main ports", () => {
    const registry: GlobalRegistry = { slugs: {} };
    const ports = allocatePorts("feat-a", registry);
    assert.notEqual(ports.api, ports.web);
    for (const p of Object.values(ports)) {
      assert.ok(p !== 3100 && p !== 3101);
    }
    registry.slugs["feat-a"] = ports;
    const again = allocatePorts("feat-a", registry);
    assert.deepEqual(again, ports);
  });

  it("parseEnvFile strips quotes and ignores comments", () => {
    const map = parseEnvFile(`
# comment
FOO=bar
BAZ="quoted"
`);
    assert.equal(map.FOO, "bar");
    assert.equal(map.BAZ, "quoted");
  });

  it("buildWorktreeEnv sets auth bypass and PM2 fields", () => {
    const env = buildWorktreeEnv({
      slug: "feat-a",
      ports: { api: 3105, web: 3106, storybook: 6007, wxt: 3002 },
      secrets: {
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
        JWT_ACCESS_SECRET: "a",
        JWT_REFRESH_SECRET: "r",
      },
      databaseUrl: "postgresql://localhost/job_tracker_feat_a",
      e2eDatabaseUrl: "postgresql://localhost/job_tracker_test_feat_a",
    });
    assert.equal(env.AUTH_BYPASS_ENABLED, "true");
    assert.equal(env.PM2_APP_PREFIX, "feat-a");
    assert.equal(env.PM2_RESET_PORTS, "3105,3106,6007,3002");
    assert.equal(env.NEXT_PUBLIC_API_URL, "http://localhost:3105");
  });

  it("resolvePostgresContainer uses WORKTREE_POSTGRES_DOCKER when set", () => {
    process.env.WORKTREE_POSTGRES_DOCKER = "pg-test";
    try {
      assert.equal(resolvePostgresContainer("/tmp"), "pg-test");
    } finally {
      delete process.env.WORKTREE_POSTGRES_DOCKER;
    }
  });
});
