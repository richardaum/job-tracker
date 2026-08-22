import { betterAuth } from "@api/domains/auth/better-auth.module";
import { UserService } from "@api/domains/users/users.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Request, Response } from "express";

import { DevAuthBypassService } from "./dev-auth-bypass.service";

type RequestWithUser = Request & { user?: { userId: string } };

function toHeaders(headers: Request["headers"]): Headers {
  const result = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (value !== undefined) result.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  return result;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly devAuthBypassService: DevAuthBypassService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    if (this.devAuthBypassService.isEnabled()) {
      const user = await this.devAuthBypassService.getBypassUser();
      request.user = { userId: user.id };
      return true;
    }

    const sessionResult = await betterAuth.api.getSession({ headers: toHeaders(request.headers), returnHeaders: true });
    const session = sessionResult.response;
    if (!session) throw new UnauthorizedException();
    this.copySessionCookies(sessionResult.headers, context);

    const user = await this.userService.validateActiveUser(session.user.id);
    request.user = { userId: user.id };
    return true;
  }

  private getRequest(context: ExecutionContext): RequestWithUser {
    const gqlContext = GqlExecutionContext.create(context);
    return (gqlContext.getContext().req ?? context.switchToHttp().getRequest()) as RequestWithUser;
  }

  private copySessionCookies(headers: Headers, context: ExecutionContext): void {
    const response = GqlExecutionContext.create(context).getContext().res as Response | undefined;
    if (!response) return;

    const setCookies = headers.getSetCookie();
    if (setCookies.length > 0) response.append("set-cookie", setCookies);
  }
}
