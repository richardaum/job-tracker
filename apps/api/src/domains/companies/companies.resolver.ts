import { Resolver, Query, Mutation, Args, ID, Int } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { CompanyService } from "./companies.service";
import { CompanyType } from "./company.type";
import { UpdateCompanyInput } from "./update-company.input";

@Resolver(() => CompanyType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class CompaniesResolver {
  constructor(private readonly service: CompanyService) {}

  @Query(() => [CompanyType])
  companies(@CurrentUser() user: { userId: string }): Promise<CompanyType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => Int)
  companyApplicationsCount(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<number> {
    return this.service.applicationsCount(id, user.userId);
  }

  @Mutation(() => CompanyType)
  updateCompany(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateCompanyInput,
    @CurrentUser() user: { userId: string },
  ): Promise<CompanyType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => Boolean)
  async deleteCompany(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.remove(id, user.userId);
    return true;
  }
}
