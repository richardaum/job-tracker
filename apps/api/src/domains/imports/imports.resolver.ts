import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { entryUrlFromExecutorPlan } from "@api/domains/imports/importer-plans";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from "@nestjs/graphql";

import { BuiltInImporterType } from "./built-in-importer.type";
import { CreateImportRunInput } from "./create-import-run.input";
import { ImportRunType } from "./import-run.type";
import { ImportRunEvent } from "./import-run-event.type";
import { ImportRunStatusEnum } from "./import-run-status.enum";
import {
  type ImportRunEventsSubscriptionRoot,
  ImportsService,
} from "./imports.service";

@Resolver(() => ImportRunType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ImportsResolver {
  constructor(
    private readonly service: ImportsService,
    private readonly planRegistry: PlanRegistryService,
  ) {}

  /** From built-in plan — not persisted on `ImportRun`. */
  @ResolveField(() => String)
  entryUrl(@Parent() run: ImportRunType): string {
    const key = this.planRegistry.normalizeImporterKey(run.importerId);
    const plan = this.planRegistry.plan(key);
    const url = plan != null ? entryUrlFromExecutorPlan(plan) : null;
    if (url == null) {
      throw new Error(
        `No listing URL in plan for importer "${run.importerId}" (run ${run.id}).`,
      );
    }
    return url;
  }

  @Query(() => [ImportRunType])
  importRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType[]> {
    return this.service.listImportRuns(user.userId);
  }

  @Query(() => [BuiltInImporterType])
  builtInImporters(): BuiltInImporterType[] {
    return [...this.planRegistry.listBuiltInImporters()];
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

  @Mutation(() => ImportRunType, { nullable: true })
  claimImportRun(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType | null> {
    return this.service.claimImportRun(user.userId, id);
  }

  @Subscription(() => ImportRunEvent)
  importRunEvents(
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<ImportRunEventsSubscriptionRoot> {
    return this.service.importRunEvents(user.userId);
  }
}
