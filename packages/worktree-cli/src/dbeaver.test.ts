#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  addWorktreeDBeaverConnection,
  dbeaverConnectionId,
  removeWorktreeDBeaverConnection,
} from "./dbeaver.ts";

const tag = "[test]";

describe("dbeaver", () => {
  it("dbeaverConnectionId is stable per slug", () => {
    assert.equal(dbeaverConnectionId("job-fit"), "postgres-jdbc-wt-job-fit");
  });

  it("add then remove updates data-sources.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "jt-dbeaver-"));
    const path = join(dir, "data-sources.json");
    const seed = {
      folders: { "Job Tracker": {} },
      connections: {},
      "connection-types": { dev: { name: "Development" } },
    };
    writeFileSync(path, `${JSON.stringify(seed, null, 2)}\n`, "utf8");

    const databaseUrl = "postgresql://postgres:postgres@localhost:5432/job_tracker_feat_x";
    addWorktreeDBeaverConnection({
      tag,
      slug: "feat-x",
      databaseUrl,
      dataSourcesPath: path,
    });

    const afterAdd = JSON.parse(readFileSync(path, "utf8")) as {
      connections: Record<string, { name: string }>;
    };
    const added = afterAdd.connections[dbeaverConnectionId("feat-x")] as {
      name: string;
      configuration: Record<string, unknown>;
    };
    assert.equal(added?.name, "feat-x");
    assert.equal("password" in (added?.configuration ?? {}), false);

    removeWorktreeDBeaverConnection({
      tag,
      slug: "feat-x",
      dataSourcesPath: path,
    });

    const afterRemove = JSON.parse(readFileSync(path, "utf8")) as {
      connections: Record<string, unknown>;
    };
    assert.equal(afterRemove.connections[dbeaverConnectionId("feat-x")], undefined);

    rmSync(dir, { recursive: true, force: true });
  });
});
