import { PlanEntity } from "@api/database/entities/plan.entity";
import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlanService } from "./plan.service";

function makePlan(): PlanEntity {
  const plan = new PlanEntity();
  plan.id = "plan-1";
  plan.userId = "user-1";
  plan.displayName = "Weekly search";
  plan.document = { steps: [] };
  plan.createdAt = new Date("2026-01-01");
  plan.updatedAt = new Date("2026-01-01");
  return plan;
}

class PlanRepositoryStub {
  findAll = vi.fn<(userId: string) => Promise<PlanEntity[]>>();
  findById = vi.fn<(id: string) => Promise<PlanEntity | null>>();
  create =
    vi.fn<(params: { displayName: string; document: PlanEntity["document"]; userId: string }) => Promise<PlanEntity>>();
  update =
    vi.fn<
      (
        id: string,
        userId: string,
        params: Partial<Pick<PlanEntity, "displayName" | "document">>,
      ) => Promise<PlanEntity | null>
    >();
  delete = vi.fn<(id: string, userId: string) => Promise<boolean>>();
}

describe("PlanService", () => {
  let repo: PlanRepositoryStub;
  let service: PlanService;

  beforeEach(() => {
    repo = new PlanRepositoryStub();
    service = new PlanService(repo);
  });

  it("lists plans for a user", async () => {
    const plan = makePlan();
    repo.findAll.mockResolvedValue([plan]);

    await expect(service.findAll("user-1")).resolves.toEqual([plan]);
  });

  it("finds a plan or reports it missing", async () => {
    repo.findById.mockResolvedValue(makePlan());
    await expect(service.findById("plan-1")).resolves.toEqual(makePlan());

    repo.findById.mockResolvedValue(null);
    await expect(service.findById("plan-1")).rejects.toThrow(NotFoundException);
  });

  it("creates a plan scoped to the user", async () => {
    const plan = makePlan();
    const document = { steps: [{ type: "search" }] };
    repo.create.mockResolvedValue(plan);

    await expect(service.create({ displayName: "Weekly search", document }, "user-1")).resolves.toBe(plan);
    expect(repo.create).toHaveBeenCalledWith({ displayName: "Weekly search", document, userId: "user-1" });
  });

  it("rejects updating a missing plan", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.update("plan-1", { displayName: "New" }, "user-1")).rejects.toThrow(NotFoundException);
  });

  it("updates only supplied plan fields", async () => {
    const existing = makePlan();
    const updated = makePlan();
    updated.displayName = "New";
    const document = { steps: [{ type: "search" }] };
    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    await expect(service.update("plan-1", { displayName: "New", document }, "user-1")).resolves.toBe(updated);
    expect(repo.update).toHaveBeenCalledWith("plan-1", "user-1", { displayName: "New", document });
  });

  it("reports a plan that disappears during update", async () => {
    repo.findById.mockResolvedValue(makePlan());
    repo.update.mockResolvedValue(null);

    await expect(service.update("plan-1", {}, "user-1")).rejects.toThrow(NotFoundException);
  });

  it("deletes a plan or reports it missing", async () => {
    repo.delete.mockResolvedValue(true);
    await expect(service.delete("plan-1", "user-1")).resolves.toBeUndefined();

    repo.delete.mockResolvedValue(false);
    await expect(service.delete("plan-1", "user-1")).rejects.toThrow(NotFoundException);
  });
});
