import { ResumeEntity } from "@api/database/entities/resume.entity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { ResumeRepository } from "./resumes.repository";

describe("ResumeRepository", () => {
  let store: Record<string, ReturnType<typeof vi.fn>>;
  let repo: ResumeRepository;
  beforeEach(() => {
    store = {
      find: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    repo = new ResumeRepository(store as unknown as Repository<ResumeEntity>);
  });

  it("uses scoped criteria for listing, defaults, count and lookup", async () => {
    store.find.mockResolvedValue([]);
    store.findOne.mockResolvedValue(null);
    store.count.mockResolvedValue(1);
    await repo.findAllByUserId("u");
    await repo.findDefaultByUserId("u");
    await repo.countByUserId("u");
    await repo.findOneById("r", "u");
    await repo.unsetDefaultByUserId("u");
    expect(store.find).toHaveBeenCalledWith({
      where: { userId: "u" },
      order: { isDefault: "DESC", updatedAt: "DESC" },
    });
    expect(store.update).toHaveBeenCalledWith({ userId: "u", isDefault: true }, { isDefault: false });
  });

  it("creates, updates, and deletes resumes", async () => {
    const row = { id: "r", userId: "u", title: "CV", content: "doc", isDefault: false };
    store.create.mockReturnValue(row);
    store.save.mockResolvedValue(row);
    store.findOne.mockResolvedValue(row);
    store.delete.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    await expect(repo.create({ userId: "u", title: "CV", content: "doc" })).resolves.toBe(row);
    await expect(repo.update("r", "u", { title: "New", isDefault: true })).resolves.toBe(row);
    await expect(repo.delete("r", "u")).resolves.toBe(true);
    await expect(repo.delete("r", "u")).resolves.toBe(false);
  });

  it("returns null when there is no resume to update", async () => {
    store.findOne.mockResolvedValue(null);
    await expect(repo.update("r", "u", {})).resolves.toBeNull();
  });
});
