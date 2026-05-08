import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateImportRunInput } from "./create-import-run.input";
import { ImportRunType } from "./import-run.type";
import { ImportRunStatusEnum } from "./import-run-status.enum";
import { ImportsService } from "./imports.service";

@Resolver(() => ImportRunType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ImportsResolver {
  constructor(private readonly service: ImportsService) {}

  @Query(() => [ImportRunType])
  importRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType[]> {
    return this.service.listImportRuns(user.userId);
  }

  @Mutation(() => ImportRunType)
  createImportRun(
    @Args("input") input: CreateImportRunInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType> {
    return this.service.createImportRun(user.userId, input.importerId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteImportRun(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteImportRun(user.userId, id);
    return { success: true, deletedId: id };
  }

  @Mutation(() => Boolean)
  async clearImportRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.clearImportRuns(user.userId);
    return true;
  }

  @Mutation(() => ImportRunType)
  updateImportRunStatus(
    @Args("id", { type: () => ID }) id: string,
    @Args("status", { type: () => ImportRunStatusEnum })
    status: ImportRunStatusEnum,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType> {
    return this.service.updateImportRunStatus(user.userId, id, status);
  }
}
