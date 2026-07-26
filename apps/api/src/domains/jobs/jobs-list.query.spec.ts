import "reflect-metadata";

import { JobEntity } from "@api/database/entities/job.entity";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { JobsListQuery } from "./jobs-list.query";

const ALL_ZERO_ROW = { Draft: "0", New: "0", Applied: "0", Duplicated: "0", Rejected: "0", Active: "0", Incoming: "0" };

describe("JobsListQuery.countByQuickFilter", () => {
  let mockManager: { query: ReturnType<typeof vi.fn> };
  let query: JobsListQuery;

  beforeEach(() => {
    mockManager = { query: vi.fn() };
    const mockRepo = { manager: mockManager } as unknown as Repository<JobEntity>;
    query = new JobsListQuery(mockRepo);
  });

  function mockResultRow(row: Record<string, string>): void {
    mockManager.query.mockResolvedValue([row]);
  }

  it("returns all 7 filter keys", async () => {
    mockResultRow(ALL_ZERO_ROW);

    const result = await query.countByQuickFilter("user-1");

    expect(result).toHaveLength(7);
    expect(result.map((f) => f.key).sort()).toEqual([
      ApplicationQuickFilterEnum.Active,
      ApplicationQuickFilterEnum.Applied,
      ApplicationQuickFilterEnum.Draft,
      ApplicationQuickFilterEnum.Duplicated,
      ApplicationQuickFilterEnum.Incoming,
      ApplicationQuickFilterEnum.New,
      ApplicationQuickFilterEnum.Rejected,
    ]);
  });

  it("returns 0 for all keys when user has no jobs", async () => {
    mockResultRow(ALL_ZERO_ROW);

    const result = await query.countByQuickFilter("user-1");

    expect(result.every((f) => f.count === 0)).toBe(true);
  });

  it("returns correct counts per filter key with known data", async () => {
    mockResultRow({ Draft: "2", New: "3", Applied: "1", Duplicated: "0", Rejected: "1", Active: "4", Incoming: "2" });

    const result = await query.countByQuickFilter("user-1");

    const byKey = (key: ApplicationQuickFilterEnum) => result.find((f) => f.key === key)!;
    expect(byKey(ApplicationQuickFilterEnum.Draft).count).toBe(2);
    expect(byKey(ApplicationQuickFilterEnum.New).count).toBe(3);
    expect(byKey(ApplicationQuickFilterEnum.Applied).count).toBe(1);
    expect(byKey(ApplicationQuickFilterEnum.Duplicated).count).toBe(0);
    expect(byKey(ApplicationQuickFilterEnum.Rejected).count).toBe(1);
    expect(byKey(ApplicationQuickFilterEnum.Active).count).toBe(4);
    expect(byKey(ApplicationQuickFilterEnum.Incoming).count).toBe(2);
  });

  it("passes userId as $1 parameter", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1");

    expect(mockManager.query).toHaveBeenCalledWith(expect.any(String), ["user-1", null, null, expect.any(String)]);
  });

  it("passes company as $2 parameter when provided", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1", "Acme Corp");

    expect(mockManager.query).toHaveBeenCalledWith(expect.any(String), [
      "user-1",
      "Acme Corp",
      null,
      expect.any(String),
    ]);
  });

  it("trims company and runId before passing as params", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1", "  Acme Corp  ", "  run-uuid  ");

    const params = vi.mocked(mockManager.query).mock.calls[0]![1] as unknown[];
    expect(params[1]).toBe("Acme Corp");
    expect(params[2]).toBe("run-uuid");
  });

  it("passes runId as $3 parameter when provided", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1", undefined, "run-uuid");

    expect(mockManager.query).toHaveBeenCalledWith(expect.any(String), [
      "user-1",
      null,
      "run-uuid",
      expect.any(String),
    ]);
  });

  it("passes today ISO string as $4 parameter", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1");

    const params = vi.mocked(mockManager.query).mock.calls[0]![1] as unknown[];
    expect(params[3]).toEqual(expect.any(String));
    expect(new Date(params[3] as string).toISOString()).toBe(params[3]);
  });

  it("SQL includes COUNT + FILTER for each quick filter key", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1");

    const sql = vi.mocked(mockManager.query).mock.calls[0]![0] as string;
    expect(sql).toContain(`COUNT(*) FILTER (WHERE stage = 'Draft')`);
    expect(sql).toContain(`COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage = 'New')`);
    expect(sql).toContain(`COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage = 'Applied')`);
    expect(sql).toContain(`COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage = 'Duplicated')`);
    expect(sql).toContain(`COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage = 'Rejected')`);
    expect(sql).toContain(
      `COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage NOT IN ('New', 'Applied', 'Rejected', 'Duplicated', 'Draft'))`,
    );
    expect(sql).toContain(
      `COUNT(*) FILTER (WHERE stage != 'Draft' AND latest_stage NOT IN ('Applied', 'Rejected', 'Duplicated', 'Draft') AND has_future_scheduled = true)`,
    );
  });

  it("SQL joins companies table for company filtering", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1");

    const sql = vi.mocked(mockManager.query).mock.calls[0]![0] as string;
    expect(sql).toContain("LEFT JOIN companies c ON c.id = a.company_id");
    expect(sql).toContain("LOWER(c.name) = LOWER($2)");
  });

  it("SQL filters by user_id and optional company/runId", async () => {
    mockResultRow(ALL_ZERO_ROW);

    await query.countByQuickFilter("user-1");

    const sql = vi.mocked(mockManager.query).mock.calls[0]![0] as string;
    expect(sql).toContain("a.user_id = $1");
    expect(sql).toContain("($2::text IS NULL OR LOWER(c.name) = LOWER($2))");
    expect(sql).toContain("($3::text IS NULL OR a.source_run_id = $3)");
  });

  it("handles NaN count from DB as 0", async () => {
    const nanRow = { ...ALL_ZERO_ROW, Draft: "not-a-number" };
    mockResultRow(nanRow);

    const result = await query.countByQuickFilter("user-1");

    const draft = result.find((f) => f.key === ApplicationQuickFilterEnum.Draft)!;
    expect(draft.count).toBe(0);
  });

  it("handles empty result set gracefully", async () => {
    mockManager.query.mockResolvedValue([]);

    await expect(query.countByQuickFilter("user-1")).rejects.toThrow();
  });
});
