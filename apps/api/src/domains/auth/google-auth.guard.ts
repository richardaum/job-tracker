import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";
import type { UserStatusEnum } from "@api/domains/users/user-status.enum";
import { ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

import { DevAuthBypassService } from "./dev-auth-bypass.service";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  constructor(private readonly devAuthBypassService: DevAuthBypassService) {
    super();
  }

  override handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      const infoName = info instanceof Error ? info.name : undefined;
      const infoMessage = info instanceof Error ? info.message : info ? String(info) : undefined;
      this.logger.warn(
        `google auth denied err=${err instanceof Error ? `${err.name}: ${err.message}` : String(err)} info=${infoName ?? "none"}:${infoMessage ?? "none"}`,
      );
      throw err instanceof Error ? err : new UnauthorizedException();
    }
    return user;
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.devAuthBypassService.isEnabled()) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: { id: string; tokenVersion: number; status: UserStatusEnum } }>();
      const user = await this.devAuthBypassService.getBypassUser();
      request.user = { id: user.id, tokenVersion: user.tokenVersion, status: user.status };
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
