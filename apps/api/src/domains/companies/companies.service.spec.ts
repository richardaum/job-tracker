import { CompanyEntity } from "@api/database/entities/company.entity";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Company, NewCompany } from "./companies.schema";
import { CompanyService } from "./companies.service";

const validDocument = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

function makeCompany(name = "Acme"): Company {
  const company = new CompanyEntity();
  company.id = "company-1";
  company.userId = "user-1";
  company.name = name;
  company.description = null;
  company.jobs = [];
  company.createdAt = new Date("2026-01-01");
  company.updatedAt = new Date("2026-01-01");
  return company;
}

class CompanyRepositoryStub {
  findAllByUserId = vi.fn<(userId: string) => Promise<Company[]>>();
  findOneById = vi.fn<(id: string, userId: string) => Promise<Company | null>>();
  findOneByNameInsensitiveTrimmed = vi.fn<(userId: string, name: string) => Promise<Company | null>>();
  findOrCreateByName = vi.fn<(userId: string, name: string) => Promise<Company>>();
  update = vi.fn<(id: string, userId: string, dto: Partial<NewCompany>) => Promise<Company | null>>();
  countJobs = vi.fn<(id: string, userId: string) => Promise<number>>();
  delete = vi.fn<(id: string, userId: string) => Promise<boolean>>();
}

describe("CompanyService", () => {
  let repo: CompanyRepositoryStub;
  let service: CompanyService;

  beforeEach(() => {
    repo = new CompanyRepositoryStub();
    service = new CompanyService(repo);
  });

  it("lists companies for the user", async () => {
    repo.findAllByUserId.mockResolvedValue([makeCompany()]);

    await expect(service.findAll("user-1")).resolves.toEqual([makeCompany()]);
    expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1");
  });

  it("throws when a company is not owned by the user", async () => {
    repo.findOneById.mockResolvedValue(null);

    await expect(service.findOne("company-1", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("delegates find-or-create by name", async () => {
    repo.findOrCreateByName.mockResolvedValue(makeCompany());

    await expect(service.findOrCreateByName("user-1", "Acme")).resolves.toEqual(makeCompany());
    expect(repo.findOrCreateByName).toHaveBeenCalledWith("user-1", "Acme");
  });

  it("rejects invalid rich-text descriptions", async () => {
    await expect(service.update("company-1", "user-1", { description: "plain text" })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("rejects an empty name after trimming", async () => {
    await expect(service.update("company-1", "user-1", { name: "  " })).rejects.toThrow(BadRequestException);
  });

  it("rejects a case-insensitive name clash", async () => {
    repo.findOneByNameInsensitiveTrimmed.mockResolvedValue(makeCompany("Existing"));

    await expect(service.update("company-2", "user-1", { name: " existing " })).rejects.toThrow(ConflictException);
  });

  it("normalizes a name and accepts a valid description", async () => {
    const updated = makeCompany("Acme");
    repo.findOneByNameInsensitiveTrimmed.mockResolvedValue(null);
    repo.update.mockResolvedValue(updated);

    await expect(service.update("company-1", "user-1", { name: " Acme ", description: validDocument })).resolves.toBe(
      updated,
    );
    expect(repo.update).toHaveBeenCalledWith("company-1", "user-1", { name: "Acme", description: validDocument });
  });

  it("throws when the company disappears during update", async () => {
    repo.update.mockResolvedValue(null);

    await expect(service.update("company-1", "user-1", {})).rejects.toThrow(NotFoundException);
  });

  it("counts jobs only after checking ownership", async () => {
    repo.findOneById.mockResolvedValue(makeCompany());
    repo.countJobs.mockResolvedValue(3);

    await expect(service.jobsCount("company-1", "user-1")).resolves.toBe(3);
    expect(repo.countJobs).toHaveBeenCalledWith("company-1", "user-1");
  });

  it("removes an owned company", async () => {
    repo.findOneById.mockResolvedValue(makeCompany());
    repo.delete.mockResolvedValue(true);

    await expect(service.remove("company-1", "user-1")).resolves.toBeUndefined();
  });

  it("reports a company that disappears during deletion", async () => {
    repo.findOneById.mockResolvedValue(makeCompany());
    repo.delete.mockResolvedValue(false);

    await expect(service.remove("company-1", "user-1")).rejects.toThrow(NotFoundException);
  });
});
