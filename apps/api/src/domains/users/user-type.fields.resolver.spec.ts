import { describe, expect, it, vi } from "vitest";

import { UserTypeFieldsResolver } from "./user-type.fields.resolver";

describe("UserTypeFieldsResolver — @ResolveField accounts on UserType", () => {
  const accountsLoader = { load: vi.fn() };
  const resolver = new UserTypeFieldsResolver(accountsLoader as never);

  it("calls accountsLoader.load per parent user (batched via DataLoader)", async () => {
    vi.mocked(accountsLoader.load).mockResolvedValue([]);

    const result = await resolver.accounts({ id: "user-1" });

    expect(result).toEqual([]);
    expect(accountsLoader.load).toHaveBeenCalledWith("user-1");
  });
});
