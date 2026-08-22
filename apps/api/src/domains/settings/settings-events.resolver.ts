import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Resolver, Subscription } from "@nestjs/graphql";

import { SettingsEventBus } from "./settings-event.bus";
import { AiUsageChangedEventType } from "./settings-event.types";
import { AiUsageChanged } from "./settings.events";

@Resolver()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class SettingsEventsResolver {
  constructor(private readonly eventBus: SettingsEventBus) {}

  @Subscription(() => AiUsageChangedEventType)
  async *aiUsageChanged(@CurrentUser() user: { userId: string }): AsyncIterable<AiUsageChangedEventType> {
    const bus = this.eventBus.forUser(user.userId);
    for await (const event of bus.eventsOf(AiUsageChanged)) {
      yield { trialCallsUsed: event.trialCallsUsed, hasOpenAiKey: event.hasOpenAiKey };
    }
  }
}
