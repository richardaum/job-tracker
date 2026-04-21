import { Query, Resolver } from "@nestjs/graphql";
import { UseGuards, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { UserService } from "../users/users.service";
import { UserType } from "../users/user.type";

const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext<{ req: { user: { userId: string } } }>().req.user;
  },
);

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
