import { UserService } from "@api/domains/users/users.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";

import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req ?? context.switchToHttp().getRequest();
    const { user } = request;
    if (!user?.userId) return false;

    if (user.role) {
      return requiredRoles.includes(user.role);
    }

    const dbUser = await this.userService.findById(user.userId);
    return !!dbUser && requiredRoles.includes(dbUser.role);
  }
}
