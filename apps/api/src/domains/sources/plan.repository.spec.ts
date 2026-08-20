import { PlanEntity } from "@api/database/entities/plan.entity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { PlanRepository } from "./plan.repository";

describe("PlanRepository", () => {
  let store: Record<string, ReturnType<typeof vi.fn>>;
  let repo: PlanRepository;
  beforeEach(() => {
    store = { find: vi.fn(), findOneBy: vi.fn(), create: vi.fn(), save: vi.fn(), update: vi.fn(), delete: vi.fn() };
    repo = new PlanRepository(store as unknown as Repository<PlanEntity>);
  });
  it("lists, finds and creates plans", async () => {
    const row = { id: "p", userId: "u", displayName: "Plan", document: { steps: [] } };
    store.find.mockResolvedValue([]);
    store.findOneBy.mockResolvedValue(row);
    store.create.mockReturnValue(row);
    store.save.mockResolvedValue(row);
    await repo.findAll("u");
    await expect(repo.findById("p")).resolves.toBe(row);
    await expect(repo.create({ userId: "u", displayName: "Plan", document: { steps: [] } })).resolves.toBe(row);
  });
  it("updates only affected plans and deletes with scope", async () => {
    const row = { id: "p" };
    store.update.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    store.findOneBy.mockResolvedValue(row);
    store.delete.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    await expect(repo.update("p", "u", { displayName: "New" })).resolves.toBe(row);
    await expect(repo.update("p", "u", {})).resolves.toBeNull();
    await expect(repo.delete("p", "u")).resolves.toBe(true);
    await expect(repo.delete("p", "u")).resolves.toBe(false);
  });
});
