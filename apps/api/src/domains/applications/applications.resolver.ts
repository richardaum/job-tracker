import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { ApplicationService } from "./applications.service";
import { ApplicationType } from "./application.type";
import { CreateApplicationInput } from "./create-application.input";
import { UpdateApplicationInput } from "./update-application.input";

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ApplicationResolver {
  constructor(private readonly service: ApplicationService) {}

  @Query(() => [ApplicationType])
  applications(
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => ApplicationType)
  application(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => ApplicationType)
  createApplication(
    @Args("input") input: CreateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.create(user.userId, input);
  }

  @Mutation(() => ApplicationType)
  updateApplication(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => Boolean)
  async deleteApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.remove(id, user.userId);
    return true;
  }
}
