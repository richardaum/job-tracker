import { UserAccountEntity } from "@api/database/entities/user-account.entity";
import { AuthAccountType } from "@api/domains/users/auth-account.type";
import { UserType } from "@api/domains/users/user.type";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Resolver(() => UserType)
export class UserTypeFieldsResolver {
  constructor(
    @InjectRepository(UserAccountEntity)
    private readonly accountsRepo: Repository<UserAccountEntity>,
  ) {}

  @ResolveField(() => [AuthAccountType])
  async accounts(@Parent() user: { id: string }): Promise<AuthAccountType[]> {
    return this.accountsRepo.find({
      where: { userId: user.id },
      order: { createdAt: "ASC" },
    });
  }
}
