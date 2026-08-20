import { ResumeEntity } from "@api/database/entities/resume.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NewResume, Resume } from "./resumes.schema";
import { ResumeService } from "./resumes.service";

const validDocument = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

function makeResume(overrides: Partial<Resume> = {}): Resume {
  const resume = new ResumeEntity();
  resume.id = "resume-1";
  resume.userId = "user-1";
  resume.title = "Product engineer";
  resume.content = validDocument;
  resume.isDefault = false;
  resume.createdAt = new Date("2026-01-01");
  resume.updatedAt = new Date("2026-01-01");
  Object.assign(resume, overrides);
  return resume;
}

class ResumeRepositoryStub {
  findAllByUserId = vi.fn<(userId: string) => Promise<Resume[]>>();
  findDefaultByUserId = vi.fn<(userId: string) => Promise<Resume | null>>();
  countByUserId = vi.fn<(userId: string) => Promise<number>>();
  unsetDefaultByUserId = vi.fn<(userId: string) => Promise<void>>();
  findOneById = vi.fn<(id: string, userId: string) => Promise<Resume | null>>();
  create = vi.fn<(dto: NewResume) => Promise<Resume>>();
  update = vi.fn<(id: string, userId: string, dto: Partial<NewResume>) => Promise<Resume | null>>();
  delete = vi.fn<(id: string, userId: string) => Promise<boolean>>();
}

describe("ResumeService", () => {
  let repo: ResumeRepositoryStub;
  let service: ResumeService;

  beforeEach(() => {
    repo = new ResumeRepositoryStub();
    service = new ResumeService(repo);
  });

  it("lists and finds resumes by user", async () => {
    const resume = makeResume();
    repo.findAllByUserId.mockResolvedValue([resume]);
    repo.findOneById.mockResolvedValue(resume);

    await expect(service.findAll("user-1")).resolves.toEqual([resume]);
    await expect(service.findOne("resume-1", "user-1")).resolves.toBe(resume);
  });

  it("returns the default resume", async () => {
    const resume = makeResume({ isDefault: true });
    repo.findDefaultByUserId.mockResolvedValue(resume);

    await expect(service.findDefault("user-1")).resolves.toBe(resume);
  });

  it("throws when a resume is not found", async () => {
    repo.findOneById.mockResolvedValue(null);

    await expect(service.findOne("resume-1", "user-1")).rejects.toThrow(NotFoundException);
  });

  it("rejects invalid content when creating", async () => {
    await expect(service.create("user-1", { title: "CV", content: "not JSON" })).rejects.toThrow(BadRequestException);
  });

  it("makes the first resume the default", async () => {
    const created = makeResume({ isDefault: true });
    repo.countByUserId.mockResolvedValue(0);
    repo.create.mockResolvedValue(created);

    await expect(service.create("user-1", { title: "CV", content: validDocument })).resolves.toBe(created);
    expect(repo.unsetDefaultByUserId).toHaveBeenCalledWith("user-1");
    expect(repo.create).toHaveBeenCalledWith({
      title: "CV",
      content: validDocument,
      userId: "user-1",
      isDefault: true,
    });
  });

  it("honors an explicit default for a later resume", async () => {
    repo.countByUserId.mockResolvedValue(1);
    repo.create.mockResolvedValue(makeResume({ isDefault: true }));

    await service.create("user-1", { title: "CV", content: validDocument, isDefault: true });

    expect(repo.unsetDefaultByUserId).toHaveBeenCalledWith("user-1");
  });

  it("leaves a later resume non-default when requested", async () => {
    repo.countByUserId.mockResolvedValue(1);
    repo.create.mockResolvedValue(makeResume());

    await service.create("user-1", { title: "CV", content: validDocument });

    expect(repo.unsetDefaultByUserId).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith({
      title: "CV",
      content: validDocument,
      userId: "user-1",
      isDefault: false,
    });
  });

  it("rejects invalid content when updating", async () => {
    await expect(service.update("resume-1", "user-1", { content: "not JSON" })).rejects.toThrow(BadRequestException);
  });

  it("unsets the previous default before updating", async () => {
    const updated = makeResume({ isDefault: true });
    repo.update.mockResolvedValue(updated);

    await expect(service.update("resume-1", "user-1", { isDefault: true })).resolves.toBe(updated);
    expect(repo.unsetDefaultByUserId).toHaveBeenCalledWith("user-1");
  });

  it("throws when updating a missing resume", async () => {
    repo.update.mockResolvedValue(null);

    await expect(service.update("resume-1", "user-1", { title: "New CV" })).rejects.toThrow(NotFoundException);
  });

  it("does not allow deleting the default resume", async () => {
    repo.findOneById.mockResolvedValue(makeResume({ isDefault: true }));

    await expect(service.remove("resume-1", "user-1")).rejects.toThrow(BadRequestException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes a non-default resume and reports races", async () => {
    repo.findOneById.mockResolvedValue(makeResume());
    repo.delete.mockResolvedValue(true);
    await expect(service.remove("resume-1", "user-1")).resolves.toBeUndefined();

    repo.delete.mockResolvedValue(false);
    await expect(service.remove("resume-1", "user-1")).rejects.toThrow(NotFoundException);
  });
});
