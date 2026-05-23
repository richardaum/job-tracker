#!/usr/bin/env node
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allocatePorts,
  buildDestinationDatabaseUrl,
  buildDestinationTestDatabaseUrl,
  buildWorktreeApiEnv,
  buildWorktreeExtensionEnv,
  buildWorktreeStorybookEnv,
  buildWorktreeWebEnv,
  dbNameForSlug,
  type GlobalRegistry,
  mergeEnvMap,
  parseEnvFile,
  testDbNameForSlug,
  validateSlug,
  worktreeWebUrl,
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

  it("buildWorktreeApiEnv sets computed overrides", () => {
    const env = buildWorktreeApiEnv({
      ports: { api: 3105, web: 3106, storybook: 6007, wxt: 3002 },
      databaseUrl: "postgresql://localhost/job_tracker_feat_a",
      e2eDatabaseUrl: "postgresql://localhost/job_tracker_test_feat_a",
    });
    assert.equal(env.DATABASE_URL, "postgresql://localhost/job_tracker_feat_a");
    assert.equal(env.PORT, "3105");
    assert.equal(
      env.GOOGLE_CALLBACK_URL,
      "http://localhost:3105/auth/google/callback",
    );
    assert.equal(env.WEB_URL, "http://localhost:3106");
  });

  it("buildWorktreeWebEnv sets computed overrides", () => {
    const env = buildWorktreeWebEnv({
      ports: { api: 3105, web: 3106, storybook: 6007, wxt: 3002 },
    });
    assert.equal(env.PORT, "3106");
    assert.equal(env.NEXT_PUBLIC_API_URL, "http://localhost:3105");
    assert.equal(env.E2E_PORT, "3106");
  });

  it("mergeEnvMap overrides base with overrides", () => {
    const merged = mergeEnvMap(
      { FOO: "base", BAR: "base" },
      { BAR: "override", BAZ: "new" },
    );
    assert.equal(merged.FOO, "base");
    assert.equal(merged.BAR, "override");
    assert.equal(merged.BAZ, "new");
  });

  it("buildWorktreeStorybookEnv sets STORYBOOK_PORT", () => {
    const env = buildWorktreeStorybookEnv({
      ports: { api: 3105, web: 3106, storybook: 6007, wxt: 3002 },
    });
    assert.equal(env.STORYBOOK_PORT, "6007");
  });

  it("buildWorktreeExtensionEnv sets WXT vars", () => {
    const env = buildWorktreeExtensionEnv({
      ports: { api: 3105, web: 3106, storybook: 6007, wxt: 3002 },
    });
    assert.equal(env.WXT_DEV_PORT, "3002");
    assert.equal(env.WXT_PUBLIC_API_URL, "http://localhost:3105");
    assert.equal(env.WXT_PUBLIC_WEB_URL, "http://localhost:3106");
  });

  it("worktreeWebUrl builds localhost web URL", () => {
    assert.equal(
      worktreeWebUrl({ api: 3105, web: 3106, storybook: 6007, wxt: 3002 }),
      "http://localhost:3106/",
    );
  });
});
