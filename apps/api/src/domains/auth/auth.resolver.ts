import { UserType } from "@api/domains/users/user.type";
import { UserService } from "@api/domains/users/users.service";
import { UnauthorizedException, UseGuards } from "@nestjs/common";
import { Mutation, Query, Resolver } from "@nestjs/graphql";

import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  async me(@CurrentUser() currentUser: { userId: string }): Promise<UserType> {
    const user = await this.userService.findById(currentUser.userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user")
  async deactivateAccount(
    @CurrentUser() currentUser: { userId: string },
  ): Promise<boolean> {
    await this.userService.deactivateUser(currentUser.userId);
    return true;
  }
}
