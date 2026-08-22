import { UserType } from "@api/domains/users/user.type";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { BetterAuthAccountRepository } from "./better-auth-account.repository";

@Resolver(() => UserType)
export class BetterAuthUserFieldsResolver {
  constructor(private readonly accounts: BetterAuthAccountRepository) {}

  @ResolveField(() => [String])
  authProviders(@Parent() user: { id: string }): Promise<string[]> {
    return this.accounts.findProviderIds(user.id);
  }
}
