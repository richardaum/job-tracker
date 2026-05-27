import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { SettingsService } from "./settings.service";
import { UpdateSettingsInput } from "./update-settings.input";
import { UserSettingType } from "./user-setting.type";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class SettingsResolver {
  constructor(private readonly service: SettingsService) {}

  @Query(() => UserSettingType)
  settings(@CurrentUser() user: { userId: string }): Promise<UserSettingType> {
    return this.service.getSettings(user.userId);
  }

  @Mutation(() => UserSettingType)
  updateSettings(
    @Args("input", { type: () => UpdateSettingsInput })
    input: UpdateSettingsInput,
    @CurrentUser() user: { userId: string },
  ): Promise<UserSettingType> {
    return this.service.updateSettings(user.userId, input);
  }
}
