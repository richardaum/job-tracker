import { Query, Resolver } from "@nestjs/graphql";
import { UseGuards, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { CurrentUser } from "./current-user.decorator";
import { UserService } from "@api/domains/users/users.service";
import { UserType } from "@api/domains/users/user.type";

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
}
