import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { ResetTourProgressInput } from "./reset-tour-progress.input";
import { SaveTourProgressInput } from "./save-tour-progress.input";
import { TourProgressService } from "./tour-progress.service";
import { TourProgressType } from "./tour-progress.type";

@Resolver(() => TourProgressType)
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class TourProgressResolver {
  constructor(private readonly service: TourProgressService) {}

  @Query(() => TourProgressType, { nullable: true })
  tourProgress(
    @Args("tourId") tourId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<TourProgressType | null> {
    return this.service.findByUserAndTourId(user.userId, tourId);
  }

  @Mutation(() => TourProgressType)
  saveTourProgress(
    @Args("input") input: SaveTourProgressInput,
    @CurrentUser() user: { userId: string },
  ): Promise<TourProgressType> {
    return this.service.save(user.userId, input);
  }

  @Mutation(() => TourProgressType)
  resetTourProgress(
    @Args("input") input: ResetTourProgressInput,
    @CurrentUser() user: { userId: string },
  ): Promise<TourProgressType> {
    return this.service.reset(user.userId, input);
  }
}
