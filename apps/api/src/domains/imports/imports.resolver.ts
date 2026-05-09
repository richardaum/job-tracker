import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from "@nestjs/graphql";

import { CreateImportRunInput } from "./create-import-run.input";
import { CreateImportTemplateInput } from "./create-import-template.input";
import { ImportRunType } from "./import-run.type";
import { ImportRunEvent } from "./import-run-event.type";
import { ImportRunStatusEnum } from "./import-run-status.enum";
import { ImportTemplateType } from "./import-template.type";
import { ImporterDescriptorType } from "./importer-descriptor.type";
import {
  type ImportRunEventsSubscriptionRoot,
  ImportsService,
} from "./imports.service";
import { UpdateImportRunInput } from "./update-import-run.input";
import { UpdateImportTemplateInput } from "./update-import-template.input";

@Resolver(() => ImporterDescriptorType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ImportsResolver {
  constructor(
    private readonly service: ImportsService,
    private readonly planRegistry: PlanRegistryService,
  ) {}

  @Query(() => [ImportRunType])
  importRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType[]> {
    return this.service.listImportRuns(user.userId);
  }

  @Query(() => [ImportTemplateType])
  importTemplates(
    @CurrentUser() user: { userId: string },
  ): Promise<ImportTemplateType[]> {
    return this.service.listImportTemplates(user.userId);
  }

  @Query(() => [ImportTemplateType])
  importTemplatesForImporter(
    @CurrentUser() user: { userId: string },
    @Args("importerId") importerId: string,
  ): Promise<ImportTemplateType[]> {
    return this.service.listImportTemplatesForImporter(user.userId, importerId);
  }

  @Query(() => [ImporterDescriptorType])
  async importers(
    @CurrentUser() user: { userId: string },
    @Args("onlyWithImportTemplate", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    onlyWithImportTemplate: boolean,
  ): Promise<ImporterDescriptorType[]> {
    const all = [...this.planRegistry.listImporterDescriptors()];
    if (!onlyWithImportTemplate) {
      return all;
    }
    const templates = await this.service.listImportTemplates(user.userId);
    const importerIds = new Set(
      templates.map((template) => template.importerId),
    );
    return all
      .filter((row) => importerIds.has(row.importerId))
      .map((row) => ({
        ...row,
        templates: templates.filter(
          (template) => template.importerId === row.importerId,
        ),
      }));
  }

  @ResolveField(() => [ImportTemplateType])
  templates(
    @Parent() importer: ImporterDescriptorType,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportTemplateType[]> | ImportTemplateType[] {
    if (importer.templates) return importer.templates;
    return this.service.listImportTemplatesForImporter(
      user.userId,
      importer.importerId,
    );
  }

  @Mutation(() => ImportRunType)
  createImportRun(
    @Args("input") input: CreateImportRunInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType> {
    return this.service.createImportRun(user.userId, input.importerId);
  }

  @Mutation(() => ImportTemplateType)
  createImportTemplate(
    @Args("input") input: CreateImportTemplateInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportTemplateType> {
    return this.service.createImportTemplate(user.userId, input);
  }

  @Mutation(() => ImportRunType)
  rerunImportTemplate(
    @Args("templateId", { type: () => ID }) templateId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType> {
    return this.service.rerunImportTemplate(user.userId, templateId);
  }

  @Mutation(() => ImportTemplateType)
  updateImportTemplate(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateImportTemplateInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportTemplateType> {
    return this.service.updateImportTemplate(user.userId, id, {
      scheduleCron: input.scheduleCron,
      scheduleEnabled: input.scheduleEnabled,
      surfaceUrl: input.surfaceUrl,
    });
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteImportTemplate(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteImportTemplate(user.userId, id);
    return { success: true, deletedId: id };
  }

  @Mutation(() => ImportRunType)
  updateImportRun(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateImportRunInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ImportRunType> {
    return this.service.updateImportRunSurfaceUrl(
      user.userId,
      id,
      input.surfaceUrl,
    );
  }

  @Mutation(() => Int)
  async detachApplicationsFromImportRun(
    @Args("importRunId", { type: () => ID }) importRunId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<number> {
    return this.service.detachApplicationsFromImportRun(
      user.userId,
      importRunId,
    );
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
