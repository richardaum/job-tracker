import { describe, expect, it, vi } from "vitest";

import { UserTypeFieldsResolver } from "./user-type.fields.resolver";

describe("UserTypeFieldsResolver — @ResolveField accounts on UserType", () => {
  const accountsRepo = { find: vi.fn() };
  const resolver = new UserTypeFieldsResolver(accountsRepo as never);

  it("calls accountsRepo.find per parent user", async () => {
    vi.mocked(accountsRepo.find).mockResolvedValue([]);

    const result = await resolver.accounts({ id: "user-1" });

    expect(result).toEqual([]);
    expect(accountsRepo.find).toHaveBeenCalledWith({ where: { userId: "user-1" }, order: { createdAt: "ASC" } });
  });
});
