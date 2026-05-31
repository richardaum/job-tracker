import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

import { DevAuthBypassService } from "./dev-auth-bypass.service";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private readonly devAuthBypassService: DevAuthBypassService) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.devAuthBypassService.isEnabled()) {
      const request = context.switchToHttp().getRequest<Request & { user?: { id: string; tokenVersion: number } }>();
      const user = await this.devAuthBypassService.getBypassUser();
      request.user = { id: user.id, tokenVersion: user.tokenVersion };
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext): { state?: string } {
    const request = context.switchToHttp().getRequest<Request>();
    const returnTo = getSafeReturnTo(request.query.returnTo);

    return returnTo ? { state: returnTo } : {};
  }
}
