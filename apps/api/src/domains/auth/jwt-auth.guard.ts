import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

import { DevAuthBypassService } from "./dev-auth-bypass.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly devAuthBypassService: DevAuthBypassService) {
    super();
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

    return (await super.canActivate(context)) as boolean;
  }
}
