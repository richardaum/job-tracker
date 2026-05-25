import "reflect-metadata";

import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let service: SettingsService;
  let repo: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repo = { findOne: vi.fn(), create: vi.fn(), save: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(UserSettingEntity), useValue: repo },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  it("getSettings on first call creates row with defaults", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue({ userId: "user-1" });
    repo.save.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
    });

    const result = await service.getSettings("user-1");

    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(repo.create).toHaveBeenCalledWith({ userId: "user-1" });
    expect(repo.save).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toMatchObject({
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
    });
  });

  it("getSettings on second call returns existing row without creating new one", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 7,
    };
    repo.findOne.mockResolvedValue(existing);

    const result = await service.getSettings("user-1");

    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 7,
    });
  });

  it("updateSettings partial update — only changes provided fields, leaves others unchanged", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", {
      autoFillEnabled: true,
    });

    expect(repo.save).toHaveBeenCalled();
    expect(result.autoFillEnabled).toBe(true);
    expect(result.autoSummaryEnabled).toBe(false);
    expect(result.duplicateWindowDays).toBe(30);
  });

  it("updateSettings with no fields — saves unchanged settings", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", {});

    expect(repo.save).toHaveBeenCalled();
    expect(result.autoFillEnabled).toBe(false);
    expect(result.autoSummaryEnabled).toBe(false);
    expect(result.duplicateWindowDays).toBe(30);
  });
});
