import { ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

import { AuthUserAccessService } from "./auth-user-access.service";
import { DevAuthBypassService } from "./dev-auth-bypass.service";

type JwtUser = { userId: string; tokenVersion: number };

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly devAuthBypassService: DevAuthBypassService,
    private readonly authUserAccessService: AuthUserAccessService,
  ) {
    super();
  }

  override handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
    if (err || !user) {
      const infoName = info instanceof Error ? info.name : undefined;
      const infoMessage = info instanceof Error ? info.message : info ? String(info) : undefined;
      this.logger.warn(
        `jwt auth denied err=${err instanceof Error ? `${err.name}: ${err.message}` : String(err)} info=${infoName ?? "none"}:${infoMessage ?? "none"}`,
      );
      throw err instanceof Error ? err : new UnauthorizedException();
    }
    return user;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req ?? context.switchToHttp().getRequest();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.devAuthBypassService.isEnabled()) {
      const request = this.getRequest(context);
      const user = await this.devAuthBypassService.getBypassUser();
      request.user = { userId: user.id };
      return true;
    }

    const result = (await super.canActivate(context)) as boolean;
    if (!result) return false;

    const request = this.getRequest(context);
    const jwtUser = request.user as JwtUser | undefined;
    if (!jwtUser?.userId) return false;

    const dbUser = await this.authUserAccessService.assertAuthenticatedUser(jwtUser.userId, jwtUser.tokenVersion);

    request.user = { userId: dbUser.id };
    return true;
  }
}
