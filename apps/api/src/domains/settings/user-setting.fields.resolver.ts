import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { ID, Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { UserSettingType } from "./user-setting.type";

@Resolver(() => UserSettingType)
export class UserSettingFieldsResolver {
  @ResolveField(() => ID)
  id(@Parent() setting: UserSettingType): string {
    return setting.userId;
  }

  @ResolveField(() => Boolean)
  hasOpenAiKey(@Parent() setting: UserSettingEntity): boolean {
    return setting.openaiApiKeyEncrypted != null;
  }
}
