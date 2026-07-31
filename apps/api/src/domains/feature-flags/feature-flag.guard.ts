import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";

import { FEATURE_FLAG_KEY } from "./feature-flag.decorator";
import { PostHogService } from "./posthog.service";

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly postHogService: PostHogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagKey = this.reflector.getAllAndOverride<string | undefined>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!flagKey) return true;

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req ?? context.switchToHttp().getRequest();
    const userId = request.user?.userId as string | undefined;
    if (!userId) return false;

    const enabled = await this.postHogService.isFeatureEnabled(flagKey, userId);
    if (!enabled) throw new ForbiddenException(`Feature "${flagKey}" is not enabled for this user.`);
    return true;
  }
}
