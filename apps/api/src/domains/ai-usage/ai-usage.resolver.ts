import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import type { AiUsageSummary } from "./ai-usage.schema";
import { AiUsageService } from "./ai-usage.service";
import { AiUsageSummaryType } from "./ai-usage.type";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class AiUsageResolver {
  constructor(private readonly service: AiUsageService) {}

  @Query(() => AiUsageSummaryType)
  aiUsage(@CurrentUser() user: { userId: string }): Promise<AiUsageSummary> {
    return this.service.getSummary(user.userId);
  }
}
