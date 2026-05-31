import { Injectable } from "@nestjs/common";

import type { User } from "./users.schema";

const ACTIVE_USER_CACHE_TTL_MS = 30_000;

@Injectable()
export class ActiveUserCacheService {
  private readonly cache = new Map<string, { user: User; exp: number }>();

  get(userId: string, tokenVersion: number): User | null {
    const cacheKey = `${userId}:${tokenVersion}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.exp > Date.now()) {
      return cached.user;
    }
    return null;
  }

  set(userId: string, tokenVersion: number, user: User): void {
    this.cache.set(`${userId}:${tokenVersion}`, { user, exp: Date.now() + ACTIVE_USER_CACHE_TTL_MS });
  }

  invalidate(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}
