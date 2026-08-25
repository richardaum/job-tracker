import "reflect-metadata";

import { describe, expect, it, vi } from "vitest";

import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import { UserService } from "./users.service";
import type { User } from "./users.schema";

function makeUser(overrides: Partial<User>): User {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "User",
    avatarUrl: null,
    role: RoleEnum.User,
    status: UserStatusEnum.Active,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("UserService.listRegistrations", () => {
  function makeService(users: User[]) {
    const userRepository = { findAll: vi.fn().mockResolvedValue(users) };
    const postHogService = { isFeatureEnabled: vi.fn() };
    return new UserService(userRepository as never, postHogService as never);
  }

  it("excludes deactivated users when no status filter is given", async () => {
    const pending = makeUser({ id: "pending-1", status: UserStatusEnum.Pending });
    const active = makeUser({ id: "active-1", status: UserStatusEnum.Active });
    const deactivated = makeUser({ id: "deactivated-1", status: UserStatusEnum.Deactivated });
    const service = makeService([pending, active, deactivated]);

    const result = await service.listRegistrations();

    expect(result).toEqual([pending, active]);
  });

  it("returns only deactivated users when explicitly filtered", async () => {
    const active = makeUser({ id: "active-1", status: UserStatusEnum.Active });
    const deactivated = makeUser({ id: "deactivated-1", status: UserStatusEnum.Deactivated });
    const service = makeService([active, deactivated]);

    const result = await service.listRegistrations(UserStatusEnum.Deactivated);

    expect(result).toEqual([deactivated]);
  });

  it("returns only pending users when filtered by pending", async () => {
    const pending = makeUser({ id: "pending-1", status: UserStatusEnum.Pending });
    const active = makeUser({ id: "active-1", status: UserStatusEnum.Active });
    const service = makeService([pending, active]);

    const result = await service.listRegistrations(UserStatusEnum.Pending);

    expect(result).toEqual([pending]);
  });

  it("filters by a case-insensitive match on name or email", async () => {
    const ana = makeUser({ id: "ana", name: "Ana Martins", email: "ana@example.com" });
    const bruno = makeUser({ id: "bruno", name: "Bruno Silva", email: "bruno@example.com" });
    const service = makeService([ana, bruno]);

    const result = await service.listRegistrations(undefined, "ANA");

    expect(result).toEqual([ana]);
  });

  it("combines status and search filters", async () => {
    const anaPending = makeUser({
      id: "ana-pending",
      name: "Ana Martins",
      email: "ana@example.com",
      status: UserStatusEnum.Pending,
    });
    const anaActive = makeUser({
      id: "ana-active",
      name: "Ana Costa",
      email: "ana.costa@example.com",
      status: UserStatusEnum.Active,
    });
    const service = makeService([anaPending, anaActive]);

    const result = await service.listRegistrations(UserStatusEnum.Pending, "ana");

    expect(result).toEqual([anaPending]);
  });

  it("ignores a blank search string", async () => {
    const ana = makeUser({ id: "ana" });
    const service = makeService([ana]);

    const result = await service.listRegistrations(undefined, "   ");

    expect(result).toEqual([ana]);
  });
});
