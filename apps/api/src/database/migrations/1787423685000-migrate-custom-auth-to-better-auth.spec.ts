import type { QueryRunner } from "typeorm";
import { describe, expect, it, vi } from "vitest";

import { MigrateCustomAuthToBetterAuth1787423685000 } from "./1787423685000-migrate-custom-auth-to-better-auth";

describe("MigrateCustomAuthToBetterAuth1787423685000", () => {
  it("copies Google identities into Better Auth accounts before removing custom auth columns", async () => {
    const query = vi.fn().mockResolvedValue(undefined);
    const migration = new MigrateCustomAuthToBetterAuth1787423685000();

    await migration.up({ query } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledWith(expect.stringContaining("provider_account_id, 'google'"));
    expect(query).toHaveBeenCalledWith("DROP TABLE user_accounts");
    expect(query).toHaveBeenCalledWith("ALTER TABLE users DROP COLUMN token_version");
    expect(query).toHaveBeenCalledWith("ALTER TABLE users DROP COLUMN refresh_jti");
  });
});
