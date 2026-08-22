import "reflect-metadata";

import type { UserService } from "@api/domains/users/users.service";
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("./better-auth.module", () => ({ betterAuth: { api: { getSession } } }));

import type { DevAuthBypassService } from "./dev-auth-bypass.service";
import { SessionAuthGuard } from "./session-auth.guard";

function graphqlContext(request: { headers: Record<string, string>; user?: { userId: string } }): ExecutionContext {
  const response = { append: vi.fn() };
  return {
    getType: () => "graphql",
    getArgs: () => [{}, {}, { req: request, res: response }, {}],
    getClass: () => SessionAuthGuard,
    getHandler: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("SessionAuthGuard", () => {
  it("authorizes an active domain user from a Better Auth session", async () => {
    const bypass = { isEnabled: vi.fn().mockReturnValue(false) } as unknown as DevAuthBypassService;
    const userService = {
      validateActiveUser: vi.fn().mockResolvedValue({ id: "domain-user" }),
    } as unknown as UserService;
    getSession.mockResolvedValue({ response: { user: { id: "domain-user" } }, headers: new Headers() });
    const request: { headers: Record<string, string>; user?: { userId: string } } = {
      headers: { cookie: "better-auth.session_token=session-token" },
    };

    await expect(new SessionAuthGuard(bypass, userService).canActivate(graphqlContext(request))).resolves.toBe(true);

    expect(userService.validateActiveUser).toHaveBeenCalledWith("domain-user");
    expect(request.user).toEqual({ userId: "domain-user" });
  });

  it("rejects requests without a Better Auth session", async () => {
    const bypass = { isEnabled: vi.fn().mockReturnValue(false) } as unknown as DevAuthBypassService;
    const userService = {} as UserService;
    getSession.mockResolvedValue({ response: null, headers: new Headers() });

    await expect(
      new SessionAuthGuard(bypass, userService).canActivate(graphqlContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
