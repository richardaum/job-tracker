import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ApplicationService } from "./applications.service";
import { ApplicationRepository } from "./applications.repository";
import { Application } from "./applications.schema";

const makeApp = (overrides: Partial<Application> = {}): Application => ({
  id: "app-1",
  userId: "user-1",
  title: "Engineer",
  company: "Acme",
  url: null,
  appliedAt: new Date("2026-01-01"),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("ApplicationService", () => {
  let service: ApplicationService;
  let repo: ApplicationRepository;

  beforeEach(() => {
    repo = {
      findAllByUserId: vi.fn(),
      findOneByIdAndUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApplicationRepository;
    service = new ApplicationService(repo);
  });

  it("findAll delegates to repo", async () => {
    vi.mocked(repo.findAllByUserId).mockResolvedValue([makeApp()]);
    const result = await service.findAll("user-1");
    expect(result).toHaveLength(1);
    expect(repo.findAllByUserId).toHaveBeenCalledWith("user-1");
  });

  it("findOne returns application when found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(makeApp());
    const result = await service.findOne("app-1", "user-1");
    expect(result.id).toBe("app-1");
  });

  it("findOne throws NotFoundException when not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.findOne("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("create delegates to repo", async () => {
    const app = makeApp();
    vi.mocked(repo.create).mockResolvedValue(app);
    const result = await service.create("user-1", {
      title: "Engineer",
      company: "Acme",
      appliedAt: new Date("2026-01-01"),
    });
    expect(result).toBe(app);
  });

  it("update throws NotFoundException when application not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(
      service.update("app-1", "user-1", { title: "X" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("remove throws NotFoundException when application not found", async () => {
    vi.mocked(repo.findOneByIdAndUserId).mockResolvedValue(null);
    await expect(service.remove("app-1", "user-1")).rejects.toThrow(
      NotFoundException,
    );
  });
});
