import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { PreferenceInput } from "./preference.input";
import { PreferenceType } from "./preference.type";
import { UserPreferencesService } from "./user-preferences.service";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class UserPreferencesResolver {
  constructor(private readonly service: UserPreferencesService) {}

  @Query(() => [PreferenceType])
  userPreferences(
    @CurrentUser() user: { userId: string },
  ): Promise<PreferenceType[]> {
    return this.service.findPreferences(user.userId);
  }

  @Mutation(() => [PreferenceType])
  updateUserPreferences(
    @Args("items", { type: () => [PreferenceInput] }) items: PreferenceInput[],
    @CurrentUser() user: { userId: string },
  ): Promise<PreferenceType[]> {
    return this.service.updatePreferences(user.userId, items);
  }
}
