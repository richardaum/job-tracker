import { AuthModule } from "@api/domains/auth/auth.module";
import { Module } from "@nestjs/common";

import { ExtensionChannelResolver } from "./extension-channel.resolver";
import { ExtensionChannelStreamService } from "./extension-channel.stream.service";
import { GraphqlSseAuthService } from "./graphql-sse-auth.service";

@Module({
  imports: [AuthModule],
  providers: [
    ExtensionChannelResolver,
    ExtensionChannelStreamService,
    GraphqlSseAuthService,
  ],
  exports: [GraphqlSseAuthService, ExtensionChannelStreamService],
})
export class ExtensionChannelModule {}
