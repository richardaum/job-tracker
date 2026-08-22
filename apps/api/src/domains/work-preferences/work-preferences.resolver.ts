import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { PreferenceInput } from "./preference.input";
import { PreferenceType } from "./preference.type";
import { WorkPreferencesService } from "./work-preferences.service";

@Resolver()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class WorkPreferencesResolver {
  constructor(private readonly service: WorkPreferencesService) {}

  @Query(() => [PreferenceType])
  workPreferences(@CurrentUser() user: { userId: string }): Promise<PreferenceType[]> {
    return this.service.findPreferences(user.userId);
  }

  @Mutation(() => [PreferenceType])
  updateWorkPreferences(
    @Args("items", { type: () => [PreferenceInput] }) items: PreferenceInput[],
    @CurrentUser() user: { userId: string },
  ): Promise<PreferenceType[]> {
    return this.service.updatePreferences(user.userId, items);
  }
}
