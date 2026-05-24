import { ID, Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { UserSettingType } from "./user-setting.type";

@Resolver(() => UserSettingType)
export class UserSettingFieldsResolver {
  @ResolveField(() => ID)
  id(@Parent() setting: UserSettingType): string {
    return setting.userId;
  }
}
