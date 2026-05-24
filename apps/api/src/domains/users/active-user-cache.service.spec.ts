import { afterEach, describe, expect, it, vi } from "vitest";

import { ActiveUserCacheService } from "./active-user-cache.service";
import { RoleEnum } from "./role.enum";
import type { User } from "./users.schema";

const mockUser: User = {
  id: "uuid-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  role: RoleEnum.User,
  active: true,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  accounts: [],
};

describe("ActiveUserCacheService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when no entry exists", () => {
    const service = new ActiveUserCacheService();
    expect(service.get("uuid-1", 0)).toBeNull();
  });

  it("returns cached user after set", () => {
    const service = new ActiveUserCacheService();
    service.set("uuid-1", 0, mockUser);
    expect(service.get("uuid-1", 0)).toBe(mockUser);
  });

  it("returns null after TTL expires", () => {
    vi.useFakeTimers();
    const service = new ActiveUserCacheService();
    service.set("uuid-1", 0, mockUser);
    vi.advanceTimersByTime(30_001);
    expect(service.get("uuid-1", 0)).toBeNull();
  });

  it("keeps entries for different token versions separate", () => {
    const service = new ActiveUserCacheService();
    const userV1 = { ...mockUser, tokenVersion: 1 };
    service.set("uuid-1", 0, mockUser);
    service.set("uuid-1", 1, userV1);
    expect(service.get("uuid-1", 0)).toBe(mockUser);
    expect(service.get("uuid-1", 1)).toBe(userV1);
  });

  it("invalidate removes all entries for the user", () => {
    const service = new ActiveUserCacheService();
    service.set("uuid-1", 0, mockUser);
    service.set("uuid-1", 1, { ...mockUser, tokenVersion: 1 });
    service.set("uuid-2", 0, { ...mockUser, id: "uuid-2" });
    service.invalidate("uuid-1");
    expect(service.get("uuid-1", 0)).toBeNull();
    expect(service.get("uuid-1", 1)).toBeNull();
    expect(service.get("uuid-2", 0)).not.toBeNull();
  });
});
