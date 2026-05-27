import { RoleEnum } from "@api/domains/users/role.enum";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { ForbiddenException, Injectable } from "@nestjs/common";

import { RoleService } from "./role.service";

@Injectable()
export class AuthUserAccessService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  async assertAuthenticatedUser(
    userId: string,
    tokenVersion: number,
    allowedRoles?: RoleEnum[],
  ): Promise<User> {
    const user = await this.userService.validateActiveUser(
      userId,
      tokenVersion,
    );
    if (allowedRoles && !this.roleService.isAllowed(user.role, allowedRoles)) {
      throw new ForbiddenException();
    }
    return user;
  }
}
