import type { CompanyRepository } from "@api/domains/companies/companies.repository";
import { JobEntity } from "@api/database/entities/job.entity";
import type { SettingsService } from "@api/domains/settings/settings.service";
import type { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobDuplicateService } from "./job-duplicate.service";
import { ApplicationStageEnum } from "./job-stage.enum";

describe("JobDuplicateService", () => {
  let jobsRepo: Pick<Repository<JobEntity>, "createQueryBuilder">;
  let settingsService: Pick<SettingsService, "getSettings">;
  let companyRepo: Pick<CompanyRepository, "findOneByNameInsensitiveTrimmed">;
  let service: JobDuplicateService;

  beforeEach(() => {
    jobsRepo = { createQueryBuilder: vi.fn() };
    settingsService = { getSettings: vi.fn().mockResolvedValue({ duplicateWindowDays: 30 }) };
    companyRepo = { findOneByNameInsensitiveTrimmed: vi.fn() };
    service = new JobDuplicateService(
      jobsRepo as Repository<JobEntity>,
      settingsService as SettingsService,
      companyRepo as CompanyRepository,
    );
  });

  it("resolveInitialStageOnCreate returns New when no duplicate exists", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(0),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const stage = await service.resolveInitialStageOnCreate({
      userId: "user-1",
      jobId: "job-1",
      companyId: "company-1",
      title: "Engineer",
    });

    expect(stage).toBe(ApplicationStageEnum.NEW);
  });

  it("resolveInitialStageOnCreate returns Duplicated when a match exists", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(1),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const stage = await service.resolveInitialStageOnCreate({
      userId: "user-1",
      jobId: "job-1",
      companyId: "company-1",
      title: "Engineer",
    });

    expect(stage).toBe(ApplicationStageEnum.DUPLICATED);
  });

  it("resolveInitialStageOnCreate uses duplicate window days from settings", async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue({ duplicateWindowDays: 7 } as Awaited<
      ReturnType<SettingsService["getSettings"]>
    >);
    const referenceTime = new Date("2026-05-25T12:00:00.000Z");
    const hasRecentDuplicateSameRoleAndCompany = vi
      .spyOn(service, "hasRecentDuplicateSameRoleAndCompany")
      .mockResolvedValue(false);

    await service.resolveInitialStageOnCreate({
      userId: "user-1",
      jobId: "job-1",
      companyId: "company-1",
      title: "Engineer",
      referenceTime,
    });

    expect(hasRecentDuplicateSameRoleAndCompany).toHaveBeenCalledWith(
      "user-1",
      "job-1",
      "company-1",
      "Engineer",
      referenceTime,
      604_800_000,
    );
  });

  it("hasRecentDuplicateSameRoleAndCompany returns false when title blank", async () => {
    const hit = await service.hasRecentDuplicateSameRoleAndCompany("u1", "j1", "c1", "   ", new Date(), 86_400_000);

    expect(hit).toBe(false);
    expect(jobsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it("hasRecentDuplicateSameRoleAndCompany returns true when lookback yields matches", async () => {
    const qb = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(2),
    };
    vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

    const hit = await service.hasRecentDuplicateSameRoleAndCompany("user-1", "exclude", "comp", "Title", new Date(), 1);

    expect(hit).toBe(true);
    expect(qb.getCount).toHaveBeenCalled();
  });

  describe("checkDuplicate", () => {
    it("returns false when company cannot be resolved", async () => {
      vi.mocked(companyRepo.findOneByNameInsensitiveTrimmed).mockResolvedValue(null);

      const result = await service.checkDuplicate("Unknown Corp", "Engineer", "user-1");

      expect(result).toBe(false);
    });

    it("returns false when title is empty", async () => {
      const result = await service.checkDuplicate("Acme", "   ", "user-1");

      expect(result).toBe(false);
    });

    it("returns false when company name is empty", async () => {
      const result = await service.checkDuplicate("   ", "Engineer", "user-1");

      expect(result).toBe(false);
    });

    it("returns true when a matching job exists within the duplicate window", async () => {
      vi.mocked(companyRepo.findOneByNameInsensitiveTrimmed).mockResolvedValue({ id: "company-1" } as never);
      vi.mocked(settingsService.getSettings).mockResolvedValue({ duplicateWindowDays: 30 } as Awaited<
        ReturnType<SettingsService["getSettings"]>
      >);

      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
      };
      vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

      const result = await service.checkDuplicate("Acme", "Engineer", "user-1");

      expect(result).toBe(true);
    });

    it("returns false when no matching job exists within the duplicate window", async () => {
      vi.mocked(companyRepo.findOneByNameInsensitiveTrimmed).mockResolvedValue({ id: "company-1" } as never);
      vi.mocked(settingsService.getSettings).mockResolvedValue({ duplicateWindowDays: 30 } as Awaited<
        ReturnType<SettingsService["getSettings"]>
      >);

      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(0),
      };
      vi.mocked(jobsRepo.createQueryBuilder).mockReturnValue(qb as never);

      const result = await service.checkDuplicate("Acme", "Engineer", "user-1");

      expect(result).toBe(false);
    });
  });
});
