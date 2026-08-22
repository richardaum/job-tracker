import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { ExtensionActivityReported } from "@api/domains/extension-activity/extension-activity.events";
import { ExtensionActivityService } from "@api/domains/extension-activity/extension-activity.service";
import { ExtensionActivityEventBus } from "@api/domains/extension-activity/extension-activity-event.bus";
import { ExtensionActivityEvent } from "@api/domains/extension-activity/extension-activity-event.type";
import { ReportExtensionActivityInput } from "@api/domains/extension-activity/report-extension-activity.input";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";

@Resolver()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class ExtensionActivityResolver {
  constructor(
    private readonly service: ExtensionActivityService,
    private readonly eventBus: ExtensionActivityEventBus,
  ) {}

  @Query(() => [ExtensionActivityEvent])
  extensionActivityEvents(
    @CurrentUser() user: { userId: string },
    @Args("limit", { type: () => Int, nullable: true }) limit?: number | null,
  ): Promise<ExtensionActivityEvent[]> {
    return this.service.listActivityEvents(user.userId, limit);
  }

  @Mutation(() => ExtensionActivityEvent)
  reportExtensionActivity(
    @Args("input", { type: () => ReportExtensionActivityInput })
    input: ReportExtensionActivityInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ExtensionActivityEvent> {
    return this.service.reportActivity(user.userId, input);
  }

  @Subscription(() => ExtensionActivityEvent, { name: "extensionActivityEvents" })
  async *subscribeExtensionActivityEvents(
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<ExtensionActivityEvent> {
    const bus = this.eventBus.forUser(user.userId);
    for await (const event of bus.eventsOf(ExtensionActivityReported)) {
      yield event.payload;
    }
  }
}
