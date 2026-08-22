import { describe, expect, it, vi } from "vitest";

import { BetterAuthAccountRepository } from "./better-auth-account.repository";
import { BetterAuthUserFieldsResolver } from "./better-auth-user-fields.resolver";

describe("BetterAuthUserFieldsResolver", () => {
  it("exposes provider IDs from Better Auth accounts", async () => {
    const accounts = {
      findProviderIds: vi.fn().mockResolvedValue(["google"]),
    } as unknown as BetterAuthAccountRepository;
    const resolver = new BetterAuthUserFieldsResolver(accounts);

    await expect(resolver.authProviders({ id: "4e6c0a87-ecf8-4d74-bb2a-2d44a6a8529f" })).resolves.toEqual(["google"]);
  });
});
