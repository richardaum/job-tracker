import { CompanyEntity } from "@api/database/entities/company.entity";
import { JobEntity } from "@api/database/entities/job.entity";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { CompanyRepository } from "./companies.repository";

describe("CompanyRepository", () => {
  let companies: Record<string, ReturnType<typeof vi.fn>>;
  let jobs: Record<string, ReturnType<typeof vi.fn>>;
  let repo: CompanyRepository;

  beforeEach(() => {
    companies = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      createQueryBuilder: vi.fn(),
    };
    jobs = { count: vi.fn() };
    repo = new CompanyRepository(
      companies as unknown as Repository<CompanyEntity>,
      jobs as unknown as Repository<JobEntity>,
    );
  });

  it("finds, lists, counts and deletes with user scope", async () => {
    companies.findOne.mockResolvedValue(null);
    companies.find.mockResolvedValue([]);
    jobs.count.mockResolvedValue(2);
    companies.delete.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    await expect(repo.findOneById("c", "u")).resolves.toBeNull();
    await expect(repo.findAllByUserId("u")).resolves.toEqual([]);
    await expect(repo.countJobs("c", "u")).resolves.toBe(2);
    await expect(repo.delete("c", "u")).resolves.toBe(true);
    await expect(repo.delete("c", "u")).resolves.toBe(false);
    expect(companies.find).toHaveBeenCalledWith({ where: { userId: "u" }, order: { name: "ASC" } });
  });

  it("looks up trimmed names and returns null for blank names", async () => {
    const qb = { where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn() };
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.getOne.mockResolvedValue(null);
    companies.createQueryBuilder.mockReturnValue(qb);
    await expect(repo.findOneByNameInsensitiveTrimmed("u", "  ")).resolves.toBeNull();
    await expect(repo.findOneByNameInsensitiveTrimmed("u", " Acme ")).resolves.toBeNull();
    expect(qb.andWhere).toHaveBeenCalledWith("LOWER(TRIM(c.name)) = LOWER(TRIM(:name))", { name: "Acme" });
  });

  it("creates and updates a company", async () => {
    const company = { id: "c", name: "Acme", userId: "u", description: null };
    companies.create.mockReturnValue(company);
    companies.save.mockResolvedValue(company);
    companies.findOne.mockResolvedValue(company);
    await expect(repo.create({ name: "Acme", userId: "u" })).resolves.toBe(company);
    await expect(repo.update("c", "u", { name: "New", description: "doc" })).resolves.toBe(company);
    expect(companies.save).toHaveBeenCalledWith(expect.objectContaining({ name: "New", description: "doc" }));
  });

  it("does not update a company that no longer exists", async () => {
    companies.findOne.mockResolvedValue(null);
    await expect(repo.update("c", "u", { name: "New" })).resolves.toBeNull();
  });
});
