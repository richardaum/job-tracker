import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";
import { UserType } from "./user.type";
import { UserService } from "./users.service";

@Resolver()
export class RegistrationsResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  async registrations(
    @Args("status", { type: () => UserStatusEnum, nullable: true }) status?: UserStatusEnum,
  ): Promise<UserType[]> {
    return this.userService.listRegistrations(status);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  async approveRegistration(@Args("userId", { type: () => ID }) userId: string): Promise<UserType> {
    return this.userService.approveRegistration(userId);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  async rejectRegistration(@Args("userId", { type: () => ID }) userId: string): Promise<UserType> {
    return this.userService.rejectRegistration(userId);
  }
}
