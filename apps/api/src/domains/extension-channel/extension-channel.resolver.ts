import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Resolver, Subscription } from "@nestjs/graphql";

import { ExtensionChannelStreamService } from "./extension-channel.stream.service";
import { ExtensionChannelEventType } from "./extension-channel-event.type";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ExtensionChannelResolver {
  constructor(private readonly stream: ExtensionChannelStreamService) {}

  @Subscription(() => ExtensionChannelEventType, {
    name: "extensionChannel",
    // graphql-js passes each iterable value as Subscription rootValue; default resolver reads rootValue.extensionChannel.
    resolve: (payload: ExtensionChannelEventType) => payload,
  })
  extensionChannel(@CurrentUser() user: { userId: string }) {
    return this.stream.eventsForUser(user.userId);
  }
}
